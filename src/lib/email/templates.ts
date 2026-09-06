import { publicEnv } from '@/lib/env';

/**
 * Branded transactional email templates (spec §83).
 *
 * Written as inline-styled HTML strings rather than React components: email
 * clients need table layouts and inline styles, and this keeps the dependency
 * surface small. Every dynamic value passes through `esc()`.
 */

const INK = '#1a1918';
const MUTED = '#6b6660';
const LINE = '#e4e0da';
const PAPER = '#faf9f7';
const ACCENT = '#2f5fe0';

export function esc(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shell({ preheader, body }: { preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>drh.al</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden;">
      <tr><td style="padding:26px 32px;border-bottom:1px solid ${LINE};">
        <span style="font-size:17px;font-weight:700;letter-spacing:-0.3px;color:${INK};">drh<span style="color:${ACCENT};">.</span>al</span>
      </td></tr>
      <tr><td style="padding:32px;">${body}</td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid ${LINE};background:${PAPER};">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
          drh.al — Digital products built in Albania for ambitious businesses worldwide.<br>
          <a href="mailto:info@drh.al" style="color:${MUTED};">info@drh.al</a> ·
          <a href="tel:+355682041518" style="color:${MUTED};">+355 68 204 1518</a> ·
          <a href="${publicEnv.siteUrl}" style="color:${MUTED};">drh.al</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return '';
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${MUTED};width:38%;vertical-align:top;">${esc(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};vertical-align:top;">${value}</td>
  </tr>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px;">${esc(label)}</a>`;
}

export interface AdminLeadEmailData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  source?: string | null;
  landingPage?: string | null;
  sourcePage?: string | null;
  utmCampaign?: string | null;
  country?: string | null;
  device?: string | null;
  attachmentUrl?: string | null;
}

/** Internal notification (spec §83). */
export function adminLeadEmail(lead: AdminLeadEmailData): { subject: string; html: string; text: string } {
  const leadUrl = `${publicEnv.siteUrl}/admin/leads/${lead.id}`;

  const body = `
    <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1.2px;color:${ACCENT};font-weight:600;">New project inquiry</p>
    <h1 style="margin:0 0 4px;font-size:22px;line-height:1.3;color:${INK};">${esc(lead.name)}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">${esc(lead.company ?? 'No company given')}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">
      ${row('Email', `<a href="mailto:${esc(lead.email)}" style="color:${ACCENT};text-decoration:none;">${esc(lead.email)}</a>`)}
      ${row('Phone', lead.phone ? `<a href="tel:${esc(lead.phone)}" style="color:${ACCENT};text-decoration:none;">${esc(lead.phone)}</a>` : '')}
      ${row('Website', lead.website ? `<a href="${esc(lead.website)}" style="color:${ACCENT};text-decoration:none;">${esc(lead.website)}</a>` : '')}
      ${row('Service', esc(lead.service))}
      ${row('Budget', esc(lead.budget))}
      ${row('Timeline', esc(lead.timeline))}
      ${row('Source', esc(lead.source ?? 'direct'))}
      ${row('Campaign', esc(lead.utmCampaign))}
      ${row('Landing page', esc(lead.landingPage))}
      ${row('Submitted from', esc(lead.sourcePage))}
      ${row('Country', esc(lead.country))}
      ${row('Device', esc(lead.device))}
      ${row('Attachment', lead.attachmentUrl ? `<a href="${esc(lead.attachmentUrl)}" style="color:${ACCENT};">Download</a>` : '')}
    </table>

    <p style="margin:26px 0 8px;font-size:13px;color:${MUTED};font-weight:600;">Project details</p>
    <div style="background:${PAPER};border:1px solid ${LINE};border-radius:10px;padding:16px;font-size:14px;line-height:1.65;color:${INK};white-space:pre-wrap;">${esc(lead.message)}</div>

    <div style="margin-top:28px;">${button(leadUrl, 'View Lead')}</div>
  `;

  const text = [
    `New drh.al project inquiry — ${lead.name}`,
    '',
    `Name: ${lead.name}`,
    `Company: ${lead.company ?? '—'}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone ?? '—'}`,
    `Service: ${lead.service}`,
    `Budget: ${lead.budget}`,
    `Timeline: ${lead.timeline}`,
    `Source: ${lead.source ?? 'direct'}`,
    '',
    lead.message,
    '',
    `View lead: ${leadUrl}`,
  ].join('\n');

  return {
    subject: `New drh.al Project Inquiry — ${lead.name}`,
    html: shell({ preheader: `${lead.service} · ${lead.budget} · ${lead.timeline}`, body }),
    text,
  };
}

/** Customer confirmation (spec §83). */
export function leadConfirmationEmail({
  name,
  language,
}: {
  name: string;
  language: 'en' | 'sq';
}): { subject: string; html: string; text: string } {
  const copy =
    language === 'sq'
      ? {
          subject: 'E morëm përshkrimin e projektit tuaj — drh.al',
          eyebrow: 'Faleminderit',
          heading: `Faleminderit, ${name}.`,
          p1: 'E kemi marrë përshkrimin e projektit tuaj. Ekipi ynë e shqyrton personalisht çdo kërkesë.',
          p2: 'Do t’ju përgjigjemi brenda 24 orësh pune me hapat e rekomanduar dhe pyetjet që na duhen për të përgatitur një ofertë të saktë.',
          p3: 'Nëse çështja është urgjente, na shkruani direkt në info@drh.al ose në WhatsApp.',
          cta: 'Shiko punën tonë',
          signoff: 'Përshëndetje,\nEkipi i drh.al',
        }
      : {
          subject: "We've Received Your Project Brief — drh.al",
          eyebrow: 'Thank you',
          heading: `Thanks, ${name}.`,
          p1: 'Your project brief has arrived. Every enquiry is reviewed personally by our team — nothing here is automated beyond this confirmation.',
          p2: 'We will reply within 24 business hours with recommended next steps and any questions we need answered to scope the work accurately.',
          p3: 'If anything is urgent in the meantime, reply to this email or message us on WhatsApp.',
          cta: 'View our work',
          signoff: 'Best,\nThe drh.al team',
        };

  const body = `
    <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1.2px;color:${ACCENT};font-weight:600;">${esc(copy.eyebrow)}</p>
    <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:${INK};">${esc(copy.heading)}</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${MUTED};">${esc(copy.p1)}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${MUTED};">${esc(copy.p2)}</p>
    <p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:${MUTED};">${esc(copy.p3)}</p>
    <div>${button(`${publicEnv.siteUrl}${language === 'sq' ? '/sq' : ''}/work`, copy.cta)}</div>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:${MUTED};white-space:pre-line;">${esc(copy.signoff)}</p>
  `;

  return {
    subject: copy.subject,
    html: shell({ preheader: copy.p2, body }),
    text: `${copy.heading}\n\n${copy.p1}\n\n${copy.p2}\n\n${copy.p3}\n\n${copy.signoff}`,
  };
}

/** Double opt-in confirmation for the newsletter (spec §76). */
export function newsletterConfirmEmail({
  confirmUrl,
  language,
}: {
  confirmUrl: string;
  language: 'en' | 'sq';
}): { subject: string; html: string; text: string } {
  const copy =
    language === 'sq'
      ? {
          subject: 'Konfirmoni abonimin — drh.al',
          heading: 'Një klikim dhe keni mbaruar',
          p1: 'Klikoni butonin më poshtë për të konfirmuar abonimin te njohuritë e drh.al mbi web, aplikacione dhe rritje.',
          cta: 'Konfirmo abonimin',
          p2: 'Nëse nuk e keni kërkuar ju këtë, thjesht injorojeni këtë email.',
        }
      : {
          subject: 'Confirm your subscription — drh.al',
          heading: 'One click and you are set',
          p1: 'Click the button below to confirm your subscription to drh.al insights on web, apps and growth.',
          cta: 'Confirm subscription',
          p2: 'If you did not request this, simply ignore this email.',
        };

  const body = `
    <h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;color:${INK};">${esc(copy.heading)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${MUTED};">${esc(copy.p1)}</p>
    <div>${button(confirmUrl, copy.cta)}</div>
    <p style="margin:26px 0 0;font-size:13px;line-height:1.7;color:${MUTED};">${esc(copy.p2)}</p>
  `;

  return {
    subject: copy.subject,
    html: shell({ preheader: copy.p1, body }),
    text: `${copy.heading}\n\n${copy.p1}\n\n${confirmUrl}\n\n${copy.p2}`,
  };
}
