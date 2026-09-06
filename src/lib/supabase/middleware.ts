import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { publicEnv, isSupabaseConfigured } from '@/lib/env';

/**
 * Refreshes the Supabase auth session on every request and reports whether one
 * exists. Called from middleware.ts before the /admin guard.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<{ isAuthenticated: boolean; response: NextResponse }> {
  if (!isSupabaseConfigured) return { isAuthenticated: false, response };

  let workingResponse = response;

  const supabase = createServerClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        workingResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          workingResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() revalidates the token with Supabase; getSession() alone trusts
  // the cookie, which is not good enough for an authorisation decision.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { isAuthenticated: Boolean(user), response: workingResponse };
}
