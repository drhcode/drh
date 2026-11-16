import { getTranslations } from 'next-intl/server';
import { isAppLocale, routing } from '@/i18n/routing';
import { OG_SIZE, brandedOgImage } from '@/lib/seo/og-image';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'drh.al';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: isAppLocale(locale) ? locale : 'en', namespace: 'audit' });
  return brandedOgImage({ kicker: t('ogKicker'), title: t('ogTitle') });
}
