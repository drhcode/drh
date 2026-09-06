'use client';

import * as React from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn, formatNumber } from '@/lib/utils';

/**
 * Admin charts.
 *
 * Colours come from the --chart-* tokens, so light and dark themes stay
 * consistent with the rest of the system and no chart hard-codes a hex value.
 * Axes are quiet, gridlines are horizontal only, and every series is labelled —
 * the data should carry the meaning, not the decoration.
 */

const AXIS_STYLE = { fontSize: 11, fill: 'var(--subtle-foreground)' } as const;

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-raised px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label ? formatDay(label) : ''}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: entry.color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface TrafficLeadsPoint {
  date: string;
  users: number;
  sessions: number;
  leads: number;
}

/** Traffic and leads over time — the dashboard's main chart (spec §89). */
export function TrafficLeadsChart({ data }: { data: TrafficLeadsPoint[] }) {
  const hasLeads = data.some((point) => point.leads > 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            yAxisId="left"
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          {hasLeads && (
            <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={30} />
          )}

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-strong)' }} />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="users"
            name="Visitors"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#usersFill)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="var(--chart-2)"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 3"
          />
          {hasLeads && (
            <Bar
              yAxisId="right"
              dataKey="leads"
              name="Leads"
              fill="var(--chart-3)"
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Ranked horizontal bar list.
 *
 * Preferred over a pie chart for source/page breakdowns: comparing lengths is
 * far more accurate than comparing angles, and the labels stay readable.
 */
export function BarList({
  items,
  valueLabel,
  emptyLabel = 'No data for this period.',
  className,
}: {
  items: { label: string; value: number; href?: string }[];
  valueLabel?: string;
  emptyLabel?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn('space-y-1', className)}>
      {valueLabel && (
        <p className="pb-1 text-right text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
          {valueLabel}
        </p>
      )}
      {items.map((item) => (
        <div key={item.label} className="relative flex items-center justify-between gap-3 py-1.5">
          <div
            className="absolute inset-y-0 left-0 rounded-sm bg-accent-subtle"
            style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            aria-hidden="true"
          />
          <span className="relative z-10 truncate pl-2 text-sm text-foreground" title={item.label}>
            {item.label}
          </span>
          <span className="relative z-10 shrink-0 pr-2 text-sm font-medium tabular-nums text-muted-foreground">
            {formatNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Compact sparkline used inside table rows. */
export function Sparkline({ data }: { data: { date: string; value: number }[] }) {
  if (data.length < 2) return null;

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-1)"
            strokeWidth={1.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
