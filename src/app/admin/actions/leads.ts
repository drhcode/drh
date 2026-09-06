'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity } from '@/lib/admin/audit';
import { LEAD_STATUS_LABELS } from '@/lib/admin/leads';
import type { LeadStatus } from '@/types/database';

/**
 * Lead mutations (spec §49, §51, §52).
 *
 * Every action re-checks the caller's role on the server before touching the
 * database, and records what changed in the lead's own activity trail.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function fail(error: unknown): ActionResult {
  if (error instanceof AuthorizationError) return { ok: false, error: error.message };
  console.error('[leads] action failed', error);
  return { ok: false, error: 'Something went wrong. Please try again.' };
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost']),
});

export async function updateLeadStatus(input: {
  id: string;
  status: LeadStatus;
}): Promise<ActionResult> {
  try {
    const admin = await assertCapability('leads');
    const parsed = statusSchema.parse(input);

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { data: existing } = await supabase
      .from('leads')
      .select('status, name')
      .eq('id', parsed.id)
      .maybeSingle();

    const previous = (existing as { status: LeadStatus; name: string } | null)?.status;
    if (previous === parsed.status) return { ok: true };

    const { error } = await supabase
      .from('leads')
      .update({ status: parsed.status })
      .eq('id', parsed.id);

    if (error) throw error;

    await supabase.from('lead_activity').insert({
      lead_id: parsed.id,
      actor_id: admin.id,
      actor_name: admin.full_name ?? admin.email,
      action: 'status_changed',
      from_value: previous ? LEAD_STATUS_LABELS[previous] : null,
      to_value: LEAD_STATUS_LABELS[parsed.status],
    });

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'lead',
      entityId: parsed.id,
      entityLabel: (existing as { name?: string } | null)?.name ?? parsed.id,
      metadata: { from: previous, to: parsed.status },
    });

    revalidatePath('/admin/leads');
    revalidatePath(`/admin/leads/${parsed.id}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const detailsSchema = z.object({
  id: z.string().uuid(),
  estimatedValue: z.number().min(0).max(10_000_000).nullable(),
  wonValue: z.number().min(0).max(10_000_000).nullable(),
});

export async function updateLeadValues(input: {
  id: string;
  estimatedValue: number | null;
  wonValue: number | null;
}): Promise<ActionResult> {
  try {
    const admin = await assertCapability('leads');
    const parsed = detailsSchema.parse(input);

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase
      .from('leads')
      .update({ estimated_value: parsed.estimatedValue, won_value: parsed.wonValue })
      .eq('id', parsed.id);

    if (error) throw error;

    await supabase.from('lead_activity').insert({
      lead_id: parsed.id,
      actor_id: admin.id,
      actor_name: admin.full_name ?? admin.email,
      action: 'value_updated',
      to_value: parsed.estimatedValue != null ? `€${parsed.estimatedValue}` : null,
    });

    revalidatePath(`/admin/leads/${parsed.id}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const noteSchema = z.object({
  leadId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

/** Internal note (spec §52). Never visible to the lead. */
export async function addLeadNote(input: {
  leadId: string;
  body: string;
}): Promise<ActionResult> {
  try {
    const admin = await assertCapability('leads');
    const parsed = noteSchema.parse(input);

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('lead_notes').insert({
      lead_id: parsed.leadId,
      author_id: admin.id,
      author_name: admin.full_name ?? admin.email,
      body: parsed.body,
    });

    if (error) throw error;

    await supabase.from('lead_activity').insert({
      lead_id: parsed.leadId,
      actor_id: admin.id,
      actor_name: admin.full_name ?? admin.email,
      action: 'note_added',
    });

    revalidatePath(`/admin/leads/${parsed.leadId}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLeadNote(noteId: string, leadId: string): Promise<ActionResult> {
  try {
    await assertCapability('leads');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('lead_notes').delete().eq('id', noteId);
    if (error) throw error;

    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setLeadArchived(id: string, archived: boolean): Promise<ActionResult> {
  try {
    const admin = await assertCapability('leads');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('leads').update({ is_archived: archived }).eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: archived ? 'archived' : 'restored',
      entityType: 'lead',
      entityId: id,
    });

    revalidatePath('/admin/leads');
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Permanent deletion. Restricted to admins and above. */
export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const admin = await assertCapability('leads');
    if (admin.role !== 'super_admin' && admin.role !== 'admin') {
      return { ok: false, error: 'Only an admin can permanently delete a lead.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { data } = await supabase.from('leads').select('name').eq('id', id).maybeSingle();
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'deleted',
      entityType: 'lead',
      entityId: id,
      entityLabel: (data as { name?: string } | null)?.name ?? id,
    });

    revalidatePath('/admin/leads');
  } catch (error) {
    return fail(error);
  }

  redirect('/admin/leads');
}

/** Signed, short-lived URL for a lead's private attachment. */
export async function getAttachmentUrl(path: string): Promise<string | null> {
  await assertCapability('leads', 'view');

  const supabase = getAdminDb();
  if (!supabase) return null;

  const { data } = await supabase.storage
    .from('lead-attachments')
    .createSignedUrl(path, 60 * 10);

  return data?.signedUrl ?? null;
}
