import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { newsletterSchema } from '@/lib/leads/schema';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getRequestContext } from '@/lib/security/request';
import { sendEmail } from '@/lib/email/send';
import { newsletterConfirmEmail } from '@/lib/email/templates';
import { notifyAdmins } from '@/lib/admin/audit';
import { publicEnv } from '@/lib/env';

/**
 * Newsletter subscription with double opt-in (spec §76).
 *
 * The subscriber is stored as `pending` and only becomes `subscribed` after
 * clicking the confirmation link, so a mistyped address can never be added.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const context = await getRequestContext();
  const { allowed } = await checkRateLimit('newsletter', context.identifierHash, {
    limit: 5,
    windowMinutes: 60,
  });
  if (!allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const { email, language, source } = parsed.data;
  const supabase = getSupabaseAdminClient();
  const token = randomUUID();

  if (supabase) {
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      {
        email: email.toLowerCase(),
        language,
        source: source ?? 'website',
        status: 'pending',
        confirm_token: token,
      },
      { onConflict: 'email', ignoreDuplicates: false },
    );

    if (error) {
      console.error('[newsletter] store failed', error.message);
      return NextResponse.json({ error: 'store_failed' }, { status: 500 });
    }
  }

  const confirmUrl = `${publicEnv.siteUrl}/api/newsletter/confirm?token=${token}`;
  const message = newsletterConfirmEmail({ confirmUrl, language });

  await sendEmail({
    to: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  await notifyAdmins({
    kind: 'subscriber',
    title: 'New newsletter signup',
    body: `${email} (pending confirmation)`,
    href: '/admin/newsletter',
  });

  // Always the same response shape, so the endpoint cannot be used to probe
  // whether an address is already subscribed.
  return NextResponse.json({ ok: true });
}
