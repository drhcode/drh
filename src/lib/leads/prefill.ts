import {
  BUDGET_OPTIONS,
  MESSAGE_MAX,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
} from './schema';

type Service = (typeof SERVICE_OPTIONS)[number];
type Budget = (typeof BUDGET_OPTIONS)[number];
type Timeline = (typeof TIMELINE_OPTIONS)[number];

export interface LeadPrefill {
  service?: Service;
  budget?: Budget;
  timeline?: Timeline;
  message?: string;
}

/** Service page slugs → the contact form's service options. */
export const SERVICE_BY_SLUG: Record<string, Service> = {
  'web-development': 'web_design_development',
  'web-app-development': 'custom_web_application',
  'mobile-app-development': 'mobile_app',
  'wordpress-development': 'wordpress_woocommerce',
  'ecommerce-development': 'web_design_development',
  'ui-ux-design': 'ui_ux',
  seo: 'seo',
  'google-ads': 'google_ads',
};

const isOneOf = <T extends string>(list: readonly T[], value: string | null): value is T =>
  value !== null && (list as readonly string[]).includes(value);

/**
 * Reads `?service=&budget=&timeline=&brief=` from a query string. Links from
 * the price estimator, the service pages and the pricing tiers use it to
 * pre-fill the contact form. Anything unrecognised is ignored; nothing here
 * bypasses validation — the visitor still submits through the same schema.
 */
export function parsePrefill(search: string): LeadPrefill {
  const params = new URLSearchParams(search);
  const out: LeadPrefill = {};

  const service = params.get('service');
  if (isOneOf(SERVICE_OPTIONS, service)) out.service = service;
  else if (service && SERVICE_BY_SLUG[service]) out.service = SERVICE_BY_SLUG[service];

  const budget = params.get('budget');
  if (isOneOf(BUDGET_OPTIONS, budget)) out.budget = budget;

  const timeline = params.get('timeline');
  if (isOneOf(TIMELINE_OPTIONS, timeline)) out.timeline = timeline;

  const brief = params.get('brief')?.trim();
  if (brief) out.message = brief.slice(0, MESSAGE_MAX);

  return out;
}

/** The three steps and the fields each one validates before moving on. */
export const LEAD_STEPS = [
  ['service'],
  ['budget', 'timeline'],
  ['name', 'email', 'phone', 'company', 'website', 'message', 'privacy'],
] as const;
