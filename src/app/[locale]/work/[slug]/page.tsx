import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getAdjacentProject, getProject, getProjects, type ProjectView } from '@/lib/data';
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
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  const paragraphs = project.overview?.split(/\n{2,}/).filter(Boolean) ?? [];

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

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section>
        <div className="container-page pb-10 pt-8 md:pb-14 md:pt-12">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {tCommon('backTo', { target: tWork('title') })}
          </Link>

          <div className="mt-8 max-w-4xl md:mt-10">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
              {project.clientName}
            </p>
            <h1 className="mt-4 text-balance text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {project.title}
            </h1>
            {project.shortDescription && (
              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
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
        </div>
      </section>

      {/* ── Cover ──────────────────────────────────────────────────────────── */}
      {project.coverImage && (
        <div className="container-page">
          {/*
            Art direction rather than one crop stretched everywhere: a 16:9
            frame that would letterbox a phone becomes a 4:5 frame when a mobile
            cover has been supplied. Only one of the two is ever rendered.
          */}
          {project.coverImageMobile ? (
            <>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-surface-sunken sm:hidden">
                <Image
                  src={project.coverImageMobile}
                  alt={`${project.clientName} — ${project.title}`}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="relative hidden aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-sunken sm:block">
                <Image
                  src={project.coverImage}
                  alt={`${project.clientName} — ${project.title}`}
                  fill
                  priority
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover"
                />
              </div>
            </>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-sunken sm:aspect-[16/9] sm:rounded-2xl">
              <Image
                src={project.coverImage}
                alt={`${project.clientName} — ${project.title}`}
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Overview + project detail ───────────────────────────────────────── */}
      <Section className="pt-14 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            {paragraphs.length > 0 && (
              <Reveal>
                <h2 className="text-2xl leading-tight md:text-[1.75rem]">{t('overview')}</h2>
                <div className="mt-6 space-y-5">
                  {paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className={
                        // The opening paragraph carries the case study, so it
                        // reads as a lead rather than as body copy.
                        index === 0
                          ? 'text-pretty text-[1.0625rem] leading-relaxed text-foreground md:text-lg'
                          : 'text-pretty text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]'
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/*
            The detail card follows the narrative on a phone, where a sidebar
            would push the story below the fold, and sticks beside it once there
            is room for two columns.
          */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-xl border border-border bg-surface p-6 sm:p-7 lg:sticky lg:top-28">
              <dl className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4 lg:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 text-sm text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              {project.services.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    {t('services')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.services.map((service) => (
                      <Link key={service.slug} href={`/services/${service.slug}`}>
                        <Badge
                          variant="outline"
                          className="transition-colors hover:border-accent-border hover:text-accent"
                        >
                          {service.title}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {project.technologies.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    {t('technologies')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <Badge key={tech.slug}>{tech.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Section>

      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      {project.gallery.length > 0 && (
        <Section bordered className="py-14 md:py-20">
          <h2 className="sr-only">{t('gallery')}</h2>
          {/*
            The first image leads at full width; the rest pair up from `sm`. An
            odd one out spans both columns rather than leaving a hole.
          */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {project.gallery.map((item, index) => {
              const isLead = index === 0;
              const isOrphan =
                index === project.gallery.length - 1 && (project.gallery.length - 1) % 2 === 1;

              return (
                <Reveal
                  key={item.url}
                  delay={Math.min(index, 4) * 0.05}
                  className={isLead || isOrphan ? 'sm:col-span-2' : undefined}
                >
                  <figure
                    className={`relative overflow-hidden rounded-xl border border-border bg-surface-sunken ${
                      isLead || isOrphan ? 'aspect-[16/10]' : 'aspect-[4/3]'
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes={
                        isLead || isOrphan
                          ? '(min-width: 1280px) 1200px, 100vw'
                          : '(min-width: 640px) 50vw, 100vw'
                      }
                      className="object-cover"
                    />
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Client testimonial, when one exists for this project ────────────── */}
      {project.testimonial && (
        <Section bordered className="py-14 md:py-20">
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
            <blockquote className="text-balance text-lg leading-relaxed text-foreground sm:text-xl md:text-2xl">
              &ldquo;{project.testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7 flex items-center justify-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent">
                {initials(project.testimonial.clientName)}
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium text-foreground">
                  {project.testimonial.clientName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
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
        <div className="container-page py-16 md:py-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-2xl leading-[1.12] sm:text-3xl md:text-4xl">
              {t('ctaTitle')}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
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
        <div className="container-page py-12 md:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
            {label}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <h2 className="text-balance text-xl transition-colors group-hover:text-accent sm:text-2xl md:text-3xl">
                {project.clientName}
              </h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">{project.title}</p>
            </div>
            <ArrowRight className="size-6 shrink-0 text-subtle-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
          </div>
        </div>
      </Link>
    </section>
  );
}
