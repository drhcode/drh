import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { LeadActivityRow, LeadNoteRow, LeadRow, LeadStatus } from '@/types/database';
import type { DateRange } from '@/lib/analytics/date-range';

/**
 * Lead reporting and CRM queries (spec §48–§53).
 *
 * Everything here reads from PostgreSQL through the service-role client and is
 * only ever reached after the caller has passed a `leads` capability check.
 */

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'won',
  'lost',
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal sent',
  won: 'Won',
  lost: 'Lost',
};

/** Pipeline column accents — one hue per stage, all from the token palette. */
export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'text-info',
  contacted: 'text-chart-6',
  qualified: 'text-accent',
  proposal_sent: 'text-warning',
  won: 'text-success',
  lost: 'text-subtle-foreground',
};

export interface LeadFilters {
  status?: LeadStatus | 'all';
  service?: string;
  budget?: string;
  source?: string;
  country?: string;
  query?: string;
  from?: string;
  to?: string;
  includeArchived?: boolean;
}

export async function getLeads(filters: LeadFilters = {}, limit = 200): Promise<LeadRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase.from('leads').select('*');

  if (!filters.includeArchived) query = query.eq('is_archived', false);
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.service) query = query.eq('service', filters.service);
  if (filters.budget) query = query.eq('budget', filters.budget);
  if (filters.source) query = query.eq('source', filters.source);
  if (filters.country) query = query.eq('country', filters.country);
  if (filters.from) query = query.gte('created_at', `${filters.from}T00:00:00.000Z`);
  if (filters.to) query = query.lte('created_at', `${filters.to}T23:59:59.999Z`);

  if (filters.query) {
    // Strip the characters PostgREST uses as filter syntax before interpolating.
    const safe = filters.query.replace(/[,()%*]/g, ' ').trim();
    if (safe) {
      const pattern = `%${safe}%`;
      query = query.or(
        `name.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern}`,
      );
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error('[leads] query failed', error.message);
    return [];
  }

  return (data as LeadRow[] | null) ?? [];
}

export async function getLead(id: string): Promise<{
  lead: LeadRow;
  notes: LeadNoteRow[];
  activity: LeadActivityRow[];
} | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  const lead = data as LeadRow | null;
  if (!lead) return null;

  const [{ data: notes }, { data: activity }] = await Promise.all([
    supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase
      .from('lead_activity')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return {
    lead,
    notes: (notes as LeadNoteRow[] | null) ?? [],
    activity: (activity as LeadActivityRow[] | null) ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Business performance (spec §50, §90)
// ─────────────────────────────────────────────────────────────────────────────
export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  pipelineValue: number;
  wonValue: number;
  averageProjectValue: number;
  qualifiedRate: number;
  winRate: number;
  bestSource: { label: string; leads: number } | null;
  bestService: { label: string; leads: number } | null;
  bestLandingPage: { label: string; leads: number } | null;
}

const emptyStatusCounts = (): Record<LeadStatus, number> => ({
  new: 0,
  contacted: 0,
  qualified: 0,
  proposal_sent: 0,
  won: 0,
  lost: 0,
});

function topOf(rows: (string | null)[]): { label: string; leads: number } | null {
  const counts = new Map<string, number>();
  for (const value of rows) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? { label: best[0], leads: best[1] } : null;
}

export async function getLeadStats(range?: DateRange): Promise<LeadStats> {
  const supabase = getSupabaseAdminClient();

  const base: LeadStats = {
    total: 0,
    byStatus: emptyStatusCounts(),
    pipelineValue: 0,
    wonValue: 0,
    averageProjectValue: 0,
    qualifiedRate: 0,
    winRate: 0,
    bestSource: null,
    bestService: null,
    bestLandingPage: null,
  };

  if (!supabase) return base;

  let query = supabase
    .from('leads')
    .select('status, estimated_value, won_value, source, service, landing_page')
    .eq('is_archived', false);

  if (range) {
    query = query
      .gte('created_at', `${range.startDate}T00:00:00.000Z`)
      .lte('created_at', `${range.endDate}T23:59:59.999Z`);
  }

  const { data } = await query;
  const rows = (data ?? []) as {
    status: LeadStatus;
    estimated_value: number | null;
    won_value: number | null;
    source: string | null;
    service: string | null;
    landing_page: string | null;
  }[];

  const byStatus = emptyStatusCounts();
  let pipelineValue = 0;
  let wonValue = 0;
  let wonCount = 0;

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

    // Open pipeline excludes closed stages.
    if (row.status !== 'won' && row.status !== 'lost') {
      pipelineValue += Number(row.estimated_value ?? 0);
    }
    if (row.status === 'won') {
      wonValue += Number(row.won_value ?? row.estimated_value ?? 0);
      wonCount += 1;
    }
  }

  const total = rows.length;
  const qualified = byStatus.qualified + byStatus.proposal_sent + byStatus.won;

  return {
    total,
    byStatus,
    pipelineValue,
    wonValue,
    averageProjectValue: wonCount > 0 ? wonValue / wonCount : 0,
    qualifiedRate: total > 0 ? (qualified / total) * 100 : 0,
    winRate: total > 0 ? (byStatus.won / total) * 100 : 0,
    bestSource: topOf(rows.map((row) => row.source)),
    bestService: topOf(rows.map((row) => row.service)),
    bestLandingPage: topOf(rows.map((row) => row.landing_page)),
  };
}

/**
 * Lead-to-revenue attribution (spec §53).
 *
 * Visitor counts come from GA4 and are merged in by the caller; this function
 * owns the half that lives in our own database, so the report degrades to
 * "leads by source" rather than breaking when GA4 is not connected.
 */
export interface SourcePerformanceRow {
  source: string;
  leads: number;
  qualified: number;
  won: number;
  lost: number;
  revenue: number;
  pipeline: number;
}

export async function getLeadsBySource(range?: DateRange): Promise<SourcePerformanceRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from('leads')
    .select('source, status, estimated_value, won_value')
    .eq('is_archived', false);

  if (range) {
    query = query
      .gte('created_at', `${range.startDate}T00:00:00.000Z`)
      .lte('created_at', `${range.endDate}T23:59:59.999Z`);
  }

  const { data } = await query;
  const grouped = new Map<string, SourcePerformanceRow>();

  for (const row of (data ?? []) as {
    source: string | null;
    status: LeadStatus;
    estimated_value: number | null;
    won_value: number | null;
  }[]) {
    const key = row.source ?? 'direct';
    const entry =
      grouped.get(key) ??
      { source: key, leads: 0, qualified: 0, won: 0, lost: 0, revenue: 0, pipeline: 0 };

    entry.leads += 1;
    if (['qualified', 'proposal_sent', 'won'].includes(row.status)) entry.qualified += 1;
    if (row.status === 'won') {
      entry.won += 1;
      entry.revenue += Number(row.won_value ?? row.estimated_value ?? 0);
    }
    if (row.status === 'lost') entry.lost += 1;
    if (row.status !== 'won' && row.status !== 'lost') {
      entry.pipeline += Number(row.estimated_value ?? 0);
    }

    grouped.set(key, entry);
  }

  return [...grouped.values()].sort((a, b) => b.leads - a.leads);
}

/** Daily lead counts, aligned with the traffic chart on the dashboard. */
export async function getLeadTimeseries(
  range: DateRange,
): Promise<{ date: string; leads: number }[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('leads')
    .select('created_at')
    .eq('is_archived', false)
    .gte('created_at', `${range.startDate}T00:00:00.000Z`)
    .lte('created_at', `${range.endDate}T23:59:59.999Z`);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { created_at: string }[]) {
    const day = row.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([date, leads]) => ({ date, leads }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Distinct values used to populate the lead filter dropdowns. */
export async function getLeadFilterOptions(): Promise<{
  services: string[];
  budgets: string[];
  sources: string[];
  countries: string[];
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { services: [], budgets: [], sources: [], countries: [] };

  const { data } = await supabase
    .from('leads')
    .select('service, budget, source, country')
    .limit(1000);

  const unique = (values: (string | null)[]) =>
    [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

  const rows = (data ?? []) as {
    service: string | null;
    budget: string | null;
    source: string | null;
    country: string | null;
  }[];

  return {
    services: unique(rows.map((row) => row.service)),
    budgets: unique(rows.map((row) => row.budget)),
    sources: unique(rows.map((row) => row.source)),
    countries: unique(rows.map((row) => row.country)),
  };
}
