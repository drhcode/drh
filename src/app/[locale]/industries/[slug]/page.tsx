import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getFaqs, getFeaturedServices, getIndustries, getIndustry, getProjectsByIndustry } from '@/lib/data';
import { Accent } from '@/components/brand/accent';
import { ArrowRight } from '@/components/brand/icons';
import { SectionHead } from '@/components/brand/section-head';
import { Magnetic } from '@/components/fx/pointer-fx';
import { PageHero } from '@/components/blocks/page-hero';
import { FaqList, WhyList } from '@/components/blocks/lists';
import { PROJECT_PALETTES, ProjectCard } from '@/components/blocks/project-cards';
import { industryColor } from '@/components/industries/industry-colors';
import { JsonLd } from '@/components/seo/json-ld';
import { DraftBanner } from '@/components/site/draft-banner';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, jsonLdGraph } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const industries = await getIndustries('en');
  return routing.locales.flatMap((locale) => industries.map((industry) => ({ locale, slug: industry.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const industry = await getIndustry(contentLanguage(locale), slug);
  if (!industry) return {};

  return buildMetadata({
    locale,
    path: `/industries/${industry.slug}`,
    title: seoText(industry.seo.title, industry.heroTitle, `${industry.title} | drh.al`),
    description: seoText(industry.seo.description, industry.description, industry.title),
    ogImage: industry.seo.ogImage,
    isIndexable: industry.seo.isIndexable,
    translations: industry.translations,
  });
}

export default async function IndustryPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const language = contentLanguage(locale);

  // Draft mode is enabled only by the admin preview route, which checks
  // authorisation first, so unpublished content stays private.
  const preview = (await draftMode()).isEnabled;
  const industry = await getIndustry(language, slug, { includeUnpublished: preview });
  if (!industry) notFound();

  const [t, tCommon, tHome, tCta, projects, services, faqs, siblings] = await Promise.all([
    getTranslations('industries'),
    getTranslations('common'),
    getTranslations('home'),
    getTranslations('cta'),
    getProjectsByIndustry(language, slug, 2),
    getFeaturedServices(language),
    getFaqs(language, { category: 'general' }),
    getIndustries(language),
  ]);

  const index = Math.max(0, siblings.findIndex((item) => item.slug === industry.slug));
  const color = industryColor(industry.slug, index);
  const others = siblings.filter((item) => item.slug !== industry.slug);

  return (
    <>
      <DraftBanner path={`/industries/${slug}`} />
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('title'), path: '/industries' },
              { name: industry.title, path: `/industries/${industry.slug}` },
            ],
            locale,
          ),
          faqSchema(faqs),
        )}
      />

      <PageHero
        crumbs={[{ label: t('title'), href: '/industries' }, { label: industry.title }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={industry.heroTitle ?? industry.title}
        autoLast
        titleClassName={
          (industry.heroTitle ?? industry.title).length > 36
            ? 'text-[clamp(40px,5vw,80px)] leading-[.95] tracking-[-0.045em]'
            : 'text-[clamp(44px,6.6vw,104px)] leading-[.93] tracking-[-0.05em]'
        }
        lead={industry.heroSubtitle ? <p>{industry.heroSubtitle}</p> : undefined}
        aside={
          <div className="rise d3 relative min-w-0 flex-[1_1_380px] overflow-hidden rounded-[32px] border border-ln bg-s1" aria-hidden="true">
            <div className="relative flex h-[260px] items-end overflow-hidden p-8" style={{ background: color }}>
              <span
                data-n={String(index + 1).padStart(2, '0')}
                className="absolute -right-5 -top-10 text-[280px] font-bold leading-none tracking-[-0.08em] text-[#0b0d0c22] before:content-[attr(data-n)]"
              />
              <span className="mono relative rounded-full bg-ink px-3.5 py-2 text-xs tracking-[.08em] text-[#F2F4F0]">
                {industry.title.toUpperCase()}
              </span>
            </div>
            {industry.solutions.length > 0 && (
              <ul className="flex flex-wrap gap-2 p-8">
                {industry.solutions.slice(0, 3).map((item) => (
                  <li key={item.title} className="rounded-full border border-ln2 px-4 py-2.5 text-[15px]">
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        }
      >
        <div className="rise d3 mt-8 flex flex-wrap gap-3">
          <Magnetic>
            <Link href="/contact" className="btn btn-p btn-lg">
              {tHome('cta1')}
            </Link>
          </Magnetic>
          <Link href="/work" className="btn btn-g btn-lg">
            {tHome('cta2')}
          </Link>
        </div>
      </PageHero>

      {industry.description && (
        <section className="wrap pt-[clamp(80px,10vw,140px)]">
          <p className="reveal m-0 max-w-[1000px] text-[clamp(24px,2.8vw,40px)] leading-[1.25] tracking-[-0.025em]">
            {industry.description}
          </p>
        </section>
      )}

      {industry.problems.length > 0 && (
        <section className="wrap sec-pad flex flex-wrap gap-16">
          <div className="flex-[1_1_380px]">
            <div className="sticky top-28">
              <p className="eyebrow">{t('challenges')}</p>
              <h2 className="h-section mt-5">
                <Accent text={t('challengesTitle')} />
              </h2>
            </div>
          </div>
          <WhyList items={industry.problems} />
        </section>
      )}

      {industry.solutions.length > 0 && (
        <section className="inv rounded-[40px] bg-bg text-fg">
          <div className="wrap sec-pad">
            <SectionHead kicker={t('solutions')} title={t('solutionsTitle')} plainAccent />
            <ul className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
              {industry.solutions.map((item, i) => (
                <li key={item.title} className="card reveal flex min-h-[240px] flex-col rounded-[28px] border border-ln bg-s1 p-8">
                  <span className="it it-plain text-5xl leading-none">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="m-0 mt-auto pt-6 text-[22px] font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-t2">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="wrap sec-pad">
          <SectionHead kicker={t('relevantWork')} title={tHome('workTitle')} />
          <div className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                palette={PROJECT_PALETTES[i % PROJECT_PALETTES.length]}
                labels={{ live: tHome('livePreview') }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-ln">
        <div className="wrap sec-pad flex flex-wrap gap-16">
          <div className="flex-[1_1_360px]">
            <h2 className="eyebrow m-0 text-[13px] font-normal">{t('relevantServices')}</h2>
            <ul className="mt-6 border-t border-ln">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="row flex items-center justify-between gap-4 border-b border-ln py-4 text-lg text-fg">
                    {service.title}
                    <ArrowRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="eyebrow m-0 mt-14 text-[13px] font-normal">{t('otherIndustries')}</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link href={`/industries/${item.slug}`} className="chip inline-flex rounded-full border border-ln2 px-4 py-2.5 text-[15px] text-fg">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 flex-[1_1_560px]">
            {faqs.length > 0 && (
              <h2 className="m-0 mb-8 text-[clamp(36px,4vw,56px)] font-semibold leading-none tracking-[-0.04em]">
                <Accent text={industry.ctaTitle ?? tCta('title')} autoLast />
              </h2>
            )}
            <FaqList faqs={faqs.slice(0, 5)} />
          </div>
        </div>
      </section>
    </>
  );
}
