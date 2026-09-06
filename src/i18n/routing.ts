import { defineRouting } from 'next-intl/routing';

/**
 * English is the default locale and is served without a prefix (`/services`).
 * Albanian is always prefixed (`/sq/services`). See spec §10.
 */
export const routing = defineRouting({
  locales: ['en', 'sq'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export const localeLabels: Record<AppLocale, { short: string; name: string; flag: string; htmlLang: string }> = {
  en: { short: 'EN', name: 'English', flag: '🇬🇧', htmlLang: 'en' },
  sq: { short: 'SQ', name: 'Shqip', flag: '🇦🇱', htmlLang: 'sq' },
};

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}
