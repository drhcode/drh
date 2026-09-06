import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicEnv, serverEnv, hasServiceRole } from '@/lib/env';

let cached: SupabaseClient | null = null;

/**
 * Service-role client. Bypasses Row Level Security.
 *
 * SERVER ONLY. Use for writes the public cannot be trusted with — storing
 * leads, newsletter signups, rate-limit records, activity logs and admin
 * mutations whose permissions have already been checked by requireRole().
 *
 * Every call site must have performed its own authorisation check first;
 * this client performs none.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!hasServiceRole) return null;
  cached ??= createClient(publicEnv.supabaseUrl!, serverEnv.supabaseServiceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
