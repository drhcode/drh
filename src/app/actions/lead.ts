'use server';

import { randomUUID } from 'node:crypto';
import {
  ATTACHMENT_EXTENSIONS,
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MIME_TYPES,
  BUDGET_ESTIMATE,
  BUDGET_LABELS,
  SERVICE_LABELS,
  TIMELINE_LABELS,
  leadFormSchema,
  type LeadSubmitResult,
} from '@/lib/leads/schema';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  checkRateLimit,
  deriveSource,
  getRequestContext,
  verifyTurnstile,
} from '@/lib/security/request';
import { sendEmail } from '@/lib/email/send';
import { adminLeadEmail, leadConfirmationEmail } from '@/lib/email/templates';
import { logActivity, notifyAdmins } from '@/lib/admin/audit';
import { publicEnv, serverEnv } from '@/lib/env';

/**
 * Project inquiry submission (spec §38).
 *
 * Order of operations:
 *   1. Parse and validate with Zod, server-side
 *   2. Honeypot check
 *   3. Rate limit on a salted IP hash (never the raw address)
 *   4. Cloudflare Turnstile verification
 *   5. Validate and store any attachment in a private bucket
 *   6. Store the lead with full attribution
 *   7. Notify the team by email + in-app notification
 *   8. Confirm to the visitor by email
 *
 * The conversion event is fired by the client on success (step 10 of the spec)
 * so it respects the visitor's cookie consent.
 */
export async function submitLead(formData: FormData): Promise<LeadSubmitResult> {
  // ── 1. Validate ───────────────────────────────────────────────────────────
  const rawAttribution = formData.get('attribution');
  let attribution: Record<string, unknown> | undefined;
  if (typeof rawAttribution === 'string' && rawAttribution) {
    try {
      attribution = JSON.parse(rawAttribution) as Record<string, unknown>;
    } catch {
      attribution = undefined;
    }
  }

  const parsed = leadFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    company: formData.get('company') || undefined,
    website: formData.get('website') || undefined,
    service: formData.get('service'),
    budget: formData.get('budget'),
    timeline: formData.get('timeline'),
    message: formData.get('message'),
    privacy: formData.get('privacy') === 'true' || formData.get('privacy') === 'on',
    language: formData.get('language') ?? 'en',
    company_website: formData.get('company_website') ?? '',
    turnstileToken: formData.get('turnstileToken') || undefined,
    attribution,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, errorKey: 'errorBody', fieldErrors };
  }

  const values = parsed.data;

  // ── 2. Honeypot ───────────────────────────────────────────────────────────
  // A filled hidden field means an automated submission. Report success so the
  // bot does not learn it was rejected; nothing is stored.
  if (values.company_website) return { ok: true };

  const context = await getRequestContext();

  // ── 3. Rate limit ─────────────────────────────────────────────────────────
  const { allowed } = await checkRateLimit('lead', context.identifierHash, {
    limit: 5,
    windowMinutes: 60,
  });
  if (!allowed) return { ok: false, errorKey: 'rateLimited' };

  // ── 4. Turnstile ──────────────────────────────────────────────────────────
  const humanVerified = await verifyTurnstile(values.turnstileToken);
  if (!humanVerified) return { ok: false, errorKey: 'spamCheckFailed' };

  const supabase = getSupabaseAdminClient();

  // ── 5. Attachment ─────────────────────────────────────────────────────────
  let attachmentUrl: string | null = null;
  const file = formData.get('attachment');

  if (file instanceof File && file.size > 0) {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const typeAllowed = (ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type);
    const extensionAllowed = (ATTACHMENT_EXTENSIONS as readonly string[]).includes(extension);

    if (file.size > ATTACHMENT_MAX_BYTES) {
      return { ok: false, fieldErrors: { attachment: 'fileTooLarge' } as never };
    }
    if (!typeAllowed || !extensionAllowed) {
      return { ok: false, fieldErrors: { attachment: 'fileType' } as never };
    }

    if (supabase) {
      // Generated filename: the original is never used as a storage path.
      const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}${extension}`;
      const { error } = await supabase.storage
        .from('lead-attachments')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!error) attachmentUrl = path;
    }
  }

  // ── 6. Store ──────────────────────────────────────────────────────────────
  const attr = values.attribution ?? {};
  const source = deriveSource({
    utmSource: attr.utmSource,
    utmMedium: attr.utmMedium,
    referrer: attr.referrer ?? context.referrer,
  });

  const record = {
    name: values.name,
    email: values.email.toLowerCase(),
    phone: values.phone ?? null,
    company: values.company ?? null,
    website: values.website ?? null,
    service: SERVICE_LABELS[values.service],
    budget: BUDGET_LABELS[values.budget],
    timeline: TIMELINE_LABELS[values.timeline],
    message: values.message,
    attachment_url: attachmentUrl,
    status: 'new' as const,
    estimated_value: BUDGET_ESTIMATE[values.budget],
    language: values.language,
    source,
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

  if (supabase) {
    const { data, error } = await supabase.from('leads').insert(record).select('id').single();

    if (error) {
      console.error('[lead] failed to store', error.message);
      return { ok: false, errorKey: 'errorBody' };
    }
    leadId = data.id as string;
  } else {
    // No database configured: the enquiry is still emailed, and the failure to
    // persist is surfaced in the server log rather than silently swallowed.
    console.warn('[lead] Supabase not configured — lead emailed but not stored');
  }

  // ── 7 & 8. Email the team and the visitor ────────────────────────────────
  const admin = adminLeadEmail({
    id: leadId,
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    website: record.website,
    service: record.service,
    budget: record.budget,
    timeline: record.timeline,
    message: record.message,
    source: record.source,
    landingPage: record.landing_page,
    sourcePage: record.source_page,
    utmCampaign: record.utm_campaign,
    country: record.country,
    device: record.device,
    // The file lives in a private bucket; the team opens it from the lead page
    // through a short-lived signed URL rather than a public link.
    attachmentUrl: attachmentUrl ? `${publicEnv.siteUrl}/admin/leads/${leadId}` : null,
  });

  const confirmation = leadConfirmationEmail({
    name: record.name.split(' ')[0] ?? record.name,
    language: values.language,
  });

  const [adminEmail, visitorEmail] = await Promise.all([
    sendEmail({
      to: serverEnv.emailAdminTo,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: record.email,
    }),
    sendEmail({
      to: record.email,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    }),
  ]);

  await Promise.all([
    notifyAdmins({
      kind: 'lead',
      title: `New lead — ${record.name}`,
      body: `${record.service} · ${record.budget} · ${record.timeline}`,
      href: `/admin/leads/${leadId}`,
      severity: 'success',
    }),
    logActivity({
      action: 'created',
      entityType: 'lead',
      entityId: leadId,
      entityLabel: record.name,
      metadata: { source: record.source, service: record.service },
    }),
    // Surface delivery problems in the notification centre (spec §78).
    !adminEmail.sent && adminEmail.error !== 'not_configured'
      ? notifyAdmins({
          kind: 'form',
          title: 'Lead notification email failed',
          body: `Lead ${record.name} was stored but the notification email failed: ${adminEmail.error}`,
          href: `/admin/leads/${leadId}`,
          severity: 'error',
        })
      : Promise.resolve(),
    !visitorEmail.sent && visitorEmail.error !== 'not_configured'
      ? notifyAdmins({
          kind: 'form',
          title: 'Lead confirmation email failed',
          body: `The confirmation to ${record.email} could not be delivered: ${visitorEmail.error}`,
          href: `/admin/leads/${leadId}`,
          severity: 'warning',
        })
      : Promise.resolve(),
  ]);

  return { ok: true };
}
