import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import {
  getAdjacentProject,
  getProject,
  getProjects,
  type ProjectView,
} from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/sections/section';
import { Reveal } from '@/components/sections/reveal';
import { JsonLd } from '@/components/seo/json-ld';
import {
  CaseStudyCtaButton,
  OutboundProjectLink,
  ProjectViewTracker,
} from '@/components/site/project-view-tracker';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph, projectSchema } from '@/lib/seo/schema';
import { formatDate, initials } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects('en');
  return routing.locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const project = await getProject(locale, slug);
  if (!project) return {};

  return buildMetadata({
    locale,
    path: `/work/${project.slug}`,
    title: seoText(project.seo.title, null, `${project.clientName} — ${project.title} | drh.al`),
    description: seoText(
      project.seo.description,
      project.shortDescription,
      `A case study from drh.al: ${project.clientName}.`,
    ),
    ogImage: project.seo.ogImage,
    ogTitle: project.seo.ogTitle,
    ogDescription: project.seo.ogDescription,
    canonical: project.seo.canonical,
    isIndexable: project.seo.isIndexable,
    translations: project.translations,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const project = await getProject(locale, slug);
  if (!project) notFound();

  const [t, tCommon, tWork, next] = await Promise.all([
    getTranslations('project'),
    getTranslations('common'),
    getTranslations('work'),
    getAdjacentProject(locale, slug),
  ]);

  const facts = [
    { label: t('client'), value: project.clientName },
    { label: t('industry'), value: project.industry?.title },
    { label: t('country'), value: project.country },
    {
      label: t('date'),
      value: project.projectDate
        ? formatDate(project.projectDate, locale, { year: 'numeric', month: 'long' })
        : null,
    },
  ].filter((fact) => Boolean(fact.value));

  const body = [
    { key: 'overview', label: t('overview'), text: project.overview },
    { key: 'challenge', label: t('challenge'), text: project.challenge },
    { key: 'solution', label: t('solution'), text: project.solution },
    { key: 'development', label: t('development'), text: project.development },
  ].filter((block) => Boolean(block.text));

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          projectSchema(project, locale as AppLocale),
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: tWork('title'), path: '/work' },
              { name: project.clientName, path: `/work/${project.slug}` },
            ],
            locale as AppLocale,
          ),
        )}
      />
      <ProjectViewTracker projectId={project.id} slug={project.slug} />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="container-page pb-12 pt-14 md:pb-16 md:pt-20">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            ← {tCommon('backTo', { target: tWork('title') })}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
                {project.clientName}
              </p>
              <h1 className="mt-4 text-balance text-3xl leading-[1.12] md:text-4xl lg:text-[3rem]">
                {project.title}
              </h1>
              {project.shortDescription && (
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {project.shortDescription}
                </p>
              )}

              {project.websiteUrl && (
                <OutboundProjectLink
                  href={project.websiteUrl}
                  projectId={project.id}
                  slug={project.slug}
                  label={t('visitWebsite')}
                />
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 self-start lg:col-span-4 lg:col-start-9">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-foreground">{fact.value}</dd>
                </div>
              ))}

              {project.services.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    {t('services')}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.services.map((service) => (
                      <Link key={service.slug} href={`/services/${service.slug}`}>
                        <Badge variant="outline" className="transition-colors hover:border-accent-border hover:text-accent">
                          {service.title}
                        </Badge>
                      </Link>
                    ))}
                  </dd>
                </div>
              )}

              {project.technologies.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    {t('technologies')}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <Badge key={tech.slug}>{tech.name}</Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* Cover */}
      {project.coverImage && (
        <div className="container-page -mt-px py-10 md:py-14">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-sunken">
            <Image
              src={project.coverImage}
              alt={`${project.clientName} — ${project.title}`}
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Case study body */}
      {body.length > 0 && (
        <Section bordered className="py-16 md:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8 lg:col-start-3">
              <div className="space-y-14">
                {body.map((block) => (
                  <Reveal key={block.key}>
                    <h2 className="text-2xl md:text-3xl">{block.label}</h2>
                    <div className="mt-5 space-y-4">
                      {block.text!.split(/\n{2,}/).map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <Section bordered className="py-16 md:py-20">
          <h2 className="sr-only">{t('gallery')}</h2>
          <div className="grid gap-6 md:gap-8">
            {project.gallery.map((item, index) => (
              <Reveal key={item.url} delay={index * 0.05}>
                <figure className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-sunken">
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1280px) 1200px, 100vw"
                    className="object-cover"
                  />
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Results — only rendered when the team has entered verified metrics */}
      {(project.results.length > 0 || project.resultsText) && (
        <Section bordered className="py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl">{t('results')}</h2>

          {project.results.length > 0 && (
            <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {project.results.map((result) => (
                <div key={result.label} className="bg-surface p-7">
                  <dt className="sr-only">{result.label}</dt>
                  <dd>
                    <span className="block text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                      {result.value}
                    </span>
                    <span className="mt-2 block text-sm text-muted-foreground">{result.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {project.resultsText && (
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {project.resultsText}
            </p>
          )}
        </Section>
      )}

      {/* Client testimonial, when one exists for this project */}
      {project.testimonial && (
        <Section bordered className="py-16 md:py-20">
          <figure className="mx-auto max-w-3xl text-center">
            {project.testimonial.rating != null && (
              <div className="mb-5 flex justify-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={
                      i < (project.testimonial?.rating ?? 0)
                        ? 'size-4 fill-accent text-accent'
                        : 'size-4 text-border-strong'
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
            <blockquote className="text-balance text-xl leading-relaxed text-foreground md:text-2xl">
              &ldquo;{project.testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7 flex items-center justify-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent">
                {initials(project.testimonial.clientName)}
              </span>
              <span className="text-left">
                <span className="block text-sm font-medium text-foreground">
                  {project.testimonial.clientName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {[project.testimonial.position, project.testimonial.company]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
            </figcaption>
          </figure>
        </Section>
      )}

      {next && <NextProject project={next} label={t('nextProject')} />}

      {/* A dedicated CTA so this project's conversion signal is attributable. */}
      <section className="border-t border-border bg-surface-sunken">
        <div className="container-page py-20 md:py-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl leading-[1.12] md:text-4xl">{t('ctaTitle')}</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('ctaBody')}
            </p>
            <div className="mt-8 flex justify-center">
              <CaseStudyCtaButton
                projectId={project.id}
                slug={project.slug}
                label={t('ctaButton')}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function NextProject({ project, label }: { project: ProjectView; label: string }) {
  return (
    <section className="border-t border-border">
      <Link href={`/work/${project.slug}`} className="group block">
        <div className="container-page py-14 md:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
            {label}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl transition-colors group-hover:text-accent md:text-3xl">
                {project.clientName}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{project.title}</p>
            </div>
            <ArrowRight className="size-6 text-subtle-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
          </div>
        </div>
      </Link>
    </section>
  );
}
