import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { publicEnv, isSupabaseConfigured } from '@/lib/env';

/**
 * Request-scoped Supabase client that carries the signed-in admin's session.
 *
 * Every query made through this client is subject to Row Level Security, which
 * is the second layer of defence behind the explicit role checks in
 * src/lib/auth/guard.ts.
 *
 * Returns null when Supabase is not configured, so public pages can fall back
 * to the local seed dataset instead of throwing.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;

  let cookieStore: Awaited<ReturnType<typeof cookies>>;

  try {
    cookieStore = await cookies();
  } catch {
    /*
     * No request scope — this is generateStaticParams, sitemap generation or
     * another build-time read. There is no session to carry, so use a plain
     * anon client. RLS still applies, which is exactly what we want: build-time
     * reads see published content only, never drafts.
     */
    return createClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createServerClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          });
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}
