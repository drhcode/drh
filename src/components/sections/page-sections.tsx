import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Language, PageSection } from '@/types/database';
import {
  getBlogPosts,
  getFaqs,
  getFeaturedProjects,
  getFeaturedServices,
  getIndustries,
  getTechnologies,
  getTestimonials,
} from '@/lib/data';
import { Accent } from '@/components/brand/accent';
import { ArrowRight } from '@/components/brand/icons';
import { SectionHead, numberedKicker } from '@/components/brand/section-head';
import { HeroFx, Magnetic } from '@/components/fx/pointer-fx';
import { ServiceCards } from '@/components/blocks/service-cards';
import { FeaturedProjectCard, PROJECT_PALETTES, ProjectCard } from '@/components/blocks/project-cards';
import { FaqList, IndustryRows, PostCard, ProcessSteps } from '@/components/blocks/lists';
import { TechMarquee, TestimonialMarquee } from '@/components/blocks/marquees';

const NUMBERED_TYPES = ['services', 'projects', 'featureGrid', 'industries', 'process', 'blog', 'faq'] as const;
type NumberedType = (typeof NUMBERED_TYPES)[number];
const NUMBERED = new Set<string>(NUMBERED_TYPES);

/**
 * Renders a CMS landing page from its ordered section blocks (spec §63).
 *
 * Still a fixed catalogue of pre-designed blocks rather than a free-form page
 * builder — editors choose, order and fill sections; the design system owns
 * the layout. Data-backed sections fetch their own content, so adding a
 * project in the admin updates every page that lists projects.
 */
export async function PageSections({ sections, locale }: { sections: PageSection[]; locale: Language }) {
  const [tSections, tHome, tCommon, uiLocale] = await Promise.all([
    getTranslations('sections'),
    getTranslations('home'),
    getTranslations('common'),
    getLocale(),
  ]);

  let counter = 0;
  const kickers = sections.map((section) =>
    NUMBERED.has(section.type) ? numberedKicker(++counter, tSections(section.type as NumberedType)) : undefined,
  );

  const rendered = await Promise.all(
    sections.map(async (section, index) => {
      const key = `${section.type}-${index}`;
      const kicker = kickers[index];
      const isFirst = index === 0;

      switch (section.type) {
        case 'hero': {
          const Heading = isFirst ? 'h1' : 'h2';
          return (
            <HeroFx key={key} className="grid-bg grain border-b border-ln">
              <div className="wrap relative pb-20 pt-[clamp(64px,9vw,120px)]">
                {section.eyebrow && (
                  <p className="rise inline-flex items-center gap-2.5 rounded-full border border-ln2 bg-s1 py-2 pl-3 pr-4 text-sm text-t1">
                    <span className="pulse-dot size-2 rounded-full bg-lime" aria-hidden="true" />
                    {section.eyebrow}
                  </p>
                )}
                <Heading className="rise-t d1 mt-8 max-w-[1100px] text-[clamp(44px,6.6vw,104px)] font-semibold leading-[.95] tracking-[-0.045em]">
                  <Accent text={section.title} autoLast />
                </Heading>
                {section.subtitle && <p className="lead rise-t d2 mt-8 max-w-[640px]">{section.subtitle}</p>}
                {section.body && (
                  <div className="rise d2 mt-5 max-w-[640px] space-y-4 text-[17px] leading-relaxed text-t2">
                    {section.body.split(/\n{2,}/).map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                )}
                <div className="rise d3 mt-9 flex flex-wrap gap-3">
                  <Magnetic>
                    <Link href="/contact" className="btn btn-p btn-lg shine">
                      {section.primaryCta ?? tHome('cta1')}
                      <ArrowRight />
                    </Link>
                  </Magnetic>
                  <Link href="/work" className="btn btn-g btn-lg">
                    {section.secondaryCta ?? tHome('cta2')}
                  </Link>
                </div>
                {section.note && <p className="rise d4 mt-6 text-sm text-t3">{section.note}</p>}
              </div>
            </HeroFx>
          );
        }

        case 'metrics':
          return (
            <section key={key} className="border-b border-ln">
              <dl className="mx-auto grid max-w-[1280px] [grid-template-columns:repeat(auto-fit,minmax(min(240px,50%),1fr))]">
                {section.items.map((item) => {
                  const match = item.value.match(/^([\d.,]+)(.*)$/);
                  return (
                    <div key={item.label} className="flex flex-col-reverse border-r border-ln px-[clamp(20px,4vw,48px)] py-12">
                      <dt className="mt-3 text-[15px] text-t3">{item.label}</dt>
                      <dd className="text-[clamp(48px,6vw,88px)] font-semibold leading-none tracking-[-0.05em]">
                        {match?.[1] ?? item.value}
                        <span className="text-acct">{match?.[2]}</span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          );

        case 'richText':
          return (
            <section key={key} className="wrap sec-pad">
              <div className="reveal flex flex-wrap gap-x-16 gap-y-8">
                {section.title && <h2 className="eyebrow m-0 flex-[0_0_220px] text-[13px] font-normal">{section.title}</h2>}
                <div className="prose-v2 min-w-0 max-w-[760px] flex-[1_1_560px]">
                  {section.body.split(/\n{2,}/).map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
          );

        case 'featureGrid':
          return (
            <section key={key} className="wrap sec-pad">
              {section.title && <SectionHead kicker={kicker} title={section.title} autoLast />}
              {section.subtitle && <p className="mt-6 max-w-[620px] text-lg text-t2">{section.subtitle}</p>}
              <ul className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
                {section.items.map((item, i) => (
                  <li key={item.title} className="card reveal flex min-h-[240px] flex-col rounded-[26px] border border-ln bg-s1 p-9 max-sm:p-7">
                    <span className="it text-[56px] leading-none">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="m-0 mt-auto pt-6 text-[23px] font-semibold tracking-[-0.02em]">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-t3">{item.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          );

        case 'process':
          return (
            <section key={key} className="border-y border-ln bg-s1">
              <div className="wrap sec-pad">
                {section.title && <SectionHead kicker={kicker} title={section.title} autoLast />}
                <ProcessSteps steps={section.steps.map((step) => ({ title: step.title, body: step.body }))} />
              </div>
            </section>
          );

        case 'technologies': {
          const technologies = await getTechnologies();
          return <TechMarquee key={key} label={section.title ?? tHome('techLabel')} items={technologies.map((tech) => tech.name)} />;
        }

        case 'services': {
          const services = await getFeaturedServices(locale);
          return (
            <section key={key} className="wrap sec-pad">
              <SectionHead
                kicker={kicker}
                title={section.title ?? tHome('servicesTitle')}
                autoLast
                action={
                  <Link href="/services" className="btn btn-g btn-md">
                    {tHome('allServices')}
                  </Link>
                }
              />
              <ServiceCards services={services} />
            </section>
          );
        }

        case 'projects': {
          const projects = await getFeaturedProjects(locale, section.limit ?? 3);
          const [lead, ...rest] = projects;
          if (!lead) return null;
          return (
            <section key={key} className="inv rounded-t-[40px] bg-bg text-fg">
              <div className="wrap sec-pad">
                <SectionHead
                  kicker={kicker}
                  title={section.title ?? tHome('workTitle')}
                  autoLast
                  plainAccent
                  action={
                    <Link href="/work" className="btn btn-md bg-fg font-medium text-bg">
                      {tHome('viewAllWork')}
                    </Link>
                  }
                />
                <FeaturedProjectCard project={lead} labels={{ live: tHome('livePreview'), read: tHome('readCaseStudy') }} />
                {rest.length > 0 && (
                  <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
                    {rest.map((project, i) => (
                      <ProjectCard key={project.slug} project={project} palette={PROJECT_PALETTES[(i + 1) % 3]} labels={{ live: tHome('livePreview') }} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        }

        case 'industries': {
          const industries = await getIndustries(locale);
          return (
            <section key={key} className="wrap sec-pad">
              <SectionHead kicker={kicker} title={section.title ?? tHome('industriesTitle')} autoLast />
              <IndustryRows industries={industries} />
            </section>
          );
        }

        case 'testimonials': {
          const testimonials = await getTestimonials(locale, { featuredOnly: true });
          if (testimonials.length === 0) return null;
          return (
            <section key={key} className="overflow-hidden py-[clamp(80px,10vw,140px)]">
              <div className="wrap">
                <SectionHead kicker={tHome('testimonialsEyebrow')} title={section.title ?? tHome('testimonialsTitle')} autoLast />
              </div>
              <TestimonialMarquee testimonials={testimonials} />
            </section>
          );
        }

        case 'blog': {
          const posts = (await getBlogPosts(locale)).slice(0, section.limit ?? 3);
          if (posts.length === 0) return null;
          return (
            <section key={key} className="wrap sec-pad">
              <SectionHead
                kicker={kicker}
                title={section.title ?? tHome('journalTitle')}
                autoLast
                action={
                  <Link href="/blog" className="btn btn-g btn-md">
                    {tHome('allArticles')}
                  </Link>
                }
              />
              <div className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
                {posts.map((post, i) => (
                  <PostCard key={post.slug} post={post} index={i} locale={uiLocale} minLabel={tCommon('minShort', { minutes: post.readingTime })} />
                ))}
              </div>
            </section>
          );
        }

        case 'faq': {
          const faqs = await getFaqs(locale, { category: section.category ?? 'general' });
          if (faqs.length === 0) return null;
          return (
            <section key={key} className="border-t border-ln">
              <div className="wrap sec-pad flex flex-wrap gap-16">
                <div className="reveal flex-[1_1_360px]">
                  <p className="eyebrow">{kicker}</p>
                  <h2 className="mt-5 text-[clamp(40px,4.4vw,60px)] font-semibold leading-none tracking-[-0.04em]">
                    <Accent text={section.title ?? tHome('faqTitle')} autoLast />
                  </h2>
                  {section.subtitle && <p className="mt-6 text-[17px] leading-relaxed text-t3">{section.subtitle}</p>}
                </div>
                <FaqList faqs={faqs} className="flex-[1_1_560px]" />
              </div>
            </section>
          );
        }

        case 'cta':
          return (
            <section key={key} className="wrap py-[clamp(48px,6vw,80px)]">
              <div className="reveal on-lime flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-lime p-[clamp(32px,4vw,56px)] text-ink">
                <div className="max-w-[640px]">
                  <h2 className="m-0 text-[clamp(32px,3.6vw,52px)] font-semibold leading-none tracking-[-0.04em]">
                    <Accent text={section.title} autoLast plain />
                  </h2>
                  {section.body && <p className="mt-4 whitespace-pre-line text-[17px] leading-relaxed text-lime-ink">{section.body}</p>}
                </div>
                <Link href="/contact" className="btn btn-ink h-[60px] px-[30px] text-[17px]">
                  {section.primaryCta ?? tHome('cta1')}
                  <ArrowRight />
                </Link>
              </div>
            </section>
          );

        default:
          return null;
      }
    }),
  );

  return <>{rendered}</>;
}
