import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guard';
import { getLead } from '@/lib/admin/leads';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-ui';
import { LeadStatusBadge } from '@/components/admin/lead-status-badge';
import {
  LeadActions,
  LeadNotes,
  LeadStatusControl,
  LeadValueForm,
} from '@/components/admin/leads/lead-workspace';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  await requireCapability('leads');
  const { id } = await params;

  const record = await getLead(id);
  if (!record) notFound();

  const { lead, notes, activity } = record;

  const contact = [
    { label: 'Name', value: lead.name },
    { label: 'Company', value: lead.company },
    { label: 'Email', value: lead.email },
    { label: 'Phone', value: lead.phone },
  ];

  const project = [
    { label: 'Service', value: lead.service },
    { label: 'Budget', value: lead.budget },
    { label: 'Timeline', value: lead.timeline },
    { label: 'Website', value: lead.website },
    { label: 'Language', value: lead.language === 'sq' ? 'Albanian' : 'English' },
  ];

  const attribution = [
    { label: 'Source', value: lead.source ?? 'direct' },
    { label: 'UTM source', value: lead.utm_source },
    { label: 'UTM medium', value: lead.utm_medium },
    { label: 'Campaign', value: lead.utm_campaign },
    { label: 'Content', value: lead.utm_content },
    { label: 'Term', value: lead.utm_term },
    { label: 'Landing page', value: lead.landing_page },
    { label: 'Submitted from', value: lead.source_page },
    { label: 'Referrer', value: lead.referrer },
    { label: 'Country', value: lead.country },
    { label: 'City', value: lead.city },
    { label: 'Device', value: lead.device },
  ];

  const firstTouch = lead.first_touch as Record<string, string> | null;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Leads', href: '/admin/leads' }, { label: lead.name }]}
        title={lead.name}
        description={[lead.company, lead.email].filter(Boolean).join(' · ')}
        actions={
          <>
            {lead.is_archived && <Badge variant="warning">Archived</Badge>}
            <LeadStatusBadge status={lead.status} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminPanel title="Pipeline stage">
            <LeadStatusControl lead={lead} />
          </AdminPanel>

          <AdminPanel title="Project details">
            <DetailGrid items={project} />
            {lead.message && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                  Message
                </p>
                <div className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-surface-sunken p-4 text-sm leading-relaxed text-foreground">
                  {lead.message}
                </div>
              </div>
            )}
          </AdminPanel>

          <AdminPanel
            title="Attribution"
            description="Where this enquiry actually came from."
          >
            <DetailGrid items={attribution} />

            {firstTouch && Object.keys(firstTouch).length > 0 && (
              <div className="mt-5 rounded-lg border border-border bg-surface-sunken p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                  First touch
                </p>
                <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {Object.entries(firstTouch).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <dt className="text-subtle-foreground">{key}</dt>
                      <dd className="min-w-0 flex-1 truncate text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Internal notes" description="Never shown to the lead.">
            <LeadNotes leadId={lead.id} notes={notes} />
          </AdminPanel>
        </div>

        <div className="space-y-6">
          <AdminPanel title="Contact">
            <DetailGrid items={contact} columns={1} />
          </AdminPanel>

          <AdminPanel title="Actions">
            <LeadActions lead={lead} />
          </AdminPanel>

          <AdminPanel title="Deal value">
            <LeadValueForm lead={lead} />
          </AdminPanel>

          <AdminPanel title="Timeline" bodyClassName="p-0">
            <ol className="divide-y divide-border">
              <li className="px-5 py-3">
                <p className="text-sm text-foreground">Enquiry received</p>
                <p className="text-xs text-subtle-foreground">
                  {new Date(lead.created_at).toLocaleString('en-GB')}
                </p>
              </li>
              {activity.map((entry) => (
                <li key={entry.id} className="px-5 py-3">
                  <p className="text-sm text-foreground">
                    {entry.action.replace(/_/g, ' ')}
                    {entry.to_value && (
                      <span className="text-muted-foreground"> → {entry.to_value}</span>
                    )}
                  </p>
                  <p className="text-xs text-subtle-foreground">
                    {entry.actor_name ?? 'System'} ·{' '}
                    {new Date(entry.created_at).toLocaleString('en-GB')}
                  </p>
                </li>
              ))}
            </ol>
          </AdminPanel>
        </div>
      </div>
    </>
  );
}

function DetailGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: string | null | undefined }[];
  columns?: 1 | 2;
}) {
  const visible = items.filter((item) => Boolean(item.value));
  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing recorded.</p>;
  }

  return (
    <dl className={columns === 1 ? 'space-y-3' : 'grid gap-x-6 gap-y-3 sm:grid-cols-2'}>
      {visible.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 break-words text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
