'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  Trash2,
} from 'lucide-react';
import type { LeadNoteRow, LeadRow, LeadStatus } from '@/types/database';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/admin/leads';
import {
  addLeadNote,
  deleteLead,
  deleteLeadNote,
  getAttachmentUrl,
  setLeadArchived,
  updateLeadStatus,
  updateLeadValues,
} from '@/app/admin/actions/leads';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

/** Status stepper — the fastest way to move a lead along the pipeline. */
export function LeadStatusControl({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<LeadStatus>(lead.status);
  const [pending, startTransition] = React.useTransition();

  // Keep the optimistic selection aligned with the server after a refresh.
  const [lastServerStatus, setLastServerStatus] = React.useState(lead.status);
  if (lead.status !== lastServerStatus) {
    setLastServerStatus(lead.status);
    setStatus(lead.status);
  }

  function change(next: LeadStatus) {
    const previous = status;
    setStatus(next);

    startTransition(async () => {
      const result = await updateLeadStatus({ id: lead.id, status: next });
      if (!result.ok) {
        setStatus(previous);
        toast.error(result.error ?? 'Could not update the status.');
        return;
      }
      toast.success(`Marked as ${LEAD_STATUS_LABELS[next]}.`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lead status">
      {LEAD_STATUSES.map((option) => (
        <button
          key={option}
          type="button"
          disabled={pending}
          onClick={() => change(option)}
          aria-pressed={status === option}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60',
            status === option
              ? 'border-accent bg-accent text-accent-foreground'
              : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
          )}
        >
          {LEAD_STATUS_LABELS[option]}
        </button>
      ))}
    </div>
  );
}

/** Deal value editor — seeds the pipeline and won-revenue figures. */
export function LeadValueForm({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [estimated, setEstimated] = React.useState(lead.estimated_value?.toString() ?? '');
  const [won, setWon] = React.useState(lead.won_value?.toString() ?? '');
  const [pending, startTransition] = React.useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateLeadValues({
        id: lead.id,
        estimatedValue: estimated === '' ? null : Number(estimated),
        wonValue: won === '' ? null : Number(won),
      });

      if (!result.ok) {
        toast.error(result.error ?? 'Could not save.');
        return;
      }
      toast.success('Values updated.');
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="estimated-value" className="text-xs">
          Estimated value (€)
        </Label>
        <Input
          id="estimated-value"
          type="number"
          min={0}
          step={100}
          value={estimated}
          onChange={(event) => setEstimated(event.target.value)}
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="won-value" className="text-xs">
          Won value (€)
        </Label>
        <Input
          id="won-value"
          type="number"
          min={0}
          step={100}
          value={won}
          onChange={(event) => setWon(event.target.value)}
          className="mt-1.5 h-9 text-sm"
        />
        <p className="mt-1.5 text-xs text-subtle-foreground">
          Set this when the project closes — it drives won revenue reporting.
        </p>
      </div>

      <Button size="sm" onClick={save} disabled={pending} className="w-full">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save values
      </Button>
    </div>
  );
}

/** Internal notes (spec §52). */
export function LeadNotes({ leadId, notes }: { leadId: string; notes: LeadNoteRow[] }) {
  const router = useRouter();
  const [body, setBody] = React.useState('');
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      const result = await addLeadNote({ leadId, body });
      if (!result.ok) {
        toast.error(result.error ?? 'Could not add the note.');
        return;
      }
      setBody('');
      router.refresh();
    });
  }

  function remove(noteId: string) {
    startTransition(async () => {
      const result = await deleteLeadNote(noteId, leadId);
      if (!result.ok) {
        toast.error(result.error ?? 'Could not delete the note.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={submit}>
        <Label htmlFor="lead-note" className="sr-only">
          Add an internal note
        </Label>
        <Textarea
          id="lead-note"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Internal note — visible to the team only…"
          rows={3}
          className="min-h-20 text-sm"
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={pending || !body.trim()}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Add note
          </Button>
        </div>
      </form>

      {notes.length > 0 && (
        <ul className="mt-5 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-border bg-surface-sunken p-3.5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {note.body}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-subtle-foreground">
                  {note.author_name ?? 'Unknown'} ·{' '}
                  {new Date(note.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => remove(note.id)}
                  className="text-xs text-subtle-foreground transition-colors hover:text-danger"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Contact shortcuts and destructive actions (spec §51). */
export function LeadActions({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [copied, setCopied] = React.useState<string | null>(null);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error('Could not copy to the clipboard.');
    }
  }

  async function openAttachment() {
    if (!lead.attachment_url) return;
    const url = await getAttachmentUrl(lead.attachment_url);
    if (!url) {
      toast.error('Could not open the attachment.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const whatsapp = lead.phone?.replace(/[^\d]/g, '');

  return (
    <div className="space-y-2">
      <Button asChild variant="outline" size="sm" className="w-full justify-start">
        <a href={`mailto:${lead.email}?subject=Your%20project%20enquiry%20—%20drh.al`}>
          <Mail className="size-4" />
          Email {lead.name.split(' ')[0]}
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => copy(lead.email, 'email')}
      >
        {copied === 'email' ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        Copy email
      </Button>

      {lead.phone && (
        <>
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <a href={`tel:${lead.phone}`}>
              <Phone className="size-4" />
              Call
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => copy(lead.phone!, 'phone')}
          >
            {copied === 'phone' ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
            Copy phone
          </Button>
          {whatsapp && (
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
          )}
        </>
      )}

      {lead.attachment_url && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={openAttachment}
        >
          <Paperclip className="size-4" />
          Open attachment
        </Button>
      )}

      <div className="border-t border-border pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await setLeadArchived(lead.id, !lead.is_archived);
              if (!result.ok) {
                toast.error(result.error ?? 'Could not archive.');
                return;
              }
              toast.success(lead.is_archived ? 'Lead restored.' : 'Lead archived.');
              router.refresh();
            })
          }
        >
          {lead.is_archived ? (
            <ArchiveRestore className="size-4" />
          ) : (
            <Archive className="size-4" />
          )}
          {lead.is_archived ? 'Restore' : 'Archive'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start text-danger hover:bg-danger/10">
              <Trash2 className="size-4" />
              Delete permanently
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {lead.name}&apos;s enquiry, its notes and its activity trail for good.
              Archiving keeps the record but hides it from the list.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                destructive
                onClick={() => startTransition(() => void deleteLead(lead.id))}
              >
                Delete lead
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
