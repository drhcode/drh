import type { LeadStatus } from '@/types/database';
import { LEAD_STATUS_LABELS } from '@/lib/admin/leads';
import { cn } from '@/lib/utils';

const STYLES: Record<LeadStatus, string> = {
  new: 'border-info/30 bg-info/10 text-info',
  contacted: 'border-chart-6/30 bg-chart-6/10 text-chart-6',
  qualified: 'border-accent-border bg-accent-subtle text-accent',
  proposal_sent: 'border-warning/30 bg-warning/10 text-warning',
  won: 'border-success/30 bg-success/10 text-success',
  lost: 'border-border bg-surface-sunken text-subtle-foreground',
};

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STYLES[status],
        className,
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
