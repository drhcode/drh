import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminUserRow } from '@/types/database';
import { can, type AdminResource, type Capability } from './permissions';

/**
 * Server-side authorization (spec §42, §81).
 *
 * Every admin page and every server action calls one of these. Middleware only
 * checks that a session exists; the role check lives here, close to the data,
 * and is repeated on each request rather than trusted from the client.
 */

export class AuthorizationError extends Error {
  constructor(message = 'Not authorised') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/** The signed-in admin, or null. Deduplicated per request. */
export const getCurrentAdmin = cache(async (): Promise<AdminUserRow | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // getUser() revalidates with the auth server — getSession() alone only
  // trusts the cookie, which is not enough for an authorization decision.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = data as AdminUserRow | null;
  if (!profile || !profile.is_active) return null;

  return profile;
});

/** Redirects to the login screen when there is no active admin session. */
export async function requireAdmin(): Promise<AdminUserRow> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/**
 * Requires a specific capability. Sends an authenticated user without the
 * capability to the dashboard rather than the login screen, which is the
 * honest outcome: they are signed in, just not permitted.
 */
export async function requireCapability(
  resource: AdminResource,
  capability: Capability = 'view',
): Promise<AdminUserRow> {
  const admin = await requireAdmin();
  if (!can(admin.role, resource, capability)) redirect('/admin?denied=' + resource);
  return admin;
}

/**
 * Server-action variant: throws instead of redirecting, so the action can
 * return a typed failure to the client.
 */
export async function assertCapability(
  resource: AdminResource,
  capability: Capability = 'manage',
): Promise<AdminUserRow> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthorizationError('You are not signed in.');
  if (!can(admin.role, resource, capability)) {
    throw new AuthorizationError(`Your role cannot manage ${resource}.`);
  }
  return admin;
}

/**
 * Privileged client for admin writes.
 *
 * Only ever called after assertCapability(). Returns null when the service
 * role key is absent, which callers surface as a configuration error rather
 * than failing silently.
 */
export function getAdminDb() {
  return getSupabaseAdminClient();
}

/** Records the sign-in timestamp and writes an activity entry. */
export async function recordLogin(admin: AdminUserRow): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id);
}
