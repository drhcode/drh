'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import type { LeadRow, LeadStatus } from '@/types/database';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/admin/leads';
import { updateLeadStatus } from '@/app/admin/actions/leads';
import { toast } from '@/components/ui/toaster';
import { cn, formatCurrency } from '@/lib/utils';

/**
 * Drag-and-drop lead pipeline (spec §49).
 *
 * Moves are applied optimistically and rolled back if the server rejects them.
 * Each card is also a keyboard-operable draggable, and every column exposes a
 * plain select as an accessible alternative to dragging.
 */
export function LeadPipeline({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(leads);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Server data wins whenever the route refreshes. Reconciling during render
  // avoids briefly showing the stale optimistic board after a refresh.
  const [lastServerLeads, setLastServerLeads] = React.useState(leads);
  if (leads !== lastServerLeads) {
    setLastServerLeads(leads);
    setItems(leads);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byStatus = React.useMemo(() => {
    const map = new Map<LeadStatus, LeadRow[]>();
    for (const status of LEAD_STATUSES) map.set(status, []);
    for (const lead of items) map.get(lead.status)?.push(lead);
    return map;
  }, [items]);

  async function move(leadId: string, status: LeadStatus) {
    const previous = items;
    setItems((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    );

    const result = await updateLeadStatus({ id: leadId, status });

    if (!result.ok) {
      setItems(previous);
      toast.error(result.error ?? 'Could not move that lead.');
      return;
    }

    toast.success(`Moved to ${LEAD_STATUS_LABELS[status]}.`);
    router.refresh();
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const status = String(over.id) as LeadStatus;
    const lead = items.find((item) => item.id === String(active.id));
    if (!lead || lead.status === status) return;

    void move(lead.id, status);
  }

  const activeLead = activeId ? items.find((lead) => lead.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
        <div className="flex min-w-max gap-4">
          {LEAD_STATUSES.map((status) => (
            <PipelineColumn
              key={status}
              status={status}
              leads={byStatus.get(status) ?? []}
              onMove={move}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function PipelineColumn({
  status,
  leads,
  onMove,
}: {
  status: LeadStatus;
  leads: LeadRow[];
  onMove: (id: string, status: LeadStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const value = leads.reduce(
    (total, lead) => total + Number(lead.won_value ?? lead.estimated_value ?? 0),
    0,
  );

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-surface-sunken/60 transition-colors',
        isOver ? 'border-accent bg-accent-subtle/40' : 'border-border',
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground">{LEAD_STATUS_LABELS[status]}</h3>
          {value > 0 && (
            <p className="text-xs text-muted-foreground">{formatCurrency(value)}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {leads.length}
        </span>
      </header>

      <div className="scrollbar-thin max-h-[60vh] flex-1 space-y-2 overflow-y-auto p-2">
        {leads.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-subtle-foreground">Nothing here</p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} onMove={onMove} />)
        )}
      </div>
    </section>
  );
}

function LeadCard({
  lead,
  overlay = false,
  onMove,
}: {
  lead: LeadRow;
  overlay?: boolean;
  onMove?: (id: string, status: LeadStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    disabled: overlay,
  });

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      className={cn(
        'rounded-lg border border-border bg-surface p-3 shadow-xs',
        isDragging && 'opacity-40',
        overlay && 'shadow-lg',
      )}
    >
      <div className="flex items-start gap-2">
        {!overlay && (
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-subtle-foreground transition-colors hover:text-foreground active:cursor-grabbing"
            aria-label={`Move ${lead.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/leads/${lead.id}`}
            className="block truncate text-sm font-medium text-foreground hover:text-accent"
          >
            {lead.name}
          </Link>
          {lead.company && (
            <p className="truncate text-xs text-muted-foreground">{lead.company}</p>
          )}
          <p className="mt-1.5 truncate text-xs text-subtle-foreground">
            {[lead.service, lead.budget].filter(Boolean).join(' · ')}
          </p>

          {!overlay && onMove && (
            <label className="mt-2 block">
              <span className="sr-only">Move {lead.name} to another stage</span>
              <select
                value={lead.status}
                onChange={(event) => onMove(lead.id, event.target.value as LeadStatus)}
                className="w-full rounded border border-border bg-surface px-1.5 py-1 text-[11px] text-muted-foreground focus-visible:border-accent focus-visible:outline-none"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {LEAD_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </article>
  );
}
