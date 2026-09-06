import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
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

  const industry = await getIndustry(locale, slug);
  if (!industry) notFound();

  const [t, tCta, projects, services, technologies, faqs, siblings] = await Promise.all([
    getTranslations('industries'),
    getTranslations('cta'),
    getProjectsByIndustry(locale, slug, 3),
    getFeaturedServices(locale),
    getTechnologies(),
    getFaqs(locale, { category: 'general' }),
    getIndustries(locale),
  ]);

  const related = siblings.filter((i) => i.slug !== industry.slug).slice(0, 6);

  return (
    <>
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

      <section className="border-b border-border">
        <div className="container-page pb-14 pt-14 md:pb-16 md:pt-20">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/industries" className="transition-colors hover:text-accent">
              {t('title')}
            </Link>
            <span className="mx-2 text-subtle-foreground">/</span>
            <span className="text-foreground">{industry.title}</span>
          </nav>

          <h1 className="mt-7 max-w-4xl text-balance text-4xl leading-[1.1] md:text-5xl lg:text-[3.4rem]">
            {industry.heroTitle ?? industry.title}
          </h1>

          {industry.heroSubtitle && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground">
              {industry.heroSubtitle}
            </p>
          )}

          {industry.description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {industry.description}
            </p>
          )}
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
