import { getSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Activity log and notification centre writes (spec §78, §79).
 *
 * Both are best-effort: an audit write must never fail the operation that
 * triggered it, so every function swallows its errors after logging.
 */

export interface ActivityInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished' | 'login' | 'invited' | 'archived' | 'restored';
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: ActivityInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from('activity_logs').insert({
    actor_id: input.actorId ?? null,
    actor_email: input.actorEmail ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    entity_label: input.entityLabel ?? null,
    metadata: input.metadata ?? null,
  });

  if (error) console.error('[activity] failed to record', error.message);
}

export interface NotificationInput {
  kind: 'lead' | 'subscriber' | 'blog' | 'integration' | 'security' | 'form';
  title: string;
  body?: string | null;
  href?: string | null;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export async function notifyAdmins(input: NotificationInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from('admin_notifications').insert({
    kind: input.kind,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
    severity: input.severity ?? 'info',
  });

  if (error) console.error('[notify] failed to record', error.message);
}
