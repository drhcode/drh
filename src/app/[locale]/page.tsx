import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { contentLanguage, isAppLocale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import {
  getBlogPosts,
  getCompanySettings,
  getFaqs,
  getFeaturedProjects,
  getFeaturedServices,
  getIndustries,
  getPage,
  getTechnologies,
  getTestimonials,
} from '@/lib/data';
import { siteConfig } from '@/config/site';
import { Accent } from '@/components/brand/accent';
import { SectionHead, numberedKicker } from '@/components/brand/section-head';
import { Magnetic } from '@/components/fx/pointer-fx';
import { HomeHero } from '@/components/home/home-hero';
import { AgentStudio } from '@/components/home/agent-studio';
import { MeasuredChart, StatsBand, ToolCards } from '@/components/home/home-panels';
import { ClientWordmarks, TechMarquee, TestimonialMarquee } from '@/components/blocks/marquees';
import { ServiceCards } from '@/components/blocks/service-cards';
import { FeaturedProjectCard, PROJECT_PALETTES, ProjectCard } from '@/components/blocks/project-cards';
import { FaqList, IndustryRows, PostCard, ProcessSteps, WhyGauge, WhyList } from '@/components/blocks/lists';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { faqSchema, jsonLdGraph, organizationSchema, websiteSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const page = await getPage(contentLanguage(locale), 'home');

  return buildMetadata({
    locale,
    path: '/',
    title: seoText(page?.seo.title, null, 'Web Development Albania | Websites, Apps & SEO | drh.al'),
    description: seoText(
      page?.seo.description,
      null,
      'drh.al is a web development agency in Albania building high-performance websites, web apps and mobile apps with SEO and digital marketing for businesses worldwide.',
    ),
    ogImage: page?.seo.ogImage,
    translations: page?.translations,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const language = contentLanguage(locale);

  const [t, tCommon, messages, settings, technologies, testimonials, services, projects, industries, posts, faqs] =
    await Promise.all([
      getTranslations('home'),
      getTranslations('common'),
      getMessages(),
      getCompanySettings(),
      getTechnologies(),
      getTestimonials(language, { featuredOnly: true }),
      getFeaturedServices(language),
      getFeaturedProjects(language, 3),
      getIndustries(language),
      getBlogPosts(language),
      getFaqs(language, { category: 'general' }),
    ]);

  const [lead, ...rest] = projects;
  const rating = siteConfig.googleRating;
  const homeMessages = messages.home as Record<string, unknown>;

  return (
    <>
      <JsonLd json={jsonLdGraph(organizationSchema(settings), websiteSchema(locale), faqSchema(faqs))} />

      <HomeHero />

      <TechMarquee label={t('techLabel')} items={technologies.map((tech) => tech.name)} />

      {/* Proof: the rating card renders only once a real rating is configured. */}
      <section aria-label={t('clientsLabel')} className="wrap pt-14">
        <div className="flex flex-wrap items-center justify-between gap-8">
          {rating && (
            <a
              href={rating.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card reveal inline-flex items-center gap-[18px] rounded-[22px] border border-ln bg-s1 px-6 py-[18px] text-fg"
            >
              <span className="text-[44px] font-bold leading-none tracking-[-0.05em]">{rating.rating.toFixed(1)}</span>
              <span>
                <span className="flex gap-[3px]" role="img" aria-label={t('ratingLabel', { rating: rating.rating })}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="star" width="18" height="18" viewBox="0 0 24 24" fill="#FFC23D" aria-hidden="true" style={{ animationDelay: `${star / 10}s` }}>
                      <path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z" />
                    </svg>
                  ))}
                </span>
                <span className="mt-1.5 block text-sm text-t2">{t('reviews', { count: rating.count })}</span>
              </span>
            </a>
          )}
          {testimonials.length > 0 && (
            <div className="min-w-0 flex-[1_1_640px]">
              <p className="mono text-xs tracking-[.1em] text-t3">{t('trusted')}</p>
              <ClientWordmarks className="mt-4" names={testimonials.map((item) => item.company ?? item.clientName)} />
            </div>
          )}
        </div>
      </section>

      {/* AI engineering */}
      <section className="cv wrap sec-pad">
        <div className="flex flex-wrap items-center gap-16">
          <div className="reveal min-w-0 flex-[1_1_440px]">
            <p className="eyebrow">{t('aiEyebrow')}</p>
            <h2 className="h-section mt-5">
              <Accent text={t('aiTitle')} />
            </h2>
            <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-t2">{t('aiBody')}</p>
            <ul className="mt-9 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              {(['agents', 'retrieval', 'integration', 'evaluation'] as const).map((key) => (
                <li key={key} className="card rounded-[18px] border border-ln bg-s1 p-5">
                  <h3 className="m-0 text-base font-semibold">{t(`aiCards.${key}.title`)}</h3>
                  <p className="mt-1.5 text-sm leading-normal text-t3">{t(`aiCards.${key}.body`)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/contact" className="btn btn-p btn-md">
                  {t('aiCta')}
                </Link>
              </Magnetic>
              <Link href="/services" className="btn btn-g btn-md">
                {t('aiCta2')}
              </Link>
            </div>
          </div>
          <NextIntlClientProvider messages={{ home: { studio: homeMessages.studio } } as never}>
            <AgentStudio />
          </NextIntlClientProvider>
        </div>
      </section>

      <StatsBand />

      {/* Measured growth */}
      <section className="cv wrap pt-[clamp(80px,10vw,140px)]">
        <div className="flex flex-wrap items-center gap-14">
          <div className="reveal flex-[1_1_400px]">
            <p className="eyebrow">{t('measuredEyebrow')}</p>
            <h2 className="h-section mt-5">
              <Accent text={t('measuredTitle')} />
            </h2>
            <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-t2">{t('measuredBody')}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {(['analytics', 'console', 'attribution', 'vitals'] as const).map((key, index) => (
                <li key={key} className="inline-flex items-center gap-2 rounded-full border border-ln2 px-4 py-2.5 text-sm">
                  <span className="glow size-[7px] rounded-full bg-lime" style={{ animationDelay: `${index * 0.6}s` }} aria-hidden="true" />
                  {t(`measuredChips.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <MeasuredChart />
        </div>
      </section>

      {/* (01) Services */}
      <section className="cv wrap sec-pad">
        <SectionHead
          kicker={numberedKicker(1, t('servicesEyebrow'))}
          title={t('servicesTitle')}
          action={
            <Link href="/services" className="btn btn-g btn-md">
              {t('allServices')}
            </Link>
          }
        />
        <ServiceCards services={services} />
      </section>

      <ToolCards />

      {/* (02) Selected work — inverted band */}
      {lead && (
        <section className="cv inv rounded-t-[40px] bg-bg text-fg">
          <div className="wrap sec-pad">
            <SectionHead
              kicker={numberedKicker(2, t('workEyebrow'))}
              title={t('workTitle')}
              plainAccent
              action={
                <Link href="/work" className="btn btn-md bg-fg font-medium text-bg">
                  {t('viewAllWork')}
                </Link>
              }
            />
            <FeaturedProjectCard project={lead} labels={{ live: t('livePreview'), read: t('readCaseStudy') }} />
            {rest.length > 0 && (
              <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
                {rest.map((project, index) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    palette={PROJECT_PALETTES[(index + 1) % PROJECT_PALETTES.length]}
                    labels={{ live: t('livePreview') }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* (03) Why */}
      <section className="inv bg-bg text-fg">
        <div className="wrap flex flex-wrap gap-16 pb-[clamp(80px,10vw,140px)]">
          <div className="flex-[1_1_380px]">
            <div className="sticky top-28">
              <p className="eyebrow">{numberedKicker(3, t('whyEyebrow'))}</p>
              <h2 className="mt-5 text-[clamp(40px,4.6vw,64px)] font-semibold leading-none tracking-[-0.04em]">
                <Accent text={t('whyTitle')} plain />
              </h2>
              <p className="mt-6 max-w-[420px] text-[17px] leading-relaxed text-t2">{t('whyBody')}</p>
              <WhyGauge idea={t('whyIdea')} results={t('whyResults')} />
            </div>
          </div>
          <WhyList
            items={(['1', '2', '3', '4', '5', '6'] as const).map((key) => ({
              title: t(`why.${key}.title`),
              body: t(`why.${key}.body`),
            }))}
          />
        </div>
      </section>

      {/* (04) Industries */}
      <section className="cv wrap sec-pad">
        <SectionHead kicker={numberedKicker(4, t('industriesEyebrow'))} title={t('industriesTitle')} />
        <IndustryRows industries={industries} />
      </section>

      {/* (05) Process */}
      <section className="cv border-y border-ln bg-s1">
        <div className="wrap sec-pad">
          <SectionHead kicker={numberedKicker(5, t('processEyebrow'))} title={t('processTitle')} />
          <ProcessSteps
            steps={(['1', '2', '3', '4'] as const).map((key) => ({
              title: t(`process.${key}.title`),
              body: t(`process.${key}.body`),
            }))}
          />
        </div>
      </section>

      {/* Testimonials — hidden until the CMS has real quotes */}
      {testimonials.length > 0 && (
        <section className="cv overflow-hidden py-[clamp(80px,10vw,140px)]">
          <div className="wrap">
            <SectionHead kicker={t('testimonialsEyebrow')} title={t('testimonialsTitle')} />
          </div>
          <TestimonialMarquee testimonials={testimonials} />
        </section>
      )}

      {/* (06) Journal */}
      {posts.length > 0 && (
        <section className="cv wrap pb-[clamp(80px,10vw,140px)]">
          <SectionHead
            kicker={numberedKicker(6, t('journalEyebrow'))}
            title={t('journalTitle')}
            action={
              <Link href="/blog" className="btn btn-g btn-md">
                {t('allArticles')}
              </Link>
            }
          />
          <div className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
            {posts.slice(0, 3).map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                index={index}
                locale={locale}
                minLabel={tCommon('minShort', { minutes: post.readingTime })}
              />
            ))}
          </div>
        </section>
      )}

      {/* (07) FAQ */}
      {faqs.length > 0 && (
        <section className="cv border-t border-ln">
          <div className="wrap sec-pad flex flex-wrap gap-16">
            <div className="reveal flex-[1_1_360px]">
              <p className="eyebrow">{numberedKicker(7, t('faqEyebrow'))}</p>
              <h2 className="mt-5 text-[clamp(40px,4.4vw,60px)] font-semibold leading-none tracking-[-0.04em]">
                <Accent text={t('faqTitle')} />
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-t3">
                {t('faqMore')}{' '}
                <a href={`mailto:${settings.email}`} className="text-acct underline-offset-4 hover:underline">
                  {settings.email}
                </a>
                .
              </p>
            </div>
            <FaqList faqs={faqs} className="flex-[1_1_560px]" />
          </div>
        </section>
      )}
    </>
  );
}
