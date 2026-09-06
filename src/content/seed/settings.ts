import type { IntegrationRow, SiteSettingRow } from '@/types/database';

/** Canonical company facts (spec §99). Editable from /admin/settings. */
export interface CompanySettings {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  address: string;
  mapsUrl: string;
  location: string;
  serviceArea: string;
  businessHours: string;
  footerText: string;
  copyright: string;
  logo: string;
  logoDark: string;
  favicon: string;
  defaultOgImage: string;
  social: {
    instagram: string;
    linkedin: string;
    facebook: string;
    github: string;
  };
}

export const defaultCompanySettings: CompanySettings = {
  companyName: 'drh.al',
  tagline: 'Digital products built in Albania for ambitious businesses worldwide.',
  email: 'info@drh.al',
  phone: '+355682041518',
  phoneDisplay: '+355 68 204 1518',
  whatsapp: '355682041518',
  address: 'Albania',
  mapsUrl: '',
  location: 'Albania',
  serviceArea: 'Worldwide',
  businessHours: 'Monday – Friday, 09:00 – 18:00 (CET)',
  footerText: 'Digital products built in Albania for ambitious businesses worldwide.',
  copyright: '© {year} drh.al. All rights reserved.',
  logo: '',
  logoDark: '',
  favicon: '',
  defaultOgImage: '/og/default.png',
  social: {
    instagram: '',
    linkedin: '',
    facebook: '',
    github: '',
  },
};

export const siteSettings: SiteSettingRow[] = [
  {
    key: 'company',
    value: defaultCompanySettings as unknown as Record<string, unknown>,
    updated_at: new Date(0).toISOString(),
  },
];

/**
 * Integration registry. `config` holds non-secret values only — API keys and
 * service-account credentials live in environment variables and are never
 * written to the database or sent to the browser (spec §74, §81).
 */
export const integrations: IntegrationRow[] = [
  { key: 'ga4', label: 'Google Analytics 4', envKeys: ['NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'GA4_PROPERTY_ID'] },
  { key: 'gsc', label: 'Google Search Console', envKeys: ['GSC_SITE_URL', 'GOOGLE_SERVICE_ACCOUNT_EMAIL'] },
  { key: 'google_ads', label: 'Google Ads', envKeys: ['NEXT_PUBLIC_GOOGLE_ADS_ID'] },
  { key: 'meta_pixel', label: 'Meta Pixel', envKeys: ['NEXT_PUBLIC_META_PIXEL_ID'] },
  { key: 'clarity', label: 'Microsoft Clarity', envKeys: ['NEXT_PUBLIC_CLARITY_PROJECT_ID'] },
  { key: 'resend', label: 'Resend', envKeys: ['RESEND_API_KEY'] },
  { key: 'turnstile', label: 'Cloudflare Turnstile', envKeys: ['TURNSTILE_SECRET_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY'] },
  { key: 'calendly', label: 'Calendly', envKeys: ['NEXT_PUBLIC_CALENDLY_URL'] },
].map((i) => ({
  key: i.key,
  label: i.label,
  is_enabled: false,
  config: { envKeys: i.envKeys },
  last_status: null,
  last_checked_at: null,
  updated_at: new Date(0).toISOString(),
}));
