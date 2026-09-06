import { JWT } from 'google-auth-library';
import { serverEnv } from '@/lib/env';

/**
 * Google service-account authentication for the reporting APIs.
 *
 * SERVER ONLY. The private key never leaves the server and is never included
 * in any response — the admin dashboard receives only the aggregated numbers
 * these calls return (spec §1, §74).
 *
 * Setup: create a service account in Google Cloud, enable the Analytics Data
 * API and the Search Console API, then grant its email Viewer access to the
 * GA4 property and the Search Console property.
 */

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

let cachedClient: JWT | null = null;

function getJwtClient(): JWT | null {
  if (!serverEnv.googleServiceAccountEmail || !serverEnv.googlePrivateKey) return null;

  cachedClient ??= new JWT({
    email: serverEnv.googleServiceAccountEmail,
    key: serverEnv.googlePrivateKey,
    scopes: SCOPES,
  });

  return cachedClient;
}

export class GoogleApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'GoogleApiError';
  }
}

/** Authenticated POST to a Google REST endpoint. */
export async function googleFetch<T>(url: string, body: unknown): Promise<T> {
  const client = getJwtClient();
  if (!client) throw new GoogleApiError('Google service account is not configured');

  const { token } = await client.getAccessToken();
  if (!token) throw new GoogleApiError('Could not obtain an access token');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new GoogleApiError(
      `Google API responded ${response.status}: ${detail.slice(0, 300)}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/**
 * Result wrapper used by every reporting call.
 *
 * The dashboard renders a "Not connected" or error state from this rather than
 * ever substituting placeholder numbers (spec §46: never display fake analytics).
 */
export type ReportResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not_configured' }
  | { status: 'error'; message: string };

export async function safeReport<T>(run: () => Promise<T>): Promise<ReportResult<T>> {
  try {
    return { status: 'ok', data: await run() };
  } catch (error) {
    if (error instanceof GoogleApiError && error.message.includes('not configured')) {
      return { status: 'not_configured' };
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown reporting error',
    };
  }
}
