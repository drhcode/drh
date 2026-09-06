import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getCompanySettings, getFaqs, getServices, getTechnologies } from '@/lib/data';
import { ServicesSection } from '@/components/sections/services-section';
import { TechStrip } from '@/components/sections/tech-strip';
import { FaqSection } from '@/components/sections/faq-section';
import { CtaSection } from '@/components/sections/cta-section';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, jsonLdGraph, serviceSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'services' });

  return buildMetadata({
    locale,
    path: '/services',
    title: `${t('heroTitle')} | drh.al`,
    description: t('heroDescription'),
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('services');
  const tCta = await getTranslations('cta');
  const [services, technologies, faqs, settings] = await Promise.all([
    getServices(locale),
    getTechnologies(),
    getFaqs(locale, { category: 'general' }),
    getCompanySettings(),
  ]);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/services' },
            ],
            locale as AppLocale,
          ),
          ...services.map((service) => serviceSchema(service, locale as AppLocale, settings)),
          faqSchema(faqs),
        )}
      />

      <section className="border-b border-border">
        <div className="container-page pb-14 pt-16 md:pb-16 md:pt-24">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {t('title')}
          </p>
          <h1 className="max-w-3xl text-balance text-4xl leading-[1.1] md:text-5xl lg:text-[3.5rem]">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('heroDescription')}
          </p>
        </div>
      </section>

      <ServicesSection services={services} bordered={false} />
      <TechStrip title={t('technologies')} technologies={technologies} />
      <FaqSection title={t('faq')} faqs={faqs} />
      <CtaSection title={tCta('title')} body={tCta('body')} primaryCta={tCta('button')} />
    </>
  );
}
