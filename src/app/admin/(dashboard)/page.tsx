import Link from 'next/link';
import { ArrowRight, Inbox } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { resolveRange, formatRange } from '@/lib/analytics/date-range';
import {
  getGa4Channels,
  getGa4LandingPages,
  getGa4OrganicUsers,
  getGa4Timeseries,
  getGa4Totals,
} from '@/lib/analytics/ga4';
import { getGscTotals } from '@/lib/analytics/gsc';
import {
  getLeadStats,
  getLeadTimeseries,
  getLeads,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from '@/lib/admin/leads';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { isGa4ReportingConfigured, isGscConfigured } from '@/lib/env';
import { AdminPageHeader, AdminPanel, StatCard, EmptyState } from '@/components/admin/admin-ui';
import { DateRangePicker } from '@/components/admin/date-range-picker';
import { TrafficLeadsChart, BarList } from '@/components/admin/charts';
import { ReportGate, IntegrationBanner } from '@/components/admin/integration-notice';
import { LeadStatusBadge } from '@/components/admin/lead-status-badge';
import { RealtimeVisitors } from '@/components/admin/realtime-visitors';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, percentChange } from '@/lib/utils';
import type { ActivityLogRow } from '@/types/database';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string; denied?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const admin = await requireCapability('dashboard');
  const { range: rangeParam, from, to, denied } = await searchParams;
  const range = resolveRange(rangeParam, from, to);

  const canSeeLeads = can(admin.role, 'leads');

  const [
    totals,
    previousTotals,
    timeseries,
    channels,
    landingPages,
    organicUsers,
    previousOrganic,
    gscTotals,
    previousGsc,
    leadStats,
    previousLeadStats,
    leadSeries,
    recentLeads,
    activity,
  ] = await Promise.all([
    getGa4Totals(range.current),
    getGa4Totals(range.previous),
    getGa4Timeseries(range.current),
    getGa4Channels(range.current),
    getGa4LandingPages(range.current),
    getGa4OrganicUsers(range.current),
    getGa4OrganicUsers(range.previous),
    getGscTotals(range.current),
    getGscTotals(range.previous),
    canSeeLeads ? getLeadStats(range.current) : null,
    canSeeLeads ? getLeadStats(range.previous) : null,
    canSeeLeads ? getLeadTimeseries(range.current) : Promise.resolve([]),
    canSeeLeads ? getLeads({}, 6) : Promise.resolve([]),
    getRecentActivity(),
  ]);

  const missing: string[] = [];
  if (!isGa4ReportingConfigured) missing.push('Google Analytics');
  if (!isGscConfigured) missing.push('Search Console');

  // Merge GA4 daily traffic with our own daily lead counts.
  const leadsByDay = new Map(leadSeries.map((point) => [point.date, point.leads]));
  const chartData =
    timeseries.status === 'ok'
      ? timeseries.data.map((point) => ({
          ...point,
          leads: leadsByDay.get(point.date) ?? 0,
        }))
      : leadSeries.map((point) => ({
          date: point.date,
          users: 0,
          sessions: 0,
          leads: point.leads,
        }));

  const current = totals.status === 'ok' ? totals.data : null;
  const previous = previousTotals.status === 'ok' ? previousTotals.data : null;

  const conversionRate =
    current && current.users > 0 && leadStats ? (leadStats.total / current.users) * 100 : null;
  const previousConversionRate =
    previous && previous.users > 0 && previousLeadStats
      ? (previousLeadStats.total / previous.users) * 100
      : null;

  return (
    <>
      <AdminPageHeader
        title={`Good to see you, ${admin.full_name?.split(' ')[0] ?? 'there'}`}
        description={`How drh.al is performing — ${formatRange(range.current)}.`}
        actions={<DateRangePicker preset={range.preset} range={range.current} />}
      />

      {denied && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-foreground">
          Your role does not have access to <strong>{denied}</strong>.
        </div>
      )}

      <IntegrationBanner missing={missing} />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitors"
          value={current ? formatNumber(current.users) : '—'}
          change={current && previous ? percentChange(current.users, previous.users) : null}
        />
        <StatCard
          label="New leads"
          value={leadStats ? formatNumber(leadStats.total) : '—'}
          change={
            leadStats && previousLeadStats
              ? percentChange(leadStats.total, previousLeadStats.total)
              : null
          }
        />
        <StatCard
          label="Conversion rate"
          value={conversionRate != null ? `${conversionRate.toFixed(2)}%` : '—'}
          change={
            conversionRate != null && previousConversionRate != null
              ? percentChange(conversionRate, previousConversionRate)
              : null
          }
          hint={conversionRate == null ? 'Needs GA4' : undefined}
        />
        <StatCard
          label="Organic visitors"
          value={organicUsers.status === 'ok' ? formatNumber(organicUsers.data) : '—'}
          change={
            organicUsers.status === 'ok' && previousOrganic.status === 'ok'
              ? percentChange(organicUsers.data, previousOrganic.data)
              : null
          }
        />
      </div>

      {/* Live visitors */}
      <div className="mt-6">
        <RealtimeVisitors />
      </div>

      {/* Main chart */}
      <div className="mt-6">
        <AdminPanel
          title="Traffic and leads"
          description={
            timeseries.status === 'ok'
              ? 'Visitors and sessions from GA4, leads from the CRM.'
              : 'Leads from the CRM. Connect GA4 to overlay traffic.'
          }
        >
          {chartData.length === 0 ? (
            <EmptyState
              title="No data for this period"
              description="Once GA4 is connected or the first lead arrives, this chart fills in."
            />
          ) : (
            <TrafficLeadsChart data={chartData} />
          )}
        </AdminPanel>
      </div>

      {/* Business performance (spec §90) */}
      {leadStats && (
        <div className="mt-6">
          <AdminPanel
            title="Business performance"
            description="Only values derived from real leads in the CRM."
            actions={
              <Link
                href="/admin/leads"
                className="text-xs font-medium text-accent hover:underline"
              >
                Open leads →
              </Link>
            }
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Qualified" value={formatNumber(leadStats.byStatus.qualified)} />
              <Metric label="Proposals sent" value={formatNumber(leadStats.byStatus.proposal_sent)} />
              <Metric label="Won projects" value={formatNumber(leadStats.byStatus.won)} />
              <Metric label="Lead → qualified" value={`${leadStats.qualifiedRate.toFixed(1)}%`} />
              <Metric label="Pipeline value" value={formatCurrency(leadStats.pipelineValue)} />
              <Metric label="Won revenue" value={formatCurrency(leadStats.wonValue)} />
              <Metric
                label="Average project"
                value={
                  leadStats.averageProjectValue > 0
                    ? formatCurrency(leadStats.averageProjectValue)
                    : '—'
                }
              />
              <Metric label="Best source" value={leadStats.bestSource?.label ?? '—'} />
            </div>
          </AdminPanel>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        {leadStats && (
          <AdminPanel
            title="Lead pipeline"
            actions={
              <Link href="/admin/leads?view=pipeline" className="text-xs font-medium text-accent hover:underline">
                Open pipeline →
              </Link>
            }
          >
            <ul className="space-y-2.5">
              {LEAD_STATUSES.map((status) => {
                const count = leadStats.byStatus[status];
                const share = leadStats.total > 0 ? (count / leadStats.total) * 100 : 0;
                return (
                  <li key={status} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-muted-foreground">
                      {LEAD_STATUS_LABELS[status]}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${share}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </AdminPanel>
        )}

        {/* Recent leads */}
        {canSeeLeads && (
          <AdminPanel
            title="Recent leads"
            actions={
              <Link href="/admin/leads" className="text-xs font-medium text-accent hover:underline">
                View all →
              </Link>
            }
            bodyClassName="p-0"
          >
            {recentLeads.length === 0 ? (
              <EmptyState
                icon={<Inbox className="size-5" />}
                title="No leads yet"
                description="Submissions from the project brief form appear here immediately."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-sunken"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[lead.company, lead.service, lead.budget].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <LeadStatusBadge status={lead.status} />
                      <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        )}

        {/* Traffic sources */}
        <AdminPanel title="Traffic sources">
          <ReportGate result={channels} name="Google Analytics">
            {(data) => (
              <BarList
                items={data.map((row) => ({ label: row.label, value: row.users }))}
                valueLabel="Visitors"
              />
            )}
          </ReportGate>
        </AdminPanel>

        {/* Top landing pages */}
        <AdminPanel title="Top landing pages">
          <ReportGate result={landingPages} name="Google Analytics">
            {(data) => (
              <BarList
                items={data.slice(0, 8).map((row) => ({ label: row.label, value: row.users }))}
                valueLabel="Visitors"
              />
            )}
          </ReportGate>
        </AdminPanel>
      </div>

      {/* Search Console */}
      <div className="mt-6">
        <AdminPanel
          title="Search Console"
          description="Google search performance. Data lags by two to three days."
          actions={
            <Link href="/admin/analytics" className="text-xs font-medium text-accent hover:underline">
              Full report →
            </Link>
          }
        >
          <ReportGate result={gscTotals} name="Search Console">
            {(data) => {
              const prev = previousGsc.status === 'ok' ? previousGsc.data : null;
              return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Clicks"
                    value={formatNumber(data.clicks)}
                    change={prev ? percentChange(data.clicks, prev.clicks) : null}
                  />
                  <StatCard
                    label="Impressions"
                    value={formatNumber(data.impressions)}
                    change={prev ? percentChange(data.impressions, prev.impressions) : null}
                  />
                  <StatCard
                    label="CTR"
                    value={`${data.ctr.toFixed(2)}%`}
                    change={prev ? percentChange(data.ctr, prev.ctr) : null}
                  />
                  <StatCard
                    label="Avg. position"
                    value={data.position.toFixed(1)}
                    change={prev ? percentChange(data.position, prev.position) : null}
                    invertChange
                  />
                </div>
              );
            }}
          </ReportGate>
        </AdminPanel>
      </div>

      {/* Activity */}
      <div className="mt-6">
        <AdminPanel
          title="Recent admin activity"
          actions={
            <Link href="/admin/activity" className="text-xs font-medium text-accent hover:underline">
              View log →
            </Link>
          }
          bodyClassName="p-0"
        >
          {activity.length === 0 ? (
            <EmptyState title="Nothing recorded yet" description="Admin actions are logged here." />
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <Badge variant="outline">{entry.action}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {entry.entity_label ?? entry.entity_type}
                    <span className="ml-2 text-xs text-muted-foreground">{entry.entity_type}</span>
                  </span>
                  <span className="shrink-0 text-xs text-subtle-foreground">
                    {entry.actor_email ?? 'system'}
                  </span>
                  <time
                    dateTime={entry.created_at}
                    className="hidden shrink-0 text-xs text-subtle-foreground sm:block"
                  >
                    {new Date(entry.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">{label}</p>
      <p className="mt-1.5 truncate text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

async function getRecentActivity(): Promise<ActivityLogRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  return (data as ActivityLogRow[] | null) ?? [];
}
