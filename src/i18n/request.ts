import { getRequestConfig } from 'next-intl/server';
import { routing, isAppLocale } from './routing';
import { mergeMessages, type Messages } from './messages';

/**
 * Locale files are merged over English, so a key that has not been translated
 * yet renders in English rather than as a raw key. `npm run i18n:missing`
 * lists every key that is currently falling back.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isAppLocale(requested) ? requested : routing.defaultLocale;

  const english = (await import('../../messages/en.json')).default as Messages;
  const messages =
    locale === 'en'
      ? english
      : mergeMessages(english, (await import(`../../messages/${locale}.json`)).default as Messages);

  return {
    locale,
    messages,
    timeZone: 'Europe/Tirane',
  };
});
