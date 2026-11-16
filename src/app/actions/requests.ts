'use server';

import { randomUUID } from 'node:crypto';
import {
  CALL_TIMEZONE,
  auditRequestSchema,
  callRequestSchema,
  fieldErrors,
  type RequestResult,
} from '@/lib/leads/requests';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, deriveSource, getRequestContext, verifyTurnstile } from '@/lib/security/request';
import { sendEmail } from '@/lib/email/send';
import { adminRequestEmail } from '@/lib/email/templates';
import { logActivity, notifyAdmins } from '@/lib/admin/audit';
import { publicEnv, serverEnv } from '@/lib/env';

/**
 * Server actions for /book (call request fallback) and /audit.
 *
 * Same pipeline as the project inquiry: Zod on the server → honeypot →
 * rate limit on a salted IP hash → Turnstile → store → notify the team.
 */

function parseAttribution(raw: FormDataEntryValue | null): Record<string, unknown> | undefined {
  if (typeof raw !== 'string' || !raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/* ── Strategy call request → leads ──────────────────────────────────────── */
export async function requestCall(formData: FormData): Promise<RequestResult> {
  const parsed = callRequestSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    date: formData.get('date'),
    time: formData.get('time'),
    topic: formData.get('topic') || undefined,
    language: formData.get('language') ?? 'en',
    company_website: formData.get('company_website') ?? '',
    turnstileToken: formData.get('turnstileToken') || undefined,
    attribution: parseAttribution(formData.get('attribution')),
  });
  if (!parsed.success) return { ok: false, errorKey: 'errorBody', fieldErrors: fieldErrors(parsed.error.issues) };

  const values = parsed.data;
  if (values.company_website) return { ok: true }; // honeypot: neutral success, nothing stored

  const context = await getRequestContext();
  const { allowed } = await checkRateLimit('call', context.identifierHash, { limit: 5, windowMinutes: 60 });
  if (!allowed) return { ok: false, errorKey: 'rateLimited' };
  if (!(await verifyTurnstile(values.turnstileToken))) return { ok: false, errorKey: 'spamCheckFailed' };

  const attr = values.attribution ?? {};
  const slot = `${values.date} ${values.time} (${CALL_TIMEZONE})`;
  const message = [`Requested a free 30-minute strategy call.`, `Preferred time: ${slot}`, values.topic ? `\n${values.topic}` : '']
    .filter(Boolean)
    .join('\n');

  const record = {
    name: values.name,
    email: values.email.toLowerCase(),
    service: 'Strategy call request',
    message,
    status: 'new' as const,
    language: values.language,
    source: deriveSource({ utmSource: attr.utmSource, utmMedium: attr.utmMedium, referrer: attr.referrer ?? context.referrer }),
    source_page: attr.sourcePage ?? null,
    landing_page: attr.landingPage ?? null,
    referrer: attr.referrer ?? context.referrer,
    utm_source: attr.utmSource ?? null,
    utm_medium: attr.utmMedium ?? null,
    utm_campaign: attr.utmCampaign ?? null,
    utm_content: attr.utmContent ?? null,
    utm_term: attr.utmTerm ?? null,
    first_touch: attr.firstTouch ?? null,
    country: context.country,
    city: context.city,
    device: context.device,
  };

  let leadId: string = randomUUID();
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from('leads').insert(record).select('id').single();
    if (error) {
      console.error('[call-request] failed to store', error.message);
      return { ok: false, errorKey: 'errorBody' };
    }
    leadId = data.id as string;
  } else {
    console.warn('[call-request] Supabase not configured — request emailed but not stored');
  }

  const href = `${publicEnv.siteUrl}/admin/leads/${leadId}`;
  const email = adminRequestEmail({
    kind: 'Strategy call request',
    title: `${record.name} — ${slot}`,
    rows: [
      ['Email', record.email],
      ['Preferred time', slot],
      ['Language', values.language],
      ['Source', record.source],
      ['Submitted from', record.source_page],
      ['Country', record.country],
    ],
    note: values.topic,
    href,
    hrefLabel: 'View lead',
  });

  await Promise.all([
    sendEmail({ to: serverEnv.emailAdminTo, subject: email.subject, html: email.html, text: email.text, replyTo: record.email }),
    notifyAdmins({ kind: 'lead', title: `Call request — ${record.name}`, body: slot, href: `/admin/leads/${leadId}`, severity: 'success' }),
    logActivity({ action: 'created', entityType: 'lead', entityId: leadId, entityLabel: record.name, metadata: { source: record.source, kind: 'call_request' } }),
  ]);

  return { ok: true };
}

/* ── Free website audit → audit_requests ───────────────────────────────── */
export async function requestAudit(formData: FormData): Promise<RequestResult> {
  const parsed = auditRequestSchema.safeParse({
    url: formData.get('url'),
    email: formData.get('email'),
    locale: formData.get('locale') ?? 'en',
    company_website: formData.get('company_website') ?? '',
    turnstileToken: formData.get('turnstileToken') || undefined,
    attribution: parseAttribution(formData.get('attribution')),
  });
  if (!parsed.success) return { ok: false, errorKey: 'errorBody', fieldErrors: fieldErrors(parsed.error.issues) };

  const values = parsed.data;
  if (values.company_website) return { ok: true };

  const context = await getRequestContext();
  const { allowed } = await checkRateLimit('audit', context.identifierHash, { limit: 3, windowMinutes: 60 });
  if (!allowed) return { ok: false, errorKey: 'rateLimited' };
  if (!(await verifyTurnstile(values.turnstileToken))) return { ok: false, errorKey: 'spamCheckFailed' };

  const attr = values.attribution ?? {};
  const row = {
    url: values.url,
    email: values.email.toLowerCase(),
    locale: values.locale,
    source_page: attr.sourcePage ?? null,
    referrer: attr.referrer ?? context.referrer,
    utm_source: attr.utmSource ?? null,
    utm_medium: attr.utmMedium ?? null,
    utm_campaign: attr.utmCampaign ?? null,
    country: context.country,
    device: context.device,
  };

  let id: string = randomUUID();
  let href = `${publicEnv.siteUrl}/admin`;
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from('audit_requests').insert(row).select('id').single();
    if (error) {
      // Before migration 0004 is applied the table does not exist. Keep the
      // request rather than lose it: store it as a lead instead.
      console.error('[audit-request] failed to store in audit_requests', error.message);
      const fallback = await supabase
        .from('leads')
        .insert({
          name: row.email,
          email: row.email,
          website: row.url,
          service: 'Website audit request',
          message: `Free website audit requested for ${row.url}`,
          status: 'new',
          language: values.locale === 'sq' ? 'sq' : 'en',
          source: deriveSource({ utmSource: attr.utmSource, utmMedium: attr.utmMedium, referrer: row.referrer }),
          source_page: row.source_page,
          referrer: row.referrer,
          country: row.country,
          device: row.device,
        })
        .select('id')
        .single();
      if (fallback.error) return { ok: false, errorKey: 'errorBody' };
      id = fallback.data.id as string;
      href = `${publicEnv.siteUrl}/admin/leads/${id}`;
    } else {
      id = data.id as string;
    }
  } else {
    console.warn('[audit-request] Supabase not configured — request emailed but not stored');
  }

  const email = adminRequestEmail({
    kind: 'Website audit request',
    title: row.url,
    rows: [
      ['Website', row.url],
      ['Email', row.email],
      ['Language', row.locale],
      ['Submitted from', row.source_page],
      ['Campaign', row.utm_campaign],
      ['Country', row.country],
      ['Device', row.device],
    ],
    note: 'Reply with the report within 24 hours (promised on /audit).',
    href,
    hrefLabel: 'Open admin',
  });

  await Promise.all([
    sendEmail({ to: serverEnv.emailAdminTo, subject: email.subject, html: email.html, text: email.text, replyTo: row.email }),
    notifyAdmins({ kind: 'form', title: `Audit request — ${row.url}`, body: row.email, href: '/admin', severity: 'success' }),
    logActivity({ action: 'created', entityType: 'audit_request', entityId: id, entityLabel: row.url, metadata: { email: row.email } }),
  ]);

  return { ok: true };
}
