import { CheckCircle2, CircleAlert, CircleSlash, ExternalLink } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import {
  isGa4ReportingConfigured,
  isGscConfigured,
  isResendConfigured,
  isTurnstileConfigured,
  publicEnv,
} from '@/lib/env';
import { getGa4Totals } from '@/lib/analytics/ga4';
import { getGscTotals } from '@/lib/analytics/gsc';
import { resolveRange } from '@/lib/analytics/date-range';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-ui';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Status = 'connected' | 'not_connected' | 'error';

interface Integration {
  key: string;
  label: string;
  description: string;
  status: Status;
  detail?: string;
  envKeys: string[];
  docs?: string;
}

/**
 * Integrations (spec §74).
 *
 * Every credential lives in an environment variable on the server. This page
 * reports whether each integration is configured and, for the reporting APIs,
 * whether a live call actually succeeds — it never renders a key, a token or a
 * private key, not even masked.
 */
export default async function AdminIntegrationsPage() {
  await requireCapability('integrations');

  const range = resolveRange('last_7_days');

  // A live probe is the only honest way to report "connected": the variables
  // being present does not prove the service account has access.
  const [ga4, gsc] = await Promise.all([
    isGa4ReportingConfigured ? getGa4Totals(range.current) : Promise.resolve(null),
    isGscConfigured ? getGscTotals(range.current) : Promise.resolve(null),
  ]);

  const ga4Status: Status = !isGa4ReportingConfigured
    ? 'not_connected'
    : ga4?.status === 'ok'
      ? 'connected'
      : 'error';

  const gscStatus: Status = !isGscConfigured
    ? 'not_connected'
    : gsc?.status === 'ok'
      ? 'connected'
      : 'error';

  const integrations: Integration[] = [
    {
      key: 'ga4',
      label: 'Google Analytics 4',
      description:
        'Traffic, engagement, sources and landing pages on the dashboard. The measurement ID also loads gtag on the public site, but only after analytics consent.',
      status: ga4Status,
      detail:
        ga4?.status === 'error'
          ? ga4.message
          : ga4Status === 'connected'
            ? 'Reporting API responding.'
            : undefined,
      envKeys: ['NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'GA4_PROPERTY_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'],
      docs: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
    },
    {
      key: 'gsc',
      label: 'Google Search Console',
      description:
        'Clicks, impressions, CTR and average position, plus the top query and page tables.',
      status: gscStatus,
      detail:
        gsc?.status === 'error'
          ? gsc.message
          : gscStatus === 'connected'
            ? 'Search Analytics API responding.'
            : undefined,
      envKeys: ['GSC_SITE_URL', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'],
      docs: 'https://developers.google.com/webmaster-tools/v1/searchanalytics/query',
    },
    {
      key: 'google_ads',
      label: 'Google Ads',
      description:
        'Conversion tracking for the project brief form. Fires only after marketing consent.',
      status: publicEnv.googleAdsId ? 'connected' : 'not_connected',
      envKeys: ['NEXT_PUBLIC_GOOGLE_ADS_ID', 'NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL'],
    },
    {
      key: 'meta_pixel',
      label: 'Meta Pixel',
      description: 'Campaign measurement for Meta Ads. Fires only after marketing consent.',
      status: publicEnv.metaPixelId ? 'connected' : 'not_connected',
      envKeys: ['NEXT_PUBLIC_META_PIXEL_ID'],
    },
    {
      key: 'clarity',
      label: 'Microsoft Clarity',
      description: 'Session recordings and heatmaps. Loads only after analytics consent.',
      status: publicEnv.clarityProjectId ? 'connected' : 'not_connected',
      envKeys: ['NEXT_PUBLIC_CLARITY_PROJECT_ID'],
    },
    {
      key: 'resend',
      label: 'Resend',
      description:
        'Delivers the internal lead notification, the visitor confirmation and newsletter opt-in emails.',
      status: isResendConfigured ? 'connected' : 'not_connected',
      detail: isResendConfigured
        ? undefined
        : 'Without this, enquiries are still stored but no email is sent.',
      envKeys: ['RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_ADMIN_TO'],
      docs: 'https://resend.com/docs',
    },
    {
      key: 'turnstile',
      label: 'Cloudflare Turnstile',
      description: 'Spam protection on the project brief form.',
      status: isTurnstileConfigured ? 'connected' : 'not_connected',
      detail: isTurnstileConfigured
        ? undefined
        : 'The honeypot and rate limiter still apply, but bot protection is weaker.',
      envKeys: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'],
      docs: 'https://developers.cloudflare.com/turnstile/',
    },
    {
      key: 'calendly',
      label: 'Calendly',
      description: 'Optional booking link offered alongside the enquiry form.',
      status: publicEnv.calendlyUrl ? 'connected' : 'not_connected',
      envKeys: ['NEXT_PUBLIC_CALENDLY_URL'],
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Integrations"
        description="Connection status for every external service. Credentials live in server environment variables and are never displayed here."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.key} integration={integration} />
        ))}
      </div>

      <AdminPanel title="How credentials are handled" className="mt-6">
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          <li className="flex gap-2.5">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            Secrets are read from environment variables on the server only. Nothing prefixed
            <code className="mx-1 rounded bg-surface-sunken px-1 py-0.5 text-xs">NEXT_PUBLIC_</code>
            is a secret — those are measurement IDs, which are public by design.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            The Google service-account private key never leaves the server. Reporting calls are
            made server-side and only aggregated numbers reach this dashboard.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            Analytics and advertising scripts do not load at all until a visitor accepts the
            matching cookie category.
          </li>
        </ul>
      </AdminPanel>
    </>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const config = {
    connected: {
      icon: CheckCircle2,
      badge: 'success' as const,
      label: 'Connected',
      tone: 'text-success',
    },
    not_connected: {
      icon: CircleSlash,
      badge: 'default' as const,
      label: 'Not connected',
      tone: 'text-subtle-foreground',
    },
    error: {
      icon: CircleAlert,
      badge: 'danger' as const,
      label: 'Error',
      tone: 'text-danger',
    },
  }[integration.status];

  const Icon = config.icon;

  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className={cn('size-4 shrink-0', config.tone)} aria-hidden="true" />
          <h2 className="text-sm font-medium text-foreground">{integration.label}</h2>
        </div>
        <Badge variant={config.badge}>{config.label}</Badge>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        {integration.description}
      </p>

      {integration.detail && (
        <p
          className={cn(
            'mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed',
            integration.status === 'error'
              ? 'bg-danger/8 text-danger'
              : 'bg-surface-sunken text-muted-foreground',
          )}
        >
          {integration.detail}
        </p>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
          Environment variables
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {integration.envKeys.map((key) => (
            <li
              key={key}
              className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {key}
            </li>
          ))}
        </ul>

        {integration.docs && (
          <a
            href={integration.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Documentation
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </article>
  );
}
