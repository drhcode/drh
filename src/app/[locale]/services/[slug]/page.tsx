import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import {
  getCompanySettings,
  getFaqs,
  getProjectsByService,
  getService,
  getServices,
} from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/sections/section';
import { Reveal } from '@/components/sections/reveal';
import { FeatureGrid } from '@/components/sections/feature-grid';
import { ProcessSection } from '@/components/sections/process-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { FaqSection } from '@/components/sections/faq-section';
import { CtaSection } from '@/components/sections/cta-section';
import { TechStrip } from '@/components/sections/tech-strip';
import { ServiceIcon } from '@/components/site/service-icon';
import { JsonLd } from '@/components/seo/json-ld';
import { ServiceViewTracker } from '@/components/site/project-view-tracker';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, jsonLdGraph, serviceSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getServices('en');
  return routing.locales.flatMap((locale) =>
    services.map((service) => ({ locale, slug: service.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const service = await getService(locale, slug);
  if (!service) return {};

  return buildMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: seoText(service.seo.title, service.headline, `${service.title} | drh.al`),
    description: seoText(
      service.seo.description,
      service.shortDescription,
      `${service.title} by drh.al.`,
    ),
    ogImage: service.seo.ogImage,
    ogTitle: service.seo.ogTitle,
    ogDescription: service.seo.ogDescription,
    isIndexable: service.seo.isIndexable,
    translations: service.translations,
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const service = await getService(locale, slug);
  if (!service) notFound();

  const [t, tNav, tCta, projects, faqs, settings, allServices] = await Promise.all([
    getTranslations('services'),
    getTranslations('nav'),
    getTranslations('cta'),
    getProjectsByService(locale, slug, 3),
    getFaqs(locale, { category: 'general' }),
    getCompanySettings(),
    getServices(locale),
  ]);

  const related = allServices.filter((item) => item.slug !== service.slug).slice(0, 6);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          serviceSchema(service, locale as AppLocale, settings),
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/services' },
              { name: service.title, path: `/services/${service.slug}` },
            ],
            locale as AppLocale,
          ),
          faqSchema(faqs),
        )}
      />
      <ServiceViewTracker serviceId={service.id} slug={service.slug} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container-page">
          <div className="grid items-center gap-10 py-10 md:py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
            <div className="lg:col-span-6">
              {/* Wraps rather than overflowing when a service title is long */}
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
                  <li>
                    <Link href="/services" className="transition-colors hover:text-accent">
                      {t('title')}
                    </Link>
                  </li>
                  <li aria-hidden="true" className="flex text-subtle-foreground">
                    <ChevronRight className="size-3.5" />
                  </li>
                  <li className="text-foreground">{service.title}</li>
                </ol>
              </nav>

              <div className="mt-6 flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                  <ServiceIcon iconKey={service.iconKey} className="size-5" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
                  {service.title}
                </span>
              </div>

              {/*
                Starts at 2rem so a long headline still breaks cleanly at 375px,
                then steps up through the breakpoints.
              */}
              <h1 className="mt-6 text-balance text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                {service.headline ?? service.title}
              </h1>

              {service.shortDescription && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
                  {service.shortDescription}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="group w-full sm:w-auto">
                  <Link href="/contact">
                    {tNav('startProject')}
                    <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/work">{t('relatedWork')}</Link>
                </Button>
              </div>

              <p className="mt-5 text-sm text-subtle-foreground">
                {settings.location} · {settings.serviceArea}
              </p>
            </div>

            {/* An offset accent panel gives depth without resorting to a drop shadow */}
            <div className="lg:col-span-6">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-x-3 -bottom-3 top-6 rounded-2xl bg-accent-subtle sm:-inset-x-4 sm:-bottom-4"
                />
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-sunken">
                  {service.coverImage ? (
                    <Image
                      src={service.coverImage}
                      alt={`${service.title} — drh.al`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-accent">
                      <ServiceIcon iconKey={service.iconKey} className="size-16 opacity-30" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Overview ──────────────────────────────────────────────────────── */}
      {service.fullDescription && (
        <Section className="py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl leading-tight md:text-3xl">{service.title}</h2>
            </div>
            <Reveal className="lg:col-span-7 lg:col-start-6">
              <div className="space-y-5">
                {service.fullDescription.split(/\n{2,}/).map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </Section>
      )}

      {/* ── What's included ───────────────────────────────────────────────── */}
      {service.features.length > 0 && (
        <Section bordered className="py-14 md:py-20">
          <SectionHeading title={t('whatsIncluded')} />

          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((feature, index) => (
              <Reveal
                as="li"
                key={feature}
                delay={Math.min(index, 8) * 0.04}
                className="bg-surface"
              >
                <div className="flex h-full items-start gap-3 p-5 md:p-6">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-foreground">
                    {feature}
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      <FeatureGrid title={t('benefits')} items={service.benefits} />

      {service.technologies.length > 0 && (
        <TechStrip title={t('technologies')} technologies={service.technologies} />
      )}

      <ProcessSection title={t('process')} steps={service.process} />

      <ProjectsSection title={t('relatedWork')} projects={projects} />

      <FaqSection title={t('faq')} faqs={faqs} />

      {/* ── Other services: internal linking (spec §70) ───────────────────── */}
      {related.length > 0 && (
        <Section bordered className="py-14 md:py-16">
          <SectionHeading title={t('allServices')} />

          <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="bg-surface">
                <Link
                  href={`/services/${item.slug}`}
                  className="group flex min-h-16 items-center justify-between gap-3 p-5 transition-colors hover:bg-surface-sunken"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-sunken text-accent transition-colors group-hover:border-accent-border group-hover:bg-accent-subtle">
                      <ServiceIcon iconKey={item.iconKey} className="size-4" />
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-subtle-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaSection
        title={service.ctaTitle ?? tCta('title')}
        body={service.ctaBody ?? tCta('body')}
        primaryCta={tCta('button')}
      />
    </>
  );
}
