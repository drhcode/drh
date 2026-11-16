import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { draftMode } from 'next/headers';
import { publicEnv, isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from './server';

let anonClient: SupabaseClient | null = null;

/**
 * Client for public content reads.
 *
 * An ordinary visit reads published content only, so it uses a cookie-less
 * anon client: reading the request's cookies would opt every public page out
 * of static generation, and RLS already limits the anon role to published
 * rows. A draft preview (enabled only by the admin preview route, after its
 * own authorisation check) needs the editor's session to read unpublished
 * rows, so it gets the cookie-aware server client instead.
 */
export async function createPublicReadClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;

  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {
    // No request scope (build-time reads): never a preview.
  }
  if (preview) return createSupabaseServerClient();

  anonClient ??= createClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonClient;
}
