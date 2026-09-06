import Link from 'next/link';
import { PlugZap, TriangleAlert } from 'lucide-react';
import type { ReportResult } from '@/lib/analytics/google-client';
import { EmptyState, ErrorState } from './admin-ui';

/**
 * Renders the honest state of a reporting integration (spec §46).
 *
 * When GA4 or Search Console is not connected, or a call fails, we say so.
 * Sample or placeholder numbers are never substituted, because a dashboard that
 * quietly invents traffic is worse than one that admits it has none.
 */
export function ReportGate<T>({
  result,
  name,
  children,
}: {
  result: ReportResult<T>;
  name: string;
  children: (data: T) => React.ReactNode;
}) {
  if (result.status === 'not_configured') {
    return (
      <EmptyState
        icon={<PlugZap className="size-5" />}
        title={`${name} is not connected`}
        description={`Connect ${name} to see this data. No figures are shown until a real property is linked.`}
        action={
          <Link
            href="/admin/integrations"
            className="text-sm font-medium text-accent hover:underline"
          >
            Open integrations →
          </Link>
        }
      />
    );
  }

  if (result.status === 'error') {
    return (
      <div className="p-1">
        <ErrorState title={`${name} request failed`} description={result.message} />
      </div>
    );
  }

  return <>{children(result.data)}</>;
}

/** Inline banner for a partially configured dashboard. */
export function IntegrationBanner({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3">
      <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="flex-1 text-sm text-foreground">
        {missing.join(' and ')} {missing.length === 1 ? 'is' : 'are'} not connected, so those
        panels are empty rather than estimated.
      </p>
      <Link href="/admin/integrations" className="text-sm font-medium text-accent hover:underline">
        Connect
      </Link>
    </div>
  );
}
