import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { getGa4Realtime } from '@/lib/analytics/ga4';

/**
 * Live visitor counts for the dashboard card.
 *
 * Polled from the browser, so it re-checks the caller's role on every request
 * rather than trusting that the page rendered for someone allowed to see it.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin || !can(admin.role, 'dashboard')) {
    return NextResponse.json({ status: 'error', message: 'Not authorised' }, { status: 401 });
  }

  const result = await getGa4Realtime();
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
