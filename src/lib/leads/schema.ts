import { z } from 'zod';

/**
 * One schema, used by the browser form and re-run on the server (spec §38).
 * Client-side validation is a convenience; the server never trusts it.
 */

export const SERVICE_OPTIONS = [
  'web_design_development',
  'custom_web_application',
  'mobile_app',
  'wordpress_woocommerce',
  'ui_ux',
  'seo',
  'google_ads',
  'meta_ads',
  'other',
] as const;

export const BUDGET_OPTIONS = ['under_2k', '2k_5k', '5k_15k', '15k_30k', '30k_plus'] as const;

export const TIMELINE_OPTIONS = [
  'asap',
  '1_2_months',
  '3_6_months',
  '6_plus_months',
  'flexible',
] as const;

export const MESSAGE_MAX = 1200;

/** Midpoint of each band, used to seed the pipeline value in the CRM. */
export const BUDGET_ESTIMATE: Record<(typeof BUDGET_OPTIONS)[number], number> = {
  under_2k: 1500,
  '2k_5k': 3500,
  '5k_15k': 10000,
  '15k_30k': 22500,
  '30k_plus': 40000,
};

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export const ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ATTACHMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

/** Attribution captured in the browser and re-checked server-side. */
export const attributionSchema = z.object({
  landingPage: optionalString(500),
  sourcePage: optionalString(500),
  referrer: optionalString(500),
  utmSource: optionalString(200),
  utmMedium: optionalString(200),
  utmCampaign: optionalString(200),
  utmContent: optionalString(200),
  utmTerm: optionalString(200),
  firstTouch: z.record(z.string(), z.string().max(500)).optional(),
});

export type AttributionInput = z.infer<typeof attributionSchema>;

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, 'nameTooShort').max(120),
  email: z.string().trim().email('emailInvalid').max(200),
  phone: optionalString(60),
  company: optionalString(160),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .refine(
      (value) => !value || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(value),
      'urlInvalid',
    )
    .transform((value) => (value ? value : undefined)),
  service: z.enum(SERVICE_OPTIONS, { message: 'serviceRequired' }),
  budget: z.enum(BUDGET_OPTIONS, { message: 'budgetRequired' }),
  timeline: z.enum(TIMELINE_OPTIONS, { message: 'timelineRequired' }),
  message: z
    .string()
    .trim()
    .min(20, 'messageTooShort')
    .max(MESSAGE_MAX, 'messageTooLong'),
  privacy: z.boolean().refine((value) => value === true, { message: 'privacyRequired' }),
  language: z.enum(['en', 'sq']).default('en'),
  /**
   * Honeypot. Real people never see this field, so any value means a bot.
   *
   * Deliberately unconstrained: rejecting it here would return a validation
   * error naming the field, which teaches a bot to leave it empty. The action
   * checks it explicitly and answers with a neutral success instead.
   */
  company_website: z.string().max(500).optional(),
  turnstileToken: z.string().optional(),
  attribution: attributionSchema.optional(),
});

export type LeadFormValues = z.input<typeof leadFormSchema>;
export type LeadFormParsed = z.output<typeof leadFormSchema>;

export interface LeadSubmitResult {
  ok: boolean;
  /** Message key from the `form` namespace, when something went wrong. */
  errorKey?: 'errorBody' | 'spamCheckFailed' | 'rateLimited';
  fieldErrors?: Partial<Record<keyof LeadFormValues, string>>;
}

/** Human-readable labels stored on the lead so the CRM is readable at a glance. */
export const SERVICE_LABELS: Record<(typeof SERVICE_OPTIONS)[number], string> = {
  web_design_development: 'Web Design & Development',
  custom_web_application: 'Custom Web Application',
  mobile_app: 'Mobile App',
  wordpress_woocommerce: 'WordPress / WooCommerce',
  ui_ux: 'UI/UX',
  seo: 'SEO',
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  other: 'Other',
};

export const BUDGET_LABELS: Record<(typeof BUDGET_OPTIONS)[number], string> = {
  under_2k: 'Under €2,000',
  '2k_5k': '€2,000 – €5,000',
  '5k_15k': '€5,000 – €15,000',
  '15k_30k': '€15,000 – €30,000',
  '30k_plus': '€30,000+',
};

export const TIMELINE_LABELS: Record<(typeof TIMELINE_OPTIONS)[number], string> = {
  asap: 'ASAP',
  '1_2_months': '1–2 months',
  '3_6_months': '3–6 months',
  '6_plus_months': '6+ months',
  flexible: 'Flexible',
};

/** Newsletter signup, used by the footer form and /api/newsletter. */
export const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
  language: z.enum(['en', 'sq']).default('en'),
  source: z.string().trim().max(80).optional(),
});
