import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getIndustries } from '@/lib/data';
import { PageHero } from '@/components/blocks/page-hero';
import { IndustryExplorer } from '@/components/industries/industry-explorer';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';

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
  const t = await getTranslations({ locale, namespace: 'industries' });

  return buildMetadata({
    locale,
    path: '/industries',
    title: `${t('heroTitle')} | drh.al`,
    description: t('heroDescription'),
    available: ['en', 'sq'],
  });
}

export default async function IndustriesPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, industries] = await Promise.all([
    getTranslations('industries'),
    getTranslations('common'),
    getIndustries(contentLanguage(locale)),
  ]);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('title'), path: '/industries' },
            ],
            locale,
          ),
        )}
      />

      <PageHero
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('title') }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={t('v2HeroTitle')}
        titleClassName="whitespace-pre-line"
        lead={<p>{t('v2Lead')}</p>}
        visual={
          <div className="spin-slow hide-sm pointer-events-none absolute right-[6%] top-[60px] size-[300px]" style={{ animationDuration: '30s' }} aria-hidden="true">
            <div className="absolute inset-0 rounded-full border border-ln2" />
            <div className="absolute -top-2 left-1/2 size-4 rounded-full bg-lime" />
            <div className="absolute -left-1.5 top-1/2 size-3 rounded-full bg-fg" />
            <div className="absolute bottom-[30px] right-[30px] size-2.5 rounded-full bg-[#8F9893]" />
          </div>
        }
      />

      <section className="wrap py-[clamp(64px,8vw,112px)]">
        <IndustryExplorer
          items={industries.map((industry) => ({
            slug: industry.slug,
            title: industry.title,
            insight: industry.description ?? industry.heroSubtitle,
            build: industry.solutions.slice(0, 3).map((item) => item.title),
          }))}
          labels={{
            list: t('title'),
            counter: t.raw('counter') as string,
            build: t('weBuild'),
            next: t('nextIndustry'),
            more: t('explore'),
          }}
        />
      </section>
    </>
  );
}
