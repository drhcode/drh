import en from '../../messages/en.json';
import sq from '../../messages/sq.json';
import it from '../../messages/it.json';
import { routing, type AppLocale } from './routing';
import { isNamespaceComplete, type Messages } from './messages';
import type { TranslationStatus } from '@/lib/data/types';

const catalogue: Record<AppLocale, Messages> = {
  en: en as Messages,
  sq: sq as Messages,
  it: it as Messages,
};

/**
 * Locales in which a code-owned page is fully translated. A page whose copy
 * lives entirely in the message files is "available" in a locale only when
 * every key it uses is translated there — otherwise visitors would be shown
 * English under an Italian or Albanian URL, and hreflang would advertise it.
 */
export function uiAvailability(namespaces: string[]): AppLocale[] {
  return routing.locales.filter(
    (locale) => locale === 'en' || isNamespaceComplete(catalogue.en, catalogue[locale], namespaces),
  );
}

/**
 * Locales in which CMS content genuinely exists. Italian is never one of them
 * until the CMS stores Italian translations.
 */
export function cmsAvailability(translations: TranslationStatus | undefined | null): AppLocale[] {
  if (!translations) return ['en', 'sq'];
  return (['en', 'sq'] as const).filter((code) => translations[code]);
}

/** A page built from both: available only where both halves are. */
export function bothAvailable(a: AppLocale[], b: AppLocale[]): AppLocale[] {
  return a.filter((locale) => b.includes(locale));
}
