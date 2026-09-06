import { requireCapability } from '@/lib/auth/guard';
import { resolveRange, formatRange } from '@/lib/analytics/date-range';
import {
  getGa4Browsers,
  getGa4Campaigns,
  getGa4Channels,
  getGa4Cities,
  getGa4Countries,
  getGa4Devices,
  getGa4ExitPages,
  getGa4LandingPages,
  getGa4OperatingSystems,
  getGa4TopPages,
  getGa4Totals,
} from '@/lib/analytics/ga4';
import {
  getGscCountries,
  getGscDevices,
  getGscPages,
  getGscQueries,
  getGscTotals,
} from '@/lib/analytics/gsc';
import { getLeadsBySource } from '@/lib/admin/leads';
import { getProjectEngagement, getServiceEngagement } from '@/lib/admin/engagement';
import { isGa4ReportingConfigured, isGscConfigured } from '@/lib/env';
import { AdminPageHeader, AdminPanel, StatCard } from '@/components/admin/admin-ui';
import { DateRangePicker } from '@/components/admin/date-range-picker';
import { BarList } from '@/components/admin/charts';
import { ReportGate, IntegrationBanner } from '@/components/admin/integration-notice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table';
import { formatCurrency, formatNumber, percentChange } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

/** Channel labels GA4 uses, mapped onto our own lead-source keys (spec §53). */
const CHANNEL_TO_SOURCE: Record<string, string> = {
  'organic search': 'organic',
  'paid search': 'google_ads',
  'paid social': 'meta_ads',
  'organic social': 'social',
  direct: 'direct',
  referral: 'referral',
  email: 'email',
};

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  await requireCapability('analytics');
  const { range: rangeParam, from, to } = await searchParams;
  const range = resolveRange(rangeParam, from, to);

  const [
    totals,
    previousTotals,
    channels,
    countries,
    cities,
    devices,
    browsers,
    operatingSystems,
    topPages,
    landingPages,
    exitPages,
    campaigns,
    gscTotals,
    previousGsc,
    gscQueries,
    gscPages,
    gscCountries,
    gscDevices,
    leadsBySource,
    projectEngagement,
    serviceEngagement,
  ] = await Promise.all([
    getGa4Totals(range.current),
    getGa4Totals(range.previous),
    getGa4Channels(range.current),
    getGa4Countries(range.current),
    getGa4Cities(range.current),
    getGa4Devices(range.current),
    getGa4Browsers(range.current),
    getGa4OperatingSystems(range.current),
    getGa4TopPages(range.current),
    getGa4LandingPages(range.current),
    getGa4ExitPages(range.current),
    getGa4Campaigns(range.current),
    getGscTotals(range.current),
    getGscTotals(range.previous),
    getGscQueries(range.current),
    getGscPages(range.current),
    getGscCountries(range.current),
    getGscDevices(range.current),
    getLeadsBySource(range.current),
    getProjectEngagement(range.current),
    getServiceEngagement(range.current),
  ]);

  const missing: string[] = [];
  if (!isGa4ReportingConfigured) missing.push('Google Analytics');
  if (!isGscConfigured) missing.push('Search Console');

  // Merge GA4 visitor counts into the lead-source report where the channel maps.
  const visitorsBySource = new Map<string, number>();
  if (channels.status === 'ok') {
    for (const row of channels.data) {
      const key = CHANNEL_TO_SOURCE[row.label.toLowerCase()] ?? row.label.toLowerCase();
      visitorsBySource.set(key, (visitorsBySource.get(key) ?? 0) + row.users);
    }
  }

  const attribution = leadsBySource.map((row) => {
    const visitors = visitorsBySource.get(row.source) ?? null;
    return {
      ...row,
      visitors,
      conversion: visitors && visitors > 0 ? (row.leads / visitors) * 100 : null,
    };
  });

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description={`Traffic, search and acquisition — ${formatRange(range.current)}.`}
        actions={<DateRangePicker preset={range.preset} range={range.current} />}
      />

      <IntegrationBanner missing={missing} />

      <Tabs defaultValue="audience">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="search">Search Console</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Lead to revenue</TabsTrigger>
        </TabsList>

        {/* ── Audience ───────────────────────────────────────────────────── */}
        <TabsContent value="audience" className="space-y-6">
          <ReportGate result={totals} name="Google Analytics">
            {(data) => {
              const prev = previousTotals.status === 'ok' ? previousTotals.data : null;
              return (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Users"
                    value={formatNumber(data.users)}
                    change={prev ? percentChange(data.users, prev.users) : null}
                  />
                  <StatCard
                    label="New users"
                    value={formatNumber(data.newUsers)}
                    change={prev ? percentChange(data.newUsers, prev.newUsers) : null}
                  />
                  <StatCard
                    label="Returning users"
                    value={formatNumber(data.returningUsers)}
                    change={prev ? percentChange(data.returningUsers, prev.returningUsers) : null}
                  />
                  <StatCard
                    label="Sessions"
                    value={formatNumber(data.sessions)}
                    change={prev ? percentChange(data.sessions, prev.sessions) : null}
                  />
                  <StatCard
                    label="Engaged sessions"
                    value={formatNumber(data.engagedSessions)}
                    change={prev ? percentChange(data.engagedSessions, prev.engagedSessions) : null}
                  />
                  <StatCard
                    label="Engagement rate"
                    value={`${(data.engagementRate * 100).toFixed(1)}%`}
                    change={
                      prev ? percentChange(data.engagementRate, prev.engagementRate) : null
                    }
                  />
                  <StatCard
                    label="Avg. engagement time"
                    value={`${Math.round(data.averageEngagementTime)}s`}
                    change={
                      prev
                        ? percentChange(data.averageEngagementTime, prev.averageEngagementTime)
                        : null
                    }
                  />
                  <StatCard
                    label="Page views"
                    value={formatNumber(data.screenPageViews)}
                    change={
                      prev ? percentChange(data.screenPageViews, prev.screenPageViews) : null
                    }
                  />
                </div>
              );
            }}
          </ReportGate>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel title="Countries">
              <ReportGate result={countries} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.users }))}
                    valueLabel="Users"
                  />
                )}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Cities">
              <ReportGate result={cities} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.users }))}
                    valueLabel="Users"
                  />
                )}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Devices">
              <ReportGate result={devices} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.users }))}
                    valueLabel="Users"
                  />
                )}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Browsers">
              <ReportGate result={browsers} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.users }))}
                    valueLabel="Users"
                  />
                )}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Operating systems" className="lg:col-span-2">
              <ReportGate result={operatingSystems} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.users }))}
                    valueLabel="Users"
                  />
                )}
              </ReportGate>
            </AdminPanel>
          </div>
        </TabsContent>

        {/* ── Acquisition ────────────────────────────────────────────────── */}
        <TabsContent value="acquisition" className="space-y-6">
          <AdminPanel title="Channels">
            <ReportGate result={channels} name="Google Analytics">
              {(data) => (
                <BarList
                  items={data.map((row) => ({ label: row.label, value: row.users }))}
                  valueLabel="Users"
                />
              )}
            </ReportGate>
          </AdminPanel>

          <AdminPanel title="Campaigns" bodyClassName="p-0">
            <ReportGate result={campaigns} name="Google Analytics">
              {(data) =>
                data.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No campaign traffic in this period.
                  </p>
                ) : (
                  <TableWrapper className="rounded-none border-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Source</TableHead>
                          <TableHead>Medium</TableHead>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>Term</TableHead>
                          <TableHead className="text-right">Users</TableHead>
                          <TableHead className="text-right">Sessions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, index) => (
                          <TableRow key={`${row.source}-${row.campaign}-${index}`}>
                            <TableCell className="text-sm text-foreground">{row.source}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {row.medium}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {row.campaign}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {row.content}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {row.term}
                            </TableCell>
                            <TableCell className="text-right text-sm tabular-nums text-foreground">
                              {formatNumber(row.users)}
                            </TableCell>
                            <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                              {formatNumber(row.sessions)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableWrapper>
                )
              }
            </ReportGate>
          </AdminPanel>
        </TabsContent>

        {/* ── Pages ──────────────────────────────────────────────────────── */}
        <TabsContent value="pages" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel title="Top pages">
              <ReportGate result={topPages} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.sessions ?? 0 }))}
                    valueLabel="Views"
                  />
                )}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Landing pages">
              <ReportGate result={landingPages} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.users }))}
                    valueLabel="Users"
                  />
                )}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Exit pages" className="lg:col-span-2">
              <ReportGate result={exitPages} name="Google Analytics">
                {(data) => (
                  <BarList
                    items={data.map((row) => ({ label: row.label, value: row.sessions ?? 0 }))}
                    valueLabel="Sessions"
                  />
                )}
              </ReportGate>
            </AdminPanel>
          </div>
        </TabsContent>

        {/* ── Search Console ─────────────────────────────────────────────── */}
        <TabsContent value="search" className="space-y-6">
          <ReportGate result={gscTotals} name="Search Console">
            {(data) => {
              const prev = previousGsc.status === 'ok' ? previousGsc.data : null;
              return (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    label="Average position"
                    value={data.position.toFixed(1)}
                    change={prev ? percentChange(data.position, prev.position) : null}
                    invertChange
                  />
                </div>
              );
            }}
          </ReportGate>

          <AdminPanel title="Top search queries" bodyClassName="p-0">
            <ReportGate result={gscQueries} name="Search Console">
              {(data) => <GscTable rows={data} keyLabel="Query" />}
            </ReportGate>
          </AdminPanel>

          <AdminPanel title="Top pages" bodyClassName="p-0">
            <ReportGate result={gscPages} name="Search Console">
              {(data) => <GscTable rows={data} keyLabel="Page" />}
            </ReportGate>
          </AdminPanel>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel title="Countries" bodyClassName="p-0">
              <ReportGate result={gscCountries} name="Search Console">
                {(data) => <GscTable rows={data} keyLabel="Country" />}
              </ReportGate>
            </AdminPanel>

            <AdminPanel title="Devices" bodyClassName="p-0">
              <ReportGate result={gscDevices} name="Search Console">
                {(data) => <GscTable rows={data} keyLabel="Device" />}
              </ReportGate>
            </AdminPanel>
          </div>
        </TabsContent>

        {/* ── Content engagement (spec §91) ──────────────────────────────── */}
        <TabsContent value="content" className="space-y-6">
          <AdminPanel
            title="Case study engagement"
            description="Measured first-party, without cookies — which projects get read, and which ones move someone to act."
            bodyClassName="p-0"
          >
            <EngagementTable rows={projectEngagement} label="Project" />
          </AdminPanel>

          <AdminPanel
            title="Service page engagement"
            description="The same signal for service pages."
            bodyClassName="p-0"
          >
            <EngagementTable rows={serviceEngagement} label="Service" />
          </AdminPanel>

          <p className="text-xs leading-relaxed text-subtle-foreground">
            These counts come from our own event table, not from GA4, so they keep working
            regardless of consent choices or ad blockers. They are page-level counts, not unique
            visitors — treat them as a ranking of relative interest rather than absolute reach.
          </p>
        </TabsContent>

        {/* ── Lead to revenue (spec §53) ─────────────────────────────────── */}
        <TabsContent value="revenue" className="space-y-6">
          <AdminPanel
            title="Where the business actually comes from"
            description="Leads, qualification and won revenue by acquisition channel. Visitor counts come from GA4 where the channel can be matched; leads and revenue come from the CRM."
            bodyClassName="p-0"
          >
            {attribution.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">
                No leads in this period yet.
              </p>
            ) : (
              <TableWrapper className="rounded-none border-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Visitors</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                      <TableHead className="text-right">Qualified</TableHead>
                      <TableHead className="text-right">Won</TableHead>
                      <TableHead className="text-right">Pipeline</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attribution.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell className="text-sm font-medium capitalize text-foreground">
                          {row.source.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {row.visitors != null ? formatNumber(row.visitors) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-foreground">
                          {formatNumber(row.leads)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {row.conversion != null ? `${row.conversion.toFixed(2)}%` : '—'}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {formatNumber(row.qualified)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-success">
                          {formatNumber(row.won)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {formatCurrency(row.pipeline)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">
                          {formatCurrency(row.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            )}
          </AdminPanel>

          <p className="text-xs leading-relaxed text-subtle-foreground">
            A dash in the visitors column means GA4 has no channel that maps cleanly to that lead
            source — usually because the lead arrived before analytics was connected, or through a
            channel GA4 groups differently. We leave it blank rather than estimating.
          </p>
        </TabsContent>
      </Tabs>
    </>
  );
}

function EngagementTable({
  rows,
  label,
}: {
  rows: { slug: string; views: number; ctaClicks: number; outboundClicks: number; actionRate: number | null }[];
  label: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="p-10 text-center text-sm text-muted-foreground">
        No engagement recorded in this period yet.
      </p>
    );
  }

  return (
    <TableWrapper className="rounded-none border-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{label}</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">CTA clicks</TableHead>
            <TableHead className="text-right">Outbound clicks</TableHead>
            <TableHead className="text-right">Action rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.slug}>
              <TableCell className="font-mono text-xs text-foreground">{row.slug}</TableCell>
              <TableCell className="text-right text-sm tabular-nums text-foreground">
                {formatNumber(row.views)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {formatNumber(row.ctaClicks)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {formatNumber(row.outboundClicks)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {row.actionRate != null ? `${row.actionRate.toFixed(1)}%` : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}

function GscTable({
  rows,
  keyLabel,
}: {
  rows: { key: string; clicks: number; impressions: number; ctr: number; position: number }[];
  keyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        No search data for this period.
      </p>
    );
  }

  return (
    <TableWrapper className="rounded-none border-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{keyLabel}</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead className="text-right">Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="max-w-80 truncate text-sm text-foreground" title={row.key}>
                {row.key}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-foreground">
                {formatNumber(row.clicks)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {formatNumber(row.impressions)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {row.ctr.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {row.position.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
