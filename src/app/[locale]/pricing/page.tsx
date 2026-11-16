import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { isAppLocale, routing } from '@/i18n/routing';
import { pickMessages } from '@/i18n/pick';
import { uiAvailability } from '@/i18n/availability';
import { PageHero } from '@/components/blocks/page-hero';
import { Estimator } from '@/components/pricing/estimator';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return buildMetadata({
    locale,
    path: '/pricing',
    title: t('metaTitle'),
    description: t('metaDescription'),
    available: uiAvailability(['pricing']),
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, messages] = await Promise.all([
    getTranslations('pricing'),
    getTranslations('common'),
    getMessages(),
  ]);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('crumb'), path: '/pricing' },
            ],
            locale,
          ),
        )}
      />

      <PageHero
        crumbs={[{ label: t('crumbRoot'), href: '/services' }, { label: t('crumb') }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={t('heroTitle')}
        titleClassName="whitespace-pre-line max-w-[1000px] text-[clamp(52px,8.4vw,136px)] leading-[.92]"
        lead={<p>{t('lead')}</p>}
        visual={
          <svg className="hide-sm pointer-events-none absolute right-[5%] top-10 overflow-visible" viewBox="0 0 400 400" width="400" height="400" aria-hidden="true">
            <circle className="flow" cx="200" cy="200" r="180" fill="none" stroke="#2f3532" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="#23272a" strokeWidth="10" strokeOpacity=".5" />
            <circle className="drawloop" pathLength={1000} cx="200" cy="200" r="130" fill="none" stroke="#D4FF3A" strokeWidth="10" strokeLinecap="round" transform="rotate(-90 200 200)" />
            <text x="200" y="196" textAnchor="middle" style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2, fill: 'var(--fg)' }}>
              €
            </text>
            <text x="200" y="232" textAnchor="middle" className="mono" style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, fill: 'var(--t3)' }}>
              {t('sixty')}
            </text>
          </svg>
        }
      />

      <section className="wrap pb-[120px] pt-16">
        <NextIntlClientProvider messages={pickMessages(messages, ['pricing'])}>
          <Estimator />
        </NextIntlClientProvider>
      </section>
    </>
  );
}
