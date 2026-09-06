import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';

/** Double opt-in confirmation link target (spec §76). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const home = new URL('/', publicEnv.siteUrl);

  if (!token) return NextResponse.redirect(home);

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.redirect(home);

  const { data } = await supabase
    .from('newsletter_subscribers')
    .update({
      status: 'subscribed',
      confirmed_at: new Date().toISOString(),
      confirm_token: null,
    })
    .eq('confirm_token', token)
    .select('email')
    .maybeSingle();

  const target = new URL('/', publicEnv.siteUrl);
  target.searchParams.set('newsletter', data ? 'confirmed' : 'invalid');
  return NextResponse.redirect(target);
}
