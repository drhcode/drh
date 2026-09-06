import { NextResponse, type NextRequest } from 'next/server';
import { getSearchIndex } from '@/lib/data';
import { isAppLocale } from '@/i18n/routing';

export const revalidate = 900;

/**
 * Search index for the ⌘K palette (spec §71).
 * Published content only — the data layer never returns drafts to public reads.
 */
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get('locale') ?? 'en';
  const locale = isAppLocale(requested) ? requested : 'en';

  const results = await getSearchIndex(locale);

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
  );
}
