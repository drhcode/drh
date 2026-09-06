import { cache } from 'react';
import { serverEnv, isGa4ReportingConfigured } from '@/lib/env';
import { googleFetch, GoogleApiError, safeReport, type ReportResult } from './google-client';
import type { DateRange } from './date-range';

/**
 * Google Analytics 4 Data API (spec §46).
 *
 * Every figure the admin dashboard shows for traffic comes from here. When the
 * property is not connected the caller receives `not_configured` and renders an
 * empty state — no placeholder numbers are ever produced.
 */

const ENDPOINT = (propertyId: string) =>
  `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

interface Ga4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

interface Ga4Response {
  rows?: Ga4Row[];
  rowCount?: number;
}

interface RunReportOptions {
  range: DateRange;
  metrics: string[];
  dimensions?: string[];
  limit?: number;
  orderByMetric?: string;
  keepEmptyRows?: boolean;
}

async function runReport({
  range,
  metrics,
  dimensions = [],
  limit = 25,
  orderByMetric,
  keepEmptyRows = false,
}: RunReportOptions): Promise<Ga4Response> {
  if (!isGa4ReportingConfigured) {
    throw new GoogleApiError('GA4 reporting is not configured');
  }

  return googleFetch<Ga4Response>(ENDPOINT(serverEnv.ga4PropertyId!), {
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    metrics: metrics.map((name) => ({ name })),
    dimensions: dimensions.map((name) => ({ name })),
    limit,
    keepEmptyRows,
    ...(orderByMetric
      ? { orderBys: [{ metric: { metricName: orderByMetric }, desc: true }] }
      : {}),
  });
}

const num = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate totals
// ─────────────────────────────────────────────────────────────────────────────
export interface Ga4Totals {
  users: number;
  newUsers: number;
  returningUsers: number;
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  averageEngagementTime: number;
  screenPageViews: number;
  conversions: number;
}

export const getGa4Totals = cache(
  async (range: DateRange): Promise<ReportResult<Ga4Totals>> =>
    safeReport(async () => {
      const response = await runReport({
        range,
        metrics: [
          'totalUsers',
          'newUsers',
          'sessions',
          'engagedSessions',
          'engagementRate',
          'userEngagementDuration',
          'screenPageViews',
        ],
        limit: 1,
      });

      const values = response.rows?.[0]?.metricValues ?? [];
      const users = num(values[0]?.value);
      const newUsers = num(values[1]?.value);
      const sessions = num(values[2]?.value);
      const engagementDuration = num(values[5]?.value);

      return {
        users,
        newUsers,
        returningUsers: Math.max(0, users - newUsers),
        sessions,
        engagedSessions: num(values[3]?.value),
        engagementRate: num(values[4]?.value),
        averageEngagementTime: sessions > 0 ? engagementDuration / sessions : 0,
        screenPageViews: num(values[6]?.value),
        conversions: 0,
      };
    }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Time series
// ─────────────────────────────────────────────────────────────────────────────
export interface TimeseriesPoint {
  date: string;
  users: number;
  sessions: number;
}

export const getGa4Timeseries = cache(
  async (range: DateRange): Promise<ReportResult<TimeseriesPoint[]>> =>
    safeReport(async () => {
      const response = await runReport({
        range,
        metrics: ['totalUsers', 'sessions'],
        dimensions: ['date'],
        limit: 400,
        keepEmptyRows: true,
      });

      return (response.rows ?? [])
        .map((row) => {
          const raw = row.dimensionValues?.[0]?.value ?? '';
          return {
            // GA4 returns YYYYMMDD
            date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
            users: num(row.metricValues?.[0]?.value),
            sessions: num(row.metricValues?.[1]?.value),
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Breakdowns
// ─────────────────────────────────────────────────────────────────────────────
export interface BreakdownRow {
  label: string;
  users: number;
  sessions?: number;
  extra?: string;
}

async function breakdown(
  range: DateRange,
  dimension: string,
  limit = 10,
  metrics: string[] = ['totalUsers', 'sessions'],
): Promise<BreakdownRow[]> {
  const response = await runReport({
    range,
    metrics,
    dimensions: [dimension],
    limit,
    orderByMetric: metrics[0],
  });

  return (response.rows ?? []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || '(not set)',
    users: num(row.metricValues?.[0]?.value),
    sessions: num(row.metricValues?.[1]?.value),
  }));
}

export const getGa4Channels = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'sessionDefaultChannelGroup', 12)),
);

export const getGa4Countries = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'country', 10)),
);

export const getGa4Cities = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'city', 10)),
);

export const getGa4Devices = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'deviceCategory', 5)),
);

export const getGa4Browsers = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'browser', 8)),
);

export const getGa4OperatingSystems = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'operatingSystem', 8)),
);

export const getGa4TopPages = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(async () => {
      const response = await runReport({
        range,
        metrics: ['screenPageViews', 'totalUsers', 'userEngagementDuration'],
        dimensions: ['pagePath'],
        limit: 15,
        orderByMetric: 'screenPageViews',
      });

      return (response.rows ?? []).map((row) => ({
        label: row.dimensionValues?.[0]?.value || '/',
        users: num(row.metricValues?.[1]?.value),
        sessions: num(row.metricValues?.[0]?.value),
      }));
    }),
);

export const getGa4LandingPages = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(() => breakdown(range, 'landingPagePlusQueryString', 12)),
);

export const getGa4ExitPages = cache(
  async (range: DateRange): Promise<ReportResult<BreakdownRow[]>> =>
    safeReport(async () => {
      const response = await runReport({
        range,
        metrics: ['sessions'],
        dimensions: ['unifiedPagePathScreen'],
        limit: 10,
        orderByMetric: 'sessions',
      });

      return (response.rows ?? []).map((row) => ({
        label: row.dimensionValues?.[0]?.value || '/',
        users: 0,
        sessions: num(row.metricValues?.[0]?.value),
      }));
    }),
);

export interface CampaignRow {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  users: number;
  sessions: number;
}

export const getGa4Campaigns = cache(
  async (range: DateRange): Promise<ReportResult<CampaignRow[]>> =>
    safeReport(async () => {
      const response = await runReport({
        range,
        metrics: ['totalUsers', 'sessions'],
        dimensions: [
          'sessionSource',
          'sessionMedium',
          'sessionCampaignName',
          'sessionManualAdContent',
          'sessionManualTerm',
        ],
        limit: 20,
        orderByMetric: 'totalUsers',
      });

      return (response.rows ?? []).map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        medium: row.dimensionValues?.[1]?.value || '(none)',
        campaign: row.dimensionValues?.[2]?.value || '(not set)',
        content: row.dimensionValues?.[3]?.value || '—',
        term: row.dimensionValues?.[4]?.value || '—',
        users: num(row.metricValues?.[0]?.value),
        sessions: num(row.metricValues?.[1]?.value),
      }));
    }),
);

/** Organic-search users only — used for the "Organic traffic" KPI. */
export const getGa4OrganicUsers = cache(
  async (range: DateRange): Promise<ReportResult<number>> =>
    safeReport(async () => {
      const rows = await breakdown(range, 'sessionDefaultChannelGroup', 20);
      return rows
        .filter((row) => row.label.toLowerCase().includes('organic'))
        .reduce((total, row) => total + row.users, 0);
    }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Realtime (spec: live visitor count on the dashboard)
// ─────────────────────────────────────────────────────────────────────────────
const REALTIME_ENDPOINT = (propertyId: string) =>
  `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`;

export interface Ga4Realtime {
  /** Visitors active in the last 30 minutes. */
  activeUsers: number;
  /** Per-minute activity for the last 30 minutes, oldest first. */
  perMinute: { minutesAgo: number; users: number }[];
  topPages: BreakdownRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
}

/**
 * Live visitor activity.
 *
 * Not cached with `cache()` — the whole point is that it is current, and the
 * dashboard polls it on an interval.
 */
export async function getGa4Realtime(): Promise<ReportResult<Ga4Realtime>> {
  return safeReport(async () => {
    if (!isGa4ReportingConfigured) {
      throw new GoogleApiError('GA4 reporting is not configured');
    }

    const endpoint = REALTIME_ENDPOINT(serverEnv.ga4PropertyId!);

    const [totals, minutes, pages, countries, devices] = await Promise.all([
      googleFetch<Ga4Response>(endpoint, { metrics: [{ name: 'activeUsers' }] }),
      googleFetch<Ga4Response>(endpoint, {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'minutesAgo' }],
        limit: 30,
      }),
      googleFetch<Ga4Response>(endpoint, {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'unifiedScreenName' }],
        limit: 8,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
      googleFetch<Ga4Response>(endpoint, {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'country' }],
        limit: 6,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
      googleFetch<Ga4Response>(endpoint, {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'deviceCategory' }],
        limit: 4,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
    ]);

    const toRows = (response: Ga4Response): BreakdownRow[] =>
      (response.rows ?? []).map((row) => ({
        label: row.dimensionValues?.[0]?.value || '(not set)',
        users: num(row.metricValues?.[0]?.value),
      }));

    // GA4 returns only the minutes that had activity; fill the rest with zero
    // so the sparkline has a stable 30-point shape.
    const byMinute = new Map<number, number>();
    for (const row of minutes.rows ?? []) {
      byMinute.set(Number(row.dimensionValues?.[0]?.value ?? 0), num(row.metricValues?.[0]?.value));
    }
    const perMinute = Array.from({ length: 30 }, (_, index) => {
      const minutesAgo = 29 - index;
      return { minutesAgo, users: byMinute.get(minutesAgo) ?? 0 };
    });

    return {
      activeUsers: num(totals.rows?.[0]?.metricValues?.[0]?.value),
      perMinute,
      topPages: toRows(pages),
      countries: toRows(countries),
      devices: toRows(devices),
    };
  });
}
