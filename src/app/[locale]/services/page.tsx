import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getCompanySettings, getServices } from '@/lib/data';
import { PRICE_TIERS, formatEuro } from '@/config/pricing';
import { Accent } from '@/components/brand/accent';
import { SectionHead } from '@/components/brand/section-head';
import { DRH_LOGO_HEIGHT, DRH_LOGO_PATH, DRH_LOGO_VIEWBOX, DRH_LOGO_WIDTH } from '@/components/brand/drh-logo';
import { Magnetic } from '@/components/fx/pointer-fx';
import { PageHero } from '@/components/blocks/page-hero';
import { ServiceFilter, type ServiceGroup } from '@/components/services/service-filter';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph, organizationSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Which filter a service sits under. Anything new defaults to "build". */
const GROUPS: Record<string, ServiceGroup> = {
  'ui-ux-design': 'design',
  seo: 'grow',
  'google-ads': 'grow',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'services' });

  return buildMetadata({
    locale,
    path: '/services',
    title: `${t('heroTitle')} | drh.al`,
    description: t('heroDescription'),
    available: ['en', 'sq'],
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, tHome, services, settings] = await Promise.all([
    getTranslations('services'),
    getTranslations('common'),
    getTranslations('home'),
    getServices(contentLanguage(locale)),
    getCompanySettings(),
  ]);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('title'), path: '/services' },
            ],
            locale,
          ),
        )}
      />

      <PageHero
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('title') }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={t('v2HeroTitle')}
        titleClassName="whitespace-pre-line"
        lead={<p>{t('v2Lead')}</p>}
        visual={<OctagonVisual />}
      />

      <section className="wrap pb-[120px] pt-[72px]">
        <ServiceFilter
          rows={services.map((service) => ({
            slug: service.slug,
            title: service.title,
            description: service.shortDescription,
            group: GROUPS[service.slug] ?? 'build',
          }))}
          labels={{
            filter: t('filterLabel'),
            all: t('filterAll'),
            tabs: { build: t('tabBuild'), design: t('tabDesign'), grow: t('tabGrow') },
            groups: { build: t('groupBuild'), design: t('groupDesign'), grow: t('groupGrow') },
          }}
        />
      </section>

      {/* AI band */}
      <section className="px-[clamp(12px,2vw,24px)]">
        <div className="overflow-hidden rounded-[40px] border border-ln bg-s1">
          <div className="wrap flex flex-wrap items-center gap-14 py-[clamp(64px,8vw,112px)]">
            <div className="reveal flex-[1_1_460px]">
              <p className="eyebrow">{t('aiEyebrow')}</p>
              <h2 className="mt-5 text-[clamp(40px,5vw,68px)] font-semibold leading-none tracking-[-0.04em]">
                <Accent text={tHome('aiTitle')} />
              </h2>
              <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-t2">{t('aiBody')}</p>
              <Magnetic className="mt-8">
                <Link href="/contact" className="btn btn-p btn-md">
                  {tHome('aiCta')}
                </Link>
              </Magnetic>
            </div>
            <ul className="reveal grid flex-[1_1_420px] grid-cols-2 gap-3 max-[420px]:grid-cols-1">
              {(['agents', 'retrieval', 'integration', 'evaluation'] as const).map((key, index) => (
                <li
                  key={key}
                  className="card flex min-h-40 flex-col justify-between rounded-[20px] border border-ln bg-bg p-6"
                >
                  <span className="mono text-xs text-acct">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-[19px] font-semibold">{tHome(`aiCards.${key}.title`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Investment */}
      <section className="wrap sec-pad">
        <SectionHead
          kicker={t('investmentEyebrow')}
          title={t('investmentTitle')}
          action={<p className="m-0 max-w-[380px] text-base leading-relaxed text-t3">{t('investmentNote')}</p>}
        />
        <ul className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {PRICE_TIERS.map((tier) => {
            const featured = tier.id === 'corporate';
            const price = tier.max ? `${formatEuro(tier.min)}–${formatEuro(tier.max).slice(1)}` : t('fromPrice', { price: formatEuro(tier.min) });
            return (
              <li
                key={tier.id}
                className={
                  featured
                    ? 'card reveal on-lime flex flex-col gap-5 rounded-[28px] border border-lime bg-lime p-9 text-ink'
                    : 'card reveal flex flex-col gap-5 rounded-[28px] border border-ln bg-s1 p-9'
                }
              >
                <span className={featured ? 'mono text-xs tracking-[.1em]' : 'mono text-xs tracking-[.1em] text-t3'}>
                  {t(`tiers.${tier.id}.label`)}
                </span>
                <span className="text-[44px] font-semibold tracking-[-0.04em]">{price}</span>
                <p className={featured ? 'text-base leading-relaxed text-lime-ink' : 'text-base leading-relaxed text-t2'}>
                  {t(`tiers.${tier.id}.body`)}
                </p>
                <Link
                  href={{ pathname: '/contact', query: { budget: tier.budget } }}
                  className={featured ? 'btn btn-ink btn-md mt-auto w-full' : 'btn btn-g btn-md mt-auto w-full'}
                >
                  {t('getQuote')}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function OctagonVisual() {
  const nodes: [number, number][] = [
    [380, 210], [330, 330], [210, 380], [90, 330], [40, 210], [90, 90], [210, 40], [330, 90],
  ];
  return (
    <svg
      className="hide-sm pointer-events-none absolute right-[4%] top-10 overflow-visible"
      viewBox="0 0 420 420"
      width="420"
      height="420"
      aria-hidden="true"
    >
      <g className="orbit" style={{ transformOrigin: '210px 210px', animationDuration: '90s' }}>
        <path
          className="flow"
          d={nodes.map(([x, y]) => `M210 210L${x} ${y}`).join('')}
          stroke="#3a403d"
          strokeWidth="1.5"
        />
        <path
          className="drawloop"
          pathLength={1000}
          d="M380 210L330 330L210 380L90 330L40 210L90 90L210 40L330 90Z"
          fill="none"
          stroke="#D4FF3A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {nodes.map(([x, y], index) => (
          <circle
            key={index}
            className="glow"
            cx={x}
            cy={y}
            r="8"
            fill="#0b0d0c"
            stroke="#D4FF3A"
            strokeWidth="2"
            style={{ animationDelay: `${index * 0.3}s` }}
          />
        ))}
      </g>
      <circle className="glow" cx="210" cy="210" r="56" fill="#D4FF3A" fillOpacity=".12" />
      <circle cx="210" cy="210" r="34" fill="#D4FF3A" />
      {/* Logo centred in the hub: 44 units wide at the artwork's aspect ratio. */}
      <svg x="188" y={210 - (22 * DRH_LOGO_HEIGHT) / DRH_LOGO_WIDTH} width="44" height={(44 * DRH_LOGO_HEIGHT) / DRH_LOGO_WIDTH} viewBox={DRH_LOGO_VIEWBOX}>
        <path d={DRH_LOGO_PATH} fillRule="evenodd" style={{ fill: '#0b0d0c' }} />
      </svg>
    </svg>
  );
}
