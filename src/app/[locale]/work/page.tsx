import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getProjects } from '@/lib/data';
import { PageHero } from '@/components/blocks/page-hero';
import { toCardData } from '@/components/blocks/project-cards';
import { WorkGrid } from '@/components/work/work-grid';
import { MarqueeTrack } from '@/components/blocks/marquee-track';
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
  const t = await getTranslations({ locale, namespace: 'work' });

  return buildMetadata({
    locale,
    path: '/work',
    title: `${t('title')} — Selected Projects | drh.al`,
    description: t('heroDescription'),
    available: ['en', 'sq'],
  });
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, tHome, projects] = await Promise.all([
    getTranslations('work'),
    getTranslations('common'),
    getTranslations('home'),
    getProjects(contentLanguage(locale)),
  ]);

  const clients = projects.map((project) => project.clientName);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('title'), path: '/work' },
            ],
            locale,
          ),
        )}
      />

      <PageHero
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('crumb') }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={t('v2HeroTitle')}
        titleClassName="whitespace-pre-line text-[clamp(64px,12vw,200px)] leading-[.85] tracking-[-0.06em]"
      >
        <p className="lead rise d2 mt-8 max-w-[400px] text-lg">{t('v2Lead')}</p>
      </PageHero>

      <section className="wrap pb-[120px] pt-16" aria-labelledby="work-grid-heading">
        <h2 id="work-grid-heading" className="sr-only">
          {t('title')}
        </h2>
        <WorkGrid
          projects={projects.map(toCardData)}
          labels={{
            filter: t('filterByIndustry'),
            all: t('filterAll'),
            count: t.raw('projectCount') as string,
            live: tHome('livePreview'),
            nextKicker: t('nextKicker'),
            nextTitle: t('nextTitle'),
            nextBody: t('nextBody'),
            nextCta: tHome('cta1'),
          }}
        />
      </section>

      {clients.length > 0 && (
        <section className="overflow-hidden border-y border-ln py-14" aria-label={tHome('clientsLabel')}>
          <p className="wrap mono mb-8 text-[13px] tracking-[.1em] text-t3">{tHome('trusted')}</p>
          <MarqueeTrack className="gap-[72px] pr-[72px] [animation-duration:45s]">
            <ul className="flex gap-[72px]">
              {clients.map((client) => (
                <li key={client} className="whitespace-nowrap text-[clamp(32px,4vw,56px)] font-semibold tracking-[-0.04em] text-t1">
                  {client}
                </li>
              ))}
            </ul>
          </MarqueeTrack>
        </section>
      )}
      <div className="h-24" />
    </>
  );
}
