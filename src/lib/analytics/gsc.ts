import { cache } from 'react';
import { serverEnv, isGscConfigured } from '@/lib/env';
import { googleFetch, GoogleApiError, safeReport, type ReportResult } from './google-client';
import type { DateRange } from './date-range';

/**
 * Google Search Console API (spec §47).
 *
 * Search Console data lags by two to three days; the dashboard states this
 * rather than presenting yesterday's zero as a decline.
 */

interface GscRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface GscResponse {
  rows?: GscRow[];
}

export interface GscTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscRowView {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function endpoint(): string {
  const site = encodeURIComponent(serverEnv.gscSiteUrl!);
  return `https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`;
}

async function query(
  range: DateRange,
  dimensions: string[],
  rowLimit = 25,
): Promise<GscRow[]> {
  if (!isGscConfigured) throw new GoogleApiError('Search Console is not configured');

  const response = await googleFetch<GscResponse>(endpoint(), {
    startDate: range.startDate,
    endDate: range.endDate,
    dimensions,
    rowLimit,
    dataState: 'final',
  });

  return response.rows ?? [];
}

function toView(row: GscRow): GscRowView {
  return {
    key: row.keys?.[0] ?? '(unknown)',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: (row.ctr ?? 0) * 100,
    position: row.position ?? 0,
  };
}

export const getGscTotals = cache(
  async (range: DateRange): Promise<ReportResult<GscTotals>> =>
    safeReport(async () => {
      const rows = await query(range, [], 1);
      const row = rows[0];
      return {
        clicks: row?.clicks ?? 0,
        impressions: row?.impressions ?? 0,
        ctr: (row?.ctr ?? 0) * 100,
        position: row?.position ?? 0,
      };
    }),
);

export const getGscQueries = cache(
  async (range: DateRange, limit = 25): Promise<ReportResult<GscRowView[]>> =>
    safeReport(async () => (await query(range, ['query'], limit)).map(toView)),
);

export const getGscPages = cache(
  async (range: DateRange, limit = 25): Promise<ReportResult<GscRowView[]>> =>
    safeReport(async () => (await query(range, ['page'], limit)).map(toView)),
);

export const getGscCountries = cache(
  async (range: DateRange, limit = 10): Promise<ReportResult<GscRowView[]>> =>
    safeReport(async () => (await query(range, ['country'], limit)).map(toView)),
);

export const getGscDevices = cache(
  async (range: DateRange): Promise<ReportResult<GscRowView[]>> =>
    safeReport(async () => (await query(range, ['device'], 5)).map(toView)),
);
