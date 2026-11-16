import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getCompanySettings, getFaqs, getProjectsByService, getService, getServices } from '@/lib/data';
import { Accent } from '@/components/brand/accent';
import { SectionHead } from '@/components/brand/section-head';
import { Magnetic } from '@/components/fx/pointer-fx';
import { PageHero } from '@/components/blocks/page-hero';
import { FaqList } from '@/components/blocks/lists';
import { PROJECT_PALETTES, ProjectCard } from '@/components/blocks/project-cards';
import { ProcessTabs } from '@/components/services/process-tabs';
import { BrowserMock } from '@/components/services/browser-mock';
import { JsonLd } from '@/components/seo/json-ld';
import { DraftBanner } from '@/components/site/draft-banner';
import { ServiceViewTracker } from '@/components/site/project-view-tracker';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, jsonLdGraph, serviceSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getServices('en');
  return routing.locales.flatMap((locale) => services.map((service) => ({ locale, slug: service.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const service = await getService(contentLanguage(locale), slug);
  if (!service) return {};

  return buildMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: seoText(service.seo.title, service.headline, `${service.title} | drh.al`),
    description: seoText(service.seo.description, service.shortDescription, `${service.title} by drh.al.`),
    ogImage: service.seo.ogImage,
    ogTitle: service.seo.ogTitle,
    ogDescription: service.seo.ogDescription,
    isIndexable: service.seo.isIndexable,
    translations: service.translations,
  });
}

/** Icons for "What's included", cycled in order (from the service artboard). */
const INCLUDED_ICONS = [
  'M3 5h18v14H3zM3 9h18',
  'M12 3a9 9 0 100 18 9 9 0 000-18zm0 5a4 4 0 100 8 4 4 0 000-8z',
  'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  'M8 7l-5 5 5 5M16 7l5 5-5 5',
  'M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z',
  'M13 2L4 14h7l-1 8 9-12h-7z',
  'M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0zM12 18v4',
  'M4 20V10M10 20V4M16 20v-7M22 20H2',
];

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const language = contentLanguage(locale);

  // Draft mode is enabled only by the admin preview route, which checks
  // authorisation first, so unpublished content stays private.
  const preview = (await draftMode()).isEnabled;
  const service = await getService(language, slug, { includeUnpublished: preview });
  if (!service) notFound();

  const [t, tService, tCommon, tHome, projects, faqs, settings] = await Promise.all([
    getTranslations('services'),
    getTranslations('service'),
    getTranslations('common'),
    getTranslations('home'),
    getProjectsByService(language, slug, 2),
    getFaqs(language, { category: 'general' }),
    getCompanySettings(),
  ]);

  const [lead, ...rest] = (service.fullDescription ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const steps = service.process.map((step) => ({ title: step.title, body: step.body }));

  return (
    <>
      <DraftBanner path={`/services/${slug}`} />
      <JsonLd
        json={jsonLdGraph(
          serviceSchema(service, locale, settings),
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('title'), path: '/services' },
              { name: service.title, path: `/services/${service.slug}` },
            ],
            locale,
          ),
          faqSchema(faqs),
        )}
      />
      <ServiceViewTracker serviceId={service.id} slug={service.slug} />

      <PageHero
        crumbs={[{ label: t('title'), href: '/services' }, { label: service.title }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={service.headline ?? service.title}
        autoLast
        // CMS headlines run longer than the artboard's sample, so long ones step down a size.
        titleClassName={
          (service.headline ?? service.title).length > 36
            ? 'text-[clamp(40px,5vw,80px)] leading-[.95] tracking-[-0.045em]'
            : 'text-[clamp(44px,6.6vw,104px)] leading-[.93] tracking-[-0.05em]'
        }
        lead={service.shortDescription ? <p>{service.shortDescription}</p> : undefined}
        aside={<BrowserMock url={tService('mockUrl')} leadTitle={tService('mockLeadTitle')} leadBody={tService('mockLeadBody')} />}
      >
        <div className="rise d3 mt-8 flex flex-wrap gap-3">
          <Magnetic>
            <Link href={{ pathname: '/contact', query: { service: slug } }} className="btn btn-p btn-lg">
              {tHome('cta1')}
            </Link>
          </Magnetic>
          <Link href="/work" className="btn btn-g btn-lg">
            {tService('selectedWork')}
          </Link>
        </div>
      </PageHero>

      {lead && (
        <section className="wrap pt-[clamp(80px,10vw,140px)]">
          <div className="reveal flex flex-wrap gap-x-16 gap-y-10">
            <h2 className="eyebrow m-0 flex-[0_0_200px] text-[13px] font-normal">{tService('overview')}</h2>
            <div className="flex-[1_1_560px]">
              <p
                className={
                  lead.length > 220
                    ? 'm-0 text-[clamp(22px,2.2vw,30px)] leading-[1.35] tracking-[-0.02em]'
                    : 'm-0 text-[clamp(24px,2.8vw,40px)] leading-[1.25] tracking-[-0.025em]'
                }
              >
                {lead}
              </p>
              {rest.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mt-6 max-w-[720px] text-lg leading-relaxed text-t2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.features.length > 0 && (
        <section className="wrap sec-pad">
          <SectionHead kicker={t('whatsIncluded')} title={tService('includedTitle')} />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-ln bg-ln [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
            {service.features.map((feature, index) => (
              <li key={feature} className="reveal flex min-h-[200px] flex-col justify-between gap-6 bg-bg p-8">
                <span className="grid size-11 place-items-center rounded-xl bg-s1 text-acct" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={INCLUDED_ICONS[index % INCLUDED_ICONS.length]} />
                  </svg>
                </span>
                <span className="text-xl font-semibold leading-[1.25] tracking-[-0.02em]">{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {service.benefits.length > 0 && (
        <section className="inv rounded-[40px] bg-bg text-fg">
          <div className="wrap sec-pad">
            <SectionHead kicker={t('benefits')} title={tService('whyTitle')} plainAccent />
            <ul className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
              {service.benefits.map((benefit, index) => (
                <BenefitCard key={benefit.title} index={index} title={benefit.title} body={benefit.body} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="wrap sec-pad">
          <SectionHead kicker={t('process')} title={tService('processTitle')} />
          <ProcessTabs
            steps={steps}
            label={t('process')}
            stepLabel={steps.map((_, index) =>
              tService('stepOf', { n: String(index + 1).padStart(2, '0'), total: String(steps.length).padStart(2, '0') }),
            )}
          />
        </section>
      )}

      {projects.length > 0 && (
        <section className="wrap pb-[clamp(80px,10vw,140px)]">
          <SectionHead
            kicker={t('relatedWork')}
            title={tHome('workTitle')}
            action={
              <Link href="/work" className="btn btn-g btn-md">
                {tHome('viewAllWork')}
              </Link>
            }
          />
          <div className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                palette={PROJECT_PALETTES[index % PROJECT_PALETTES.length]}
                labels={{ live: tHome('livePreview') }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-ln">
        <div className="wrap sec-pad flex flex-wrap gap-16">
          <div className="reveal flex-[1_1_360px]">
            {service.technologies.length > 0 && (
              <>
                <h2 className="eyebrow m-0 text-[13px] font-normal">{tService('stack')}</h2>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {service.technologies.map((tech) => (
                    <li key={tech.slug} className="rounded-full border border-ln2 px-5 py-3 text-base">
                      {tech.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {faqs.length > 0 && (
              <h2 className="mt-16 text-[clamp(36px,4vw,56px)] font-semibold leading-none tracking-[-0.04em]">
                <Accent text={tService('faqTitle')} />
              </h2>
            )}
          </div>
          <FaqList faqs={faqs.slice(0, 4)} className="flex-[1_1_560px]" />
        </div>
      </section>
    </>
  );
}

/** The four card treatments from the artboard, cycled over the CMS benefits. */
function BenefitCard({ index, title, body }: { index: number; title: string; body: string }) {
  const variant = index % 4;
  const base = 'card reveal flex min-h-[340px] flex-col rounded-[28px] border p-8';
  const styles = [
    `${base} border-ln bg-s1`,
    `${base} border-fg bg-fg text-bg`,
    `${base} border-ln bg-s1`,
    `${base} on-lime border-lime bg-lime text-ink`,
  ];
  const muted = ['text-t2', 'opacity-75', 'text-t2', 'text-lime-ink'];
  return (
    <li className={styles[variant]}>
      <div aria-hidden="true" className="h-[120px]">
        {variant === 0 && (
          <div className="flex h-full items-end gap-2.5">
            {['30%', '48%', '70%', '100%'].map((h, i) => (
              <div key={h} className={`bar d${i} flex-1 origin-bottom rounded-lg ${i === 3 ? 'bg-fg' : 'bg-ln2'}`} style={{ height: h }} />
            ))}
          </div>
        )}
        {variant === 1 && (
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#23272a" strokeWidth="10" />
            <circle className="draw-v" pathLength={1000} cx="60" cy="60" r="52" fill="none" stroke="#D4FF3A" strokeWidth="10" strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
        )}
        {variant === 2 && (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-9 rounded-[10px] ${i === 2 ? 'bg-lime' : 'bg-bg'}`} style={{ width: `${90 - i * 14}%` }} />
            ))}
          </div>
        )}
        {variant === 3 && <span className="mono text-6xl leading-none">✳</span>}
      </div>
      <h3 className="m-0 mt-auto pt-7 text-[22px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className={`mt-2 text-[15px] leading-relaxed ${muted[variant]}`}>{body}</p>
    </li>
  );
}
