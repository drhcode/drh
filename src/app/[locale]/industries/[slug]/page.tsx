import type { Metadata } from 'next';
import Image from 'next/image';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { HeroField } from '@/components/sections/hero-field';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import {
  getFaqs,
  getFeaturedServices,
  getIndustries,
  getIndustry,
  getProjectsByIndustry,
  getTechnologies,
} from '@/lib/data';
import { Section, SectionHeading } from '@/components/sections/section';
import { FeatureGrid } from '@/components/sections/feature-grid';
import { ProjectsSection } from '@/components/sections/projects-section';
import { ServicesSection } from '@/components/sections/services-section';
import { TechStrip } from '@/components/sections/tech-strip';
import { FaqSection } from '@/components/sections/faq-section';
import { CtaSection } from '@/components/sections/cta-section';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IndustryGlyph } from '@/components/site/industry-glyph';
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
  return routing.locales.flatMap((locale) =>
    industries.map((industry) => ({ locale, slug: industry.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const industry = await getIndustry(locale, slug);
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

  // Draft mode is enabled only by the admin preview route, which checks
  // authorisation first, so unpublished content stays private.
  const preview = (await draftMode()).isEnabled;
  const industry = await getIndustry(locale, slug, { includeUnpublished: preview });
  if (!industry) notFound();

  const [t, tCta, tCommon, projects, services, technologies, faqs, siblings] = await Promise.all([
    getTranslations('industries'),
    getTranslations('cta'),
    getTranslations('common'),
    getProjectsByIndustry(locale, slug, 3),
    getFeaturedServices(locale),
    getTechnologies(),
    getFaqs(locale, { category: 'general' }),
    getIndustries(locale),
  ]);

  const related = siblings.filter((i) => i.slug !== industry.slug).slice(0, 6);

  return (
    <>
      <DraftBanner path={`/industries/${slug}`} />
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/industries' },
              { name: industry.title, path: `/industries/${industry.slug}` },
            ],
            locale as AppLocale,
          ),
          faqSchema(faqs),
        )}
      />

      <section className="relative overflow-hidden border-b border-border">
        <HeroField />
        <div className="container-page pb-12 pt-10 md:pb-16 md:pt-14 relative">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/industries" className="transition-colors hover:text-accent">
              {t('title')}
            </Link>
            <span className="mx-2 text-subtle-foreground">/</span>
            <span className="text-foreground">{industry.title}</span>
          </nav>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-xs font-medium text-muted-foreground">
                <span className="flex size-7 items-center justify-center rounded-full bg-accent-subtle text-accent">
                  <IndustryGlyph iconKey={industry.iconKey} className="size-4" strokeWidth={2.5} eager />
                </span>
                {industry.title}
              </p>

              <h1 className="mt-5 text-balance text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                {industry.heroTitle ?? industry.title}
              </h1>

              {industry.heroSubtitle && (
                <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground md:text-lg">
                  {industry.heroSubtitle}
                </p>
              )}

              {industry.description && (
                <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
                  {industry.description}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/contact">
                    {tCta('button')}
                    <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/work">{tCommon('viewAllProjects')}</Link>
                </Button>
              </div>
            </div>

            {/*
              The cover is optional in the CMS and none are set yet, so the
              fallback is a designed panel rather than a gap: the industry's own
              glyph, oversized on the grid texture used across the site.
            */}
            <div className="lg:col-span-5">
              {industry.coverImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-sunken">
                  <Image
                    src={industry.coverImage}
                    alt={industry.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-sunken">
                  <div
                    className="absolute inset-0 grid-lines opacity-[0.5] dark:opacity-[0.3]"
                    aria-hidden="true"
                  />
                  <IndustryGlyph
                    iconKey={industry.iconKey}
                    className="relative size-28 text-accent sm:size-36"
                    strokeWidth={1.1}
                    eager
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <FeatureGrid title={t('challenges')} items={industry.problems} numbered bordered={false} />
      <FeatureGrid title={t('solutions')} items={industry.solutions} />

      <ServicesSection title={t('relevantServices')} services={services} />
      <ProjectsSection title={t('relevantWork')} projects={projects} />

      <TechStrip technologies={technologies} />

      <FaqSection title={t('faq')} faqs={faqs} />

      {related.length > 0 && (
        <Section bordered className="py-14">
          <SectionHeading title={t('title')} />
          <ul className="mt-8 flex flex-wrap gap-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/industries/${item.slug}`}>
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm transition-colors hover:border-accent-border hover:bg-accent-subtle hover:text-accent"
                  >
                    {item.title}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaSection
        title={industry.ctaTitle ?? tCta('title')}
        body={industry.ctaBody ?? tCta('body')}
        primaryCta={tCta('button')}
      />
    </>
  );
}
