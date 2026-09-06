import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';
import { publicEnv, isSupabaseConfigured } from '@/lib/env';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Managed redirects (spec §66).
 *
 * Read straight from PostgREST and cached in module scope for a minute so a
 * redirect added in /admin/redirects takes effect quickly without adding a
 * database round trip to every request.
 */
interface CachedRedirect {
  source: string;
  destination: string;
  status_code: number;
}

let redirectCache: CachedRedirect[] = [];
let redirectCacheAt = 0;
const REDIRECT_TTL_MS = 60_000;

async function getRedirects(): Promise<CachedRedirect[]> {
  if (!isSupabaseConfigured) return [];
  const now = Date.now();
  if (now - redirectCacheAt < REDIRECT_TTL_MS) return redirectCache;

  try {
    const response = await fetch(
      `${publicEnv.supabaseUrl}/rest/v1/redirects?select=source,destination,status_code&is_active=eq.true`,
      {
        headers: {
          apikey: publicEnv.supabaseAnonKey!,
          Authorization: `Bearer ${publicEnv.supabaseAnonKey}`,
        },
        cache: 'no-store',
      },
    );
    if (response.ok) {
      redirectCache = (await response.json()) as CachedRedirect[];
      redirectCacheAt = now;
    }
  } catch {
    // A redirect lookup must never take the site down — serve the stale list.
  }
  return redirectCache;
}

const normalise = (path: string) =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ── Managed redirects, with a guard against self-referencing loops ────────
  const rules = await getRedirects();
  if (rules.length > 0) {
    const from = normalise(pathname);
    const rule = rules.find((r) => normalise(r.source) === from);
    if (rule && normalise(rule.destination) !== from) {
      const destination = rule.destination.startsWith('http')
        ? new URL(rule.destination)
        : new URL(`${rule.destination}${search}`, request.url);
      return NextResponse.redirect(destination, rule.status_code);
    }
  }

  // ── Admin: authenticate before anything renders (spec §41) ───────────────
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next({ request });
    const { isAuthenticated, response: sessionResponse } = await updateSession(request, response);

    const isLoginRoute = pathname === '/admin/login' || pathname.startsWith('/admin/auth');

    if (!isAuthenticated && !isLoginRoute) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    sessionResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return sessionResponse;
  }

  // ── Everything else is the localized public site ─────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Everything except:
     *  - /api and /_next internals
     *  - files with an extension (images, fonts, sitemap.xml, robots.txt…)
     */
    '/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)',
  ],
};
