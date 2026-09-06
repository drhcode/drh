'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getRequestContext } from '@/lib/security/request';
import { logActivity, notifyAdmins } from '@/lib/admin/audit';
import type { AdminUserRow } from '@/types/database';

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  next: z.string().trim().startsWith('/').max(200).optional(),
});

export interface AuthActionState {
  error?: string;
}

/**
 * Admin sign-in.
 *
 * Rate limited on a salted IP hash so the form cannot be used for credential
 * stuffing, and deliberately vague about *why* a sign-in failed.
 */
export async function signIn(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') || undefined,
  });

  if (!parsed.success) {
    return { error: 'Enter a valid email address and password.' };
  }

  const context = await getRequestContext();
  const { allowed } = await checkRateLimit('admin-login', context.identifierHash, {
    limit: 10,
    windowMinutes: 15,
  });
  if (!allowed) {
    return { error: 'Too many attempts. Please wait a few minutes and try again.' };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: 'Authentication is not configured. Set the Supabase environment variables.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Same message for a wrong password and an unknown address — the form should
  // not reveal which accounts exist.
  if (error || !data.user) {
    return { error: 'Those credentials did not work.' };
  }

  const adminDb = getSupabaseAdminClient();
  const { data: profile } = await (adminDb ?? supabase)
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  const admin = profile as AdminUserRow | null;

  if (!admin || !admin.is_active) {
    await supabase.auth.signOut();
    return { error: 'This account is not active. Ask a super admin to enable it.' };
  }

  const isFirstLogin = !admin.last_login_at;

  if (adminDb) {
    await adminDb
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);
  }

  await logActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'login',
    entityType: 'admin_user',
    entityId: admin.id,
    entityLabel: admin.full_name ?? admin.email,
    metadata: { country: context.country, device: context.device },
  });

  // "Login from a new device" style alert (spec §78). Kept coarse on purpose:
  // we record a country and device category, never a fingerprint.
  if (isFirstLogin) {
    await notifyAdmins({
      kind: 'security',
      title: `First sign-in — ${admin.full_name ?? admin.email}`,
      body: `${admin.email} signed in for the first time from ${context.country ?? 'an unknown country'} (${context.device ?? 'unknown device'}).`,
      href: '/admin/users',
      severity: 'warning',
    });
  }

  revalidatePath('/admin', 'layout');
  redirect(parsed.data.next ?? '/admin');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const adminDb = getSupabaseAdminClient();
      const { data } = await (adminDb ?? supabase)
        .from('admin_users')
        .select('email')
        .eq('id', user.id)
        .maybeSingle();

      await logActivity({
        actorId: user.id,
        actorEmail: (data as { email?: string } | null)?.email ?? user.email ?? null,
        action: 'login',
        entityType: 'admin_user',
        entityId: user.id,
        entityLabel: 'Signed out',
      });
    }

    await supabase.auth.signOut();
  }

  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}

const resetSchema = z.object({ email: z.string().trim().email() });

/** Sends a Supabase password-recovery email. Always reports success. */
export async function requestPasswordReset(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: 'Enter a valid email address.' };

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/login`,
    });
  }

  return {};
}
