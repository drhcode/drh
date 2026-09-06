import { createHash, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { serverEnv, isTurnstileConfigured } from '@/lib/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Request-derived signals used for spam protection and attribution.
 *
 * Privacy note (spec §39, §96): the raw IP address is never stored. It is used
 * only to derive a salted, rotating hash for rate limiting, and the salt
 * changes daily so the hashes cannot be correlated over time.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
let saltDay = -1;
let dailySalt = randomBytes(16).toString('hex');

function rotatingSalt(): string {
  const day = Math.floor(Date.now() / DAY_MS);
  if (day !== saltDay) {
    saltDay = day;
    dailySalt = randomBytes(16).toString('hex');
  }
  return dailySalt;
}

export interface RequestContext {
  /** sha256(ip + rotating salt). Never reversible to an address. */
  identifierHash: string;
  country: string | null;
  city: string | null;
  device: 'desktop' | 'mobile' | 'tablet' | null;
  referrer: string | null;
  userAgentSummary: string | null;
}

function classifyDevice(userAgent: string): RequestContext['device'] {
  if (!userAgent) return null;
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent)) return 'tablet';
  if (/Mobi|iPhone|Android|Windows Phone/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

export async function getRequestContext(): Promise<RequestContext> {
  const headerList = await headers();

  const forwarded = headerList.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';

  const userAgent = headerList.get('user-agent') ?? '';

  return {
    identifierHash: createHash('sha256').update(`${ip}:${rotatingSalt()}`).digest('hex'),
    // Set by Vercel / Cloudflare at the edge. Coarse location only.
    country: headerList.get('x-vercel-ip-country') ?? headerList.get('cf-ipcountry') ?? null,
    city: (() => {
      const raw = headerList.get('x-vercel-ip-city');
      return raw ? decodeURIComponent(raw) : null;
    })(),
    device: classifyDevice(userAgent),
    referrer: headerList.get('referer'),
    userAgentSummary: userAgent ? userAgent.slice(0, 200) : null,
  };
}

/**
 * Fixed-window rate limit backed by PostgreSQL (spec §38 step 4).
 * Fails open when Supabase is not configured so local development works, but
 * the honeypot and Turnstile checks still apply.
 */
export async function checkRateLimit(
  bucket: string,
  identifierHash: string,
  { limit, windowMinutes }: { limit: number; windowMinutes: number },
): Promise<{ allowed: boolean }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { allowed: true };

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .eq('identifier_hash', identifierHash)
    .gte('created_at', since);

  if (error) return { allowed: true };
  if ((count ?? 0) >= limit) return { allowed: false };

  await supabase.from('rate_limits').insert({ bucket, identifier_hash: identifierHash });
  return { allowed: true };
}

/**
 * Cloudflare Turnstile verification (spec §38 step 3).
 *
 * When Turnstile is not configured the check is skipped — but the honeypot and
 * rate limiter still run, so an unconfigured deployment is not defenceless.
 */
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!isTurnstileConfigured) return true;
  if (!token) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: serverEnv.turnstileSecretKey!,
        response: token,
      }),
      cache: 'no-store',
    });

    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

/** Derives a channel label from UTM data and referrer, for lead-source reporting. */
export function deriveSource(input: {
  utmSource?: string | null;
  utmMedium?: string | null;
  referrer?: string | null;
}): string {
  const medium = input.utmMedium?.toLowerCase() ?? '';
  const source = input.utmSource?.toLowerCase() ?? '';

  if (medium.includes('cpc') || medium.includes('ppc') || medium.includes('paid')) {
    if (source.includes('google')) return 'google_ads';
    if (source.includes('facebook') || source.includes('meta') || source.includes('instagram')) {
      return 'meta_ads';
    }
    return 'paid';
  }
  if (medium.includes('email') || source.includes('newsletter')) return 'email';
  if (medium.includes('social') || /facebook|instagram|linkedin|twitter|x\.com|tiktok/.test(source)) {
    return 'social';
  }
  if (source) return source;

  const referrer = input.referrer ?? '';
  if (!referrer) return 'direct';
  if (/google\.|bing\.|duckduckgo\.|yahoo\./.test(referrer)) return 'organic';
  if (/facebook\.|instagram\.|linkedin\.|twitter\.|x\.com|tiktok\./.test(referrer)) return 'social';
  return 'referral';
}
