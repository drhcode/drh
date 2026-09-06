/**
 * Dashboard date ranges (spec §45).
 *
 * Every range also produces the immediately preceding window of equal length,
 * which is what the "↑ 18.4%" comparisons are measured against.
 */

export const RANGE_PRESETS = [
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'this_year',
  'custom',
] as const;

export type RangePreset = (typeof RANGE_PRESETS)[number];

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
  last_90_days: 'Last 90 days',
  this_year: 'This year',
  custom: 'Custom',
};

export interface DateRange {
  /** YYYY-MM-DD, inclusive. */
  startDate: string;
  endDate: string;
}

export interface ResolvedRange {
  preset: RangePreset;
  label: string;
  current: DateRange;
  previous: DateRange;
  days: number;
}

const iso = (date: Date): string => date.toISOString().slice(0, 10);

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function inclusiveDays(range: DateRange): number {
  const start = new Date(`${range.startDate}T00:00:00Z`).getTime();
  const end = new Date(`${range.endDate}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

/** The equal-length window immediately before `range`. */
export function previousPeriod(range: DateRange): DateRange {
  const days = inclusiveDays(range);
  const start = new Date(`${range.startDate}T00:00:00Z`);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - (days - 1));
  return { startDate: iso(previousStart), endDate: iso(previousEnd) };
}

export function resolveRange(
  preset: string | undefined,
  from?: string,
  to?: string,
): ResolvedRange {
  const safePreset: RangePreset = (RANGE_PRESETS as readonly string[]).includes(preset ?? '')
    ? (preset as RangePreset)
    : 'last_30_days';

  let current: DateRange;

  switch (safePreset) {
    case 'today':
      current = { startDate: iso(daysAgo(0)), endDate: iso(daysAgo(0)) };
      break;
    case 'yesterday':
      current = { startDate: iso(daysAgo(1)), endDate: iso(daysAgo(1)) };
      break;
    case 'last_7_days':
      current = { startDate: iso(daysAgo(6)), endDate: iso(daysAgo(0)) };
      break;
    case 'last_90_days':
      current = { startDate: iso(daysAgo(89)), endDate: iso(daysAgo(0)) };
      break;
    case 'this_year': {
      const start = new Date();
      start.setUTCMonth(0, 1);
      start.setUTCHours(0, 0, 0, 0);
      current = { startDate: iso(start), endDate: iso(daysAgo(0)) };
      break;
    }
    case 'custom': {
      const valid = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
      current = valid(from) && valid(to)
        ? { startDate: from!, endDate: to! }
        : { startDate: iso(daysAgo(29)), endDate: iso(daysAgo(0)) };
      break;
    }
    case 'last_30_days':
    default:
      current = { startDate: iso(daysAgo(29)), endDate: iso(daysAgo(0)) };
  }

  return {
    preset: safePreset,
    label: RANGE_LABELS[safePreset],
    current,
    previous: previousPeriod(current),
    days: inclusiveDays(current),
  };
}

/** Formats a range for display, e.g. "1 – 30 Sep 2026". */
export function formatRange(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const start = new Date(`${range.startDate}T00:00:00Z`);
  const end = new Date(`${range.endDate}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' });

  if (range.startDate === range.endDate) return formatter.format(start);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}
