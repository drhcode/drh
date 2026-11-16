import { z } from 'zod';
import { attributionSchema } from './schema';

/**
 * Validation for the two lightweight request forms: a strategy-call request
 * (/book, when no booking provider is configured) and a free website audit
 * (/audit). Shared by the browser and re-run on the server.
 */

/** Times offered on /book, in Europe/Tirane. */
export const CALL_SLOTS = ['09:30', '10:30', '11:30', '14:00', '15:00', '16:30'] as const;
export const CALL_TIMEZONE = 'Europe/Tirane';
/** How far ahead a call can be requested. */
export const BOOKING_WINDOW_DAYS = 60;

const DAY = 24 * 60 * 60 * 1000;

/** Calendar date in Tirana for an instant, as YYYY-MM-DD. */
export function tiranaDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CALL_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/**
 * A requestable day: a weekday after today (Tirana time) and no more than
 * BOOKING_WINDOW_DAYS ahead.
 */
export function isRequestableDate(date: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const day = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date) return false;
  const weekday = day.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  const today = new Date(`${tiranaDate(now)}T12:00:00Z`);
  const diff = Math.round((day.getTime() - today.getTime()) / DAY);
  return diff >= 1 && diff <= BOOKING_WINDOW_DAYS;
}

const name = z.string().trim().min(2, 'nameTooShort').max(120);
const email = z.string().trim().email('emailInvalid').max(200);
const honeypot = z.string().max(500).optional();

export const callRequestSchema = z.object({
  name,
  email,
  date: z.string().refine((value) => isRequestableDate(value), 'dateInvalid'),
  time: z.enum(CALL_SLOTS, { message: 'timeRequired' }),
  topic: z
    .string()
    .trim()
    .max(1200, 'messageTooLong')
    .optional()
    .transform((value) => (value ? value : undefined)),
  language: z.enum(['en', 'sq']).default('en'),
  company_website: honeypot,
  turnstileToken: z.string().optional(),
  attribution: attributionSchema.optional(),
});

export type CallRequestInput = z.input<typeof callRequestSchema>;

/**
 * Accepts "example.al", "www.example.al/page" or a full http(s) URL and
 * returns a normalised https URL — or null for anything that is not a public
 * web address (no scheme other than http/https, a dotted host, no spaces).
 */
export function normaliseSiteUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value || /\s/.test(value) || value.length > 300) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const auditRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'urlRequired')
    .max(300, 'urlInvalid')
    .refine((value) => normaliseSiteUrl(value) !== null, 'urlInvalid')
    .transform((value) => normaliseSiteUrl(value) as string),
  email,
  locale: z.enum(['en', 'sq', 'it']).default('en'),
  company_website: honeypot,
  turnstileToken: z.string().optional(),
  attribution: attributionSchema.optional(),
});

export type AuditRequestInput = z.input<typeof auditRequestSchema>;

export interface RequestResult {
  ok: boolean;
  errorKey?: 'errorBody' | 'spamCheckFailed' | 'rateLimited';
  fieldErrors?: Record<string, string>;
}

/** First issue per field, as message keys for the client to translate. */
export function fieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !out[field]) out[field] = issue.message;
  }
  return out;
}
