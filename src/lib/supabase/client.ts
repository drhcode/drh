'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicEnv, isSupabaseConfigured } from '@/lib/env';

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser Supabase client. Uses the anon key, which is public by design and
 * constrained by Row Level Security. Never used for privileged writes.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  cached ??= createBrowserClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!);
  return cached;
}
