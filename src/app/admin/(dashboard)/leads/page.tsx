import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import {
  getLeadFilterOptions,
  getLeadStats,
  getLeads,
  type LeadFilters as LeadFilterValues,
} from '@/lib/admin/leads';
import { AdminPageHeader, AdminPanel, EmptyState, StatCard } from '@/components/admin/admin-ui';
import { LeadFilters } from '@/components/admin/leads/lead-filters';
import { LeadPipeline } from '@/components/admin/leads/lead-pipeline';
import { LeadStatusBadge } from '@/components/admin/lead-status-badge';
import { ExportLeadsButton } from '@/components/admin/leads/export-leads-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { LeadStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LeadsPage({ searchParams }: Props) {
  await requireCapability('leads');
  const params = await searchParams;

  const view = params.view === 'pipeline' ? 'pipeline' : 'list';

  const filters: LeadFilterValues = {
    status: (params.status as LeadStatus | 'all' | undefined) ?? 'all',
    service: params.service,
    budget: params.budget,
    source: params.source,
    country: params.country,
    query: params.q,
    from: params.from,
    to: params.to,
  };

  const [leads, stats, options] = await Promise.all([
    getLeads(filters, view === 'pipeline' ? 400 : 200),
    getLeadStats(),
    getLeadFilterOptions(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Leads"
        description="Every project enquiry, with the attribution that produced it."
        actions={<ExportLeadsButton leads={leads} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New" value={formatNumber(stats.byStatus.new)} />
        <StatCard label="Qualified" value={formatNumber(stats.byStatus.qualified)} />
        <StatCard
          label="Pipeline value"
          value={formatCurrency(stats.pipelineValue)}
          hint="Open stages"
        />
        <StatCard
          label="Won revenue"
          value={formatCurrency(stats.wonValue)}
          hint={`${stats.byStatus.won} won`}
        />
      </div>

      <div className="mt-6">
        <LeadFilters options={options} view={view} />
      </div>

      <div className="mt-5">
        {leads.length === 0 ? (
          <AdminPanel>
            <EmptyState
              icon={<Inbox className="size-5" />}
              title="No leads match these filters"
              description="Enquiries submitted through the project brief form appear here immediately, with their full campaign attribution."
            />
          </AdminPanel>
        ) : view === 'pipeline' ? (
          <LeadPipeline leads={leads} />
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-foreground hover:text-accent"
                      >
                        {lead.name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {lead.company ?? lead.email}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.service ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {lead.budget ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.source ?? 'direct'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.country ?? '—'}
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </div>
    </>
  );
}
