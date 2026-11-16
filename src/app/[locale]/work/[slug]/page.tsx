import type { Metadata } from 'next';
import Image from 'next/image';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getAdjacentProject, getProject, getProjects, getTestimonials } from '@/lib/data';
import { matchTestimonial } from '@/lib/data/match';
import { ArrowRight, ArrowUpRight } from '@/components/brand/icons';
import { SectionHead } from '@/components/brand/section-head';
import { Crumbs } from '@/components/blocks/page-hero';
import { PROJECT_PALETTES } from '@/components/blocks/project-cards';
import { stripQuotes } from '@/components/blocks/marquees';
import { HeroFx } from '@/components/fx/pointer-fx';
import { BeforeAfter } from '@/components/work/before-after';
import { JsonLd } from '@/components/seo/json-ld';
import { DraftBanner } from '@/components/site/draft-banner';
import { CaseStudyCtaButton, OutboundProjectLink, ProjectViewTracker } from '@/components/site/project-view-tracker';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph, projectSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects('en');
  return routing.locales.flatMap((locale) => projects.map((project) => ({ locale, slug: project.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const project = await getProject(contentLanguage(locale), slug);
  if (!project) return {};

  return buildMetadata({
    locale,
    path: `/work/${project.slug}`,
    title: seoText(project.seo.title, null, `${project.clientName} — ${project.title} | drh.al`),
    description: seoText(project.seo.description, project.shortDescription, `A case study from drh.al: ${project.clientName}.`),
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
  const language = contentLanguage(locale);

  // Draft mode is enabled only by the admin preview route, which checks
  // authorisation first, so unpublished content stays private.
  const preview = (await draftMode()).isEnabled;
  const project = await getProject(language, slug, { includeUnpublished: preview });
  if (!project) notFound();

  const [t, tProject, tCommon, tWork, next, all, testimonials] = await Promise.all([
    getTranslations('caseStudy'),
    getTranslations('project'),
    getTranslations('common'),
    getTranslations('work'),
    getAdjacentProject(language, slug),
    getProjects(language),
    getTestimonials(language),
  ]);

  // Same palette the project wears on the work grid.
  const order = Math.max(0, all.findIndex((item) => item.slug === project.slug));
  const palette = PROJECT_PALETTES[order % PROJECT_PALETTES.length];
  const testimonial = matchTestimonial(project, testimonials);
  const year = project.projectDate ? new Date(project.projectDate).getFullYear() : null;
  const [overviewLead, ...overviewRest] = (project.overview ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const facts = [
    { label: tProject('client'), value: project.clientName },
    { label: tProject('industry'), value: project.industry?.title },
    { label: t('year'), value: year ? String(year) : null },
    { label: tProject('services'), value: project.services.map((s) => s.title).join(', ') },
    { label: t('stack'), value: project.technologies.slice(0, 4).map((tech) => tech.name).join(' · ') },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <>
      <DraftBanner path={`/work/${slug}`} />
      <JsonLd
        json={jsonLdGraph(
          projectSchema(project, locale),
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: tWork('crumb'), path: '/work' },
              { name: project.clientName, path: `/work/${project.slug}` },
            ],
            locale,
          ),
        )}
      />
      <ProjectViewTracker projectId={project.id} slug={project.slug} />

      {/* Hero in the project's card palette */}
      <HeroFx style={{ background: palette.bg, color: palette.fg }}>
        <div
          className="spin-slow hide-sm absolute -right-[120px] -top-[120px] size-[520px] rounded-full border border-dashed"
          style={{ borderColor: palette.line, animationDuration: '30s' }}
          aria-hidden="true"
        />
        <div className="wrap relative pt-[clamp(56px,8vw,104px)]">
          <Crumbs
            items={[{ label: tWork('crumb'), href: '/work' }, { label: project.clientName }]}
            label={tCommon('breadcrumb')}
            className="crumbs-inherit opacity-80"
          />
          <h1 className="rise-t d1 mt-7 text-[clamp(56px,10vw,168px)] font-semibold leading-[.86] tracking-[-0.06em]">
            {project.clientName}
          </h1>
          <p className="rise d1 mt-6 max-w-[760px] text-xl leading-snug" style={{ color: palette.muted }}>
            {project.title}
          </p>
          <dl
            className="rise d2 mt-14 grid gap-6 border-y py-7 [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))]"
            style={{ borderColor: palette.line }}
          >
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="mono text-xs tracking-[.1em]" style={{ color: palette.muted }}>
                  {fact.label.toUpperCase()}
                </dt>
                <dd className="mt-2 text-[17px]">{fact.value}</dd>
              </div>
            ))}
            {project.websiteUrl && (
              <div>
                <dt className="mono text-xs tracking-[.1em]" style={{ color: palette.muted }}>
                  {tProject('website').toUpperCase()}
                </dt>
                <dd className="mt-2 text-[17px]">
                  <OutboundProjectLink
                    href={project.websiteUrl}
                    projectId={project.id}
                    slug={project.slug}
                    className="inline-flex items-center gap-1.5 underline underline-offset-4"
                  >
                    {tProject('visitWebsite')}
                    <ArrowUpRight size={14} />
                    <span className="sr-only"> ({t('newTab')})</span>
                  </OutboundProjectLink>
                </dd>
              </div>
            )}
          </dl>

          {project.coverImage && (
            <div className="rise d3 relative mt-16 h-[clamp(320px,46vw,640px)]">
              <div className="absolute inset-x-0 bottom-0 h-[92%] overflow-hidden rounded-t-[28px]" style={{ background: palette.panel }}>
                <Image
                  src={project.coverImage}
                  alt={t('coverAlt', { client: project.clientName })}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1184px"
                  className="object-cover object-top"
                />
              </div>
              {project.coverImageMobile && (
                <div
                  className="float hide-sm absolute bottom-10 right-[6%] h-[420px] w-[210px] overflow-hidden rounded-[36px] border-[7px] shadow-[0_40px_80px_-30px_#000]"
                  style={{ borderColor: palette.bg }}
                >
                  <Image src={project.coverImageMobile} alt={t('mobileAlt', { client: project.clientName })} fill sizes="210px" className="object-cover object-top" />
                </div>
              )}
            </div>
          )}
        </div>
      </HeroFx>

      {/* Overview */}
      {overviewLead && (
        <section className="wrap sec-pad">
          <div className="reveal flex flex-wrap gap-x-16 gap-y-10">
            <h2 className="eyebrow m-0 flex-[0_0_200px] text-[13px] font-normal">{tProject('overview')}</h2>
            <div className="flex-[1_1_560px]">
              <p
                className={
                  overviewLead.length > 220
                    ? 'm-0 text-[clamp(22px,2.2vw,30px)] leading-[1.35] tracking-[-0.02em]'
                    : 'm-0 text-[clamp(24px,2.8vw,40px)] leading-[1.25] tracking-[-0.025em]'
                }
              >
                {overviewLead}
              </p>
              {overviewRest.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mt-6 max-w-[720px] text-lg leading-relaxed text-t2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery: desktop with parallax, phone beside it */}
      {(project.gallery.length > 0 || project.coverImageMobile) && (
        <section className="wrap pb-[clamp(80px,10vw,140px)]">
          <div className="flex flex-wrap items-start gap-5">
            {(project.gallery[0]?.url ?? project.coverImage) && (
              <div className="reveal relative h-[560px] flex-[2_1_560px] overflow-hidden rounded-[28px] max-sm:h-[340px]" style={{ background: palette.panel }}>
                <div className="para absolute inset-[60px_60px_-60px] overflow-hidden rounded-2xl max-sm:inset-[24px_24px_-24px]">
                  <Image
                    src={(project.gallery[0]?.url ?? project.coverImage) as string}
                    alt={project.gallery[0]?.alt || t('coverAlt', { client: project.clientName })}
                    fill
                    sizes="(max-width: 860px) 100vw, 780px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            )}
            {project.coverImageMobile && (
              <div className="reveal flex flex-[1_1_300px] justify-center pt-20 max-sm:pt-4">
                <div className="float-2 relative h-[580px] w-[280px] rounded-[44px] border-8 border-ln bg-s1 p-4">
                  <div className="relative h-full overflow-hidden rounded-[28px]">
                    <Image src={project.coverImageMobile} alt={t('mobileAlt', { client: project.clientName })} fill sizes="248px" className="object-cover object-top" />
                  </div>
                </div>
              </div>
            )}
          </div>
          {project.gallery.length > 1 && (
            <div className="mt-5 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr))]">
              {project.gallery.slice(1).map((item) => (
                <div key={item.url} className="reveal relative aspect-[3/2] overflow-hidden rounded-[22px] border border-ln">
                  <Image src={item.url} alt={item.alt} fill sizes="(max-width: 860px) 100vw, 600px" className="object-cover object-top" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Before / after — only with a real "before" screenshot */}
      {project.beforeImage && project.coverImage && (
        <section className="wrap pb-[clamp(80px,10vw,140px)]">
          <SectionHead kicker={t('beforeAfterEyebrow')} title={t('beforeAfterTitle')} />
          <BeforeAfter
            before={project.beforeImage}
            after={project.coverImage}
            labels={{
              before: t('before'),
              after: t('after'),
              compare: t('compare'),
              beforeAlt: t('beforeAlt', { client: project.clientName }),
              afterAlt: t('coverAlt', { client: project.clientName }),
            }}
          />
        </section>
      )}

      {/* Client quote — from the CMS testimonials, never invented */}
      {testimonial && (
        <section className="border-y border-ln">
          <div className="wrap py-[clamp(64px,8vw,112px)]">
            <p className="eyebrow">{t('clientWords')}</p>
            <figure className="reveal m-0 mt-10 max-w-[1000px]">
              <blockquote className="m-0 text-[clamp(28px,3.2vw,48px)] leading-[1.2] tracking-[-0.03em]">
                “{stripQuotes(testimonial.quote)}”
              </blockquote>
              <figcaption className="mt-6 text-base text-t3">
                — {[testimonial.company ?? testimonial.clientName, testimonial.country].filter(Boolean).join(', ')}
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* Similar project CTA (tracked as this case study's conversion signal) */}
      <section className="wrap pt-[clamp(64px,8vw,112px)]">
        <div className="reveal flex flex-wrap items-center justify-between gap-6 rounded-[26px] border border-ln bg-s1 p-9 max-sm:p-6">
          <div className="max-w-[560px]">
            <h2 className="m-0 text-[clamp(26px,2.4vw,34px)] font-semibold tracking-[-0.03em]">{tProject('ctaTitle')}</h2>
            <p className="mt-2 text-base text-t2">{tProject('ctaBody')}</p>
          </div>
          <CaseStudyCtaButton projectId={project.id} slug={project.slug} className="btn btn-p btn-lg">
            {tProject('ctaButton')}
            <ArrowRight />
          </CaseStudyCtaButton>
        </div>
      </section>

      {next && (
        <Link href={`/work/${next.slug}`} className="card card-flat wrap my-24 block text-fg">
          <span className="mono text-[13px] tracking-[.1em] text-t3">{tProject('nextProject').toUpperCase()}</span>
          <span className="mt-4 flex flex-wrap items-center justify-between gap-6">
            <span className="text-[clamp(56px,9vw,140px)] font-semibold leading-[.9] tracking-[-0.06em]">{next.clientName}</span>
            <span className="arrow-dot size-24 bg-lime text-ink">
              <ArrowRight size={36} />
            </span>
          </span>
        </Link>
      )}
    </>
  );
}
