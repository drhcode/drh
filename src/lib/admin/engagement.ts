import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { DateRange } from '@/lib/analytics/date-range';

/**
 * First-party content engagement (spec §91).
 *
 * Answers "which case studies actually get read, and which ones make people
 * act?" from our own `page_events` table — no cookie, no visitor identifier, and
 * it keeps working when GA4 is not connected.
 */

export interface ContentEngagementRow {
  slug: string;
  label: string;
  views: number;
  ctaClicks: number;
  outboundClicks: number;
  /** CTA clicks as a share of views. Null until there is at least one view. */
  actionRate: number | null;
}

interface EventRow {
  event_name: string;
  entity_type: string | null;
  metadata: Record<string, unknown> | null;
}

async function collect(
  range: DateRange,
  entityType: 'project' | 'service',
): Promise<ContentEngagementRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('page_events')
    .select('event_name, entity_type, metadata')
    .eq('entity_type', entityType)
    .gte('created_at', `${range.startDate}T00:00:00.000Z`)
    .lte('created_at', `${range.endDate}T23:59:59.999Z`)
    .limit(20_000);

  if (error) {
    console.error('[engagement] query failed', error.message);
    return [];
  }

  const grouped = new Map<string, ContentEngagementRow>();

  for (const row of (data ?? []) as EventRow[]) {
    const slug = typeof row.metadata?.slug === 'string' ? row.metadata.slug : null;
    if (!slug) continue;

    const entry =
      grouped.get(slug) ??
      { slug, label: slug, views: 0, ctaClicks: 0, outboundClicks: 0, actionRate: null };

    if (row.event_name === 'project_viewed' || row.event_name === 'service_viewed') {
      entry.views += 1;
    }
    if (row.event_name === 'case_study_cta_clicked') entry.ctaClicks += 1;
    if (row.event_name === 'outbound_project_clicked') entry.outboundClicks += 1;

    grouped.set(slug, entry);
  }

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      actionRate: entry.views > 0 ? (entry.ctaClicks / entry.views) * 100 : null,
    }))
    .sort((a, b) => b.views - a.views);
}

export const getProjectEngagement = (range: DateRange) => collect(range, 'project');
export const getServiceEngagement = (range: DateRange) => collect(range, 'service');
