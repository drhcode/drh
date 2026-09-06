'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlugZap, Users } from 'lucide-react';
import { AdminPanel, EmptyState, ErrorState } from './admin-ui';
import { formatNumber, cn } from '@/lib/utils';

interface BreakdownRow {
  label: string;
  users: number;
}

interface Realtime {
  activeUsers: number;
  perMinute: { minutesAgo: number; users: number }[];
  topPages: BreakdownRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
}

type Result =
  | { status: 'ok'; data: Realtime }
  | { status: 'not_configured' }
  | { status: 'error'; message: string };

/** How often to ask GA4 for a fresh count. */
const POLL_MS = 30_000;

/**
 * Live visitors on the site right now (GA4 realtime API).
 *
 * Polls rather than streams — GA4 has no push channel, and 30 seconds is well
 * inside its data freshness anyway. Polling pauses while the tab is hidden so a
 * backgrounded dashboard costs nothing.
 */
export function RealtimeVisitors() {
  const [result, setResult] = React.useState<Result | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const response = await fetch('/admin/api/realtime', { cache: 'no-store' });
        const data = (await response.json()) as Result;
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) setResult({ status: 'error', message: 'Could not reach the server.' });
      }
      // Chain the next poll only after this one settles, so a slow response
      // never causes requests to pile up.
      if (!cancelled) timer = setTimeout(load, POLL_MS);
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        void load();
      } else {
        clearTimeout(timer);
      }
    }

    void load();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!result) {
    return (
      <AdminPanel title="Right now">
        <div className="h-24 animate-pulse rounded-lg bg-surface-sunken" />
      </AdminPanel>
    );
  }

  if (result.status === 'not_configured') {
    return (
      <AdminPanel title="Right now">
        <EmptyState
          icon={<PlugZap className="size-5" />}
          title="Google Analytics is not connected"
          description="Live visitor counts come from the GA4 realtime API. Nothing is shown until a real property is linked."
          action={
            <Link href="/admin/integrations" className="text-sm font-medium text-accent hover:underline">
              Open integrations →
            </Link>
          }
        />
      </AdminPanel>
    );
  }

  if (result.status === 'error') {
    return (
      <AdminPanel title="Right now">
        <ErrorState title="Realtime request failed" description={result.message} />
      </AdminPanel>
    );
  }

  const { activeUsers, perMinute, topPages, countries, devices } = result.data;
  const peak = Math.max(...perMinute.map((p) => p.users), 1);

  return (
    <AdminPanel
      title="Right now"
      description="Visitors active in the last 30 minutes. Updates every 30 seconds."
      actions={
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span
              className={cn(
                'absolute inline-flex size-full rounded-full bg-success opacity-70',
                activeUsers > 0 && 'animate-ping',
              )}
            />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live
        </span>
      }
    >
      <div className="flex items-end gap-4">
        <div>
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatNumber(activeUsers)}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            {activeUsers === 1 ? 'visitor on the site' : 'visitors on the site'}
          </p>
        </div>

        {/* Per-minute activity, oldest on the left */}
        <div className="flex h-12 flex-1 items-end gap-px" aria-hidden="true">
          {perMinute.map((point) => (
            <span
              key={point.minutesAgo}
              className="flex-1 rounded-t-[2px] bg-accent/70"
              style={{ height: `${Math.max(4, (point.users / peak) * 100)}%` }}
              title={`${point.users} ${point.users === 1 ? 'visitor' : 'visitors'}, ${point.minutesAgo} min ago`}
            />
          ))}
        </div>
      </div>

      {activeUsers === 0 ? (
        <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
          Nobody is on the site at the moment.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 border-t border-border pt-5 sm:grid-cols-3">
          <RealtimeList title="Pages" rows={topPages} />
          <RealtimeList title="Countries" rows={countries} />
          <RealtimeList title="Devices" rows={devices} />
        </div>
      )}
    </AdminPanel>
  );
}

function RealtimeList({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-subtle-foreground">—</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rows.slice(0, 5).map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-muted-foreground" title={row.label}>
                {row.label}
              </span>
              <span className="shrink-0 tabular-nums text-foreground">{row.users}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
