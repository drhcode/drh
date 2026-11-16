import { defineRouting } from 'next-intl/routing';
import type { Language } from '@/types/database';

/**
 * English is the default locale and is served without a prefix (`/services`).
 * Albanian and Italian are always prefixed (`/sq/services`, `/it/services`).
 * See spec §10.
 */
export const routing = defineRouting({
  locales: ['en', 'sq', 'it'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export const localeLabels: Record<
  AppLocale,
  { short: string; name: string; flag: string; htmlLang: string; ogLocale: string; intl: string }
> = {
  en: { short: 'EN', name: 'English', flag: '🇬🇧', htmlLang: 'en', ogLocale: 'en_GB', intl: 'en-GB' },
  sq: { short: 'SQ', name: 'Shqip', flag: '🇦🇱', htmlLang: 'sq', ogLocale: 'sq_AL', intl: 'sq-AL' },
  it: { short: 'IT', name: 'Italiano', flag: '🇮🇹', htmlLang: 'it', ogLocale: 'it_IT', intl: 'it-IT' },
};

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}

/**
 * The CMS stores content in English and Albanian only. Italian is a UI locale:
 * its interface copy is translated, while CMS content (services, projects,
 * posts, FAQs, testimonials) falls back to English. Pages rendered that way are
 * `noindex` and left out of hreflang and the sitemap until Italian content
 * exists — the same rule that already applies to untranslated Albanian pages.
 */
export const CONTENT_LANGUAGES = ['en', 'sq'] as const satisfies readonly Language[];

export function contentLanguage(locale: AppLocale): Language {
  return locale === 'sq' ? 'sq' : 'en';
}

/** True when this locale can carry CMS content in its own language. */
export function hasContentLanguage(locale: AppLocale): locale is Language {
  return (CONTENT_LANGUAGES as readonly string[]).includes(locale);
}
