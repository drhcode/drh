import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { isAppLocale, routing } from '@/i18n/routing';
import { pickMessages } from '@/i18n/pick';
import { uiAvailability } from '@/i18n/availability';
import { Accent } from '@/components/brand/accent';
import { SectionHead } from '@/components/brand/section-head';
import { Crumbs } from '@/components/blocks/page-hero';
import { HeroFx } from '@/components/fx/pointer-fx';
import { AuditForm } from '@/components/audit/audit-form';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'audit' });

  return buildMetadata({
    locale,
    path: '/audit',
    title: t('metaTitle'),
    description: t('metaDescription'),
    available: uiAvailability(['audit']),
  });
}

const CHECK_ICONS = {
  speed: 'M6 40a26 26 0 0152 0M32 40l12-14M28 40a4 4 0 108 0 4 4 0 10-8 0',
  seo: 'M28 8a20 20 0 100 40 20 20 0 000-40zM42 42l14 14',
  a11y: 'M32 8a4 4 0 100 8 4 4 0 000-8zM14 24h36M32 24v14M24 56l8-18 8 18',
  mobile: 'M20 6h24v52H20zM28 12h8M30 50h4',
  conversion: 'M8 12h48l-18 22v18l-12 6V34z',
  security: 'M32 6l22 8v16c0 14-10 24-22 28C20 54 10 44 10 30V14zM22 32l7 7 13-14',
} as const;

/** The sample report: illustrative numbers, always labelled as a sample. */
const SAMPLE_GAUGES = [
  { key: 'performance', value: 62, color: '#FF8A3D' },
  { key: 'seo', value: 78, color: '#D4FF3A' },
  { key: 'accessibility', value: 85, color: '#D4FF3A' },
  { key: 'conversion', value: 54, color: '#FF8A3D' },
] as const;

export default async function AuditPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, messages] = await Promise.all([getTranslations('audit'), getTranslations('common'), getMessages()]);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('crumb'), path: '/audit' },
            ],
            locale,
          ),
        )}
      />

      <HeroFx className="grid-bg border-b border-ln">
        <div className="wrap relative flex flex-wrap items-center gap-14 pb-[88px] pt-[clamp(56px,8vw,104px)]">
          <div className="min-w-0 flex-[1.2_1_520px]">
            <Crumbs items={[{ label: t('crumbRoot') }, { label: t('crumb') }]} label={tCommon('breadcrumb')} />
            <h1 className="rise-t d1 mt-7 text-[clamp(52px,7.6vw,120px)] font-semibold leading-[.92] tracking-[-0.055em]">
              <Accent text={t('heroTitle')} />
            </h1>
            <p className="lead rise-t d2 mt-7 max-w-[540px]">{t('lead')}</p>
            <NextIntlClientProvider messages={pickMessages(messages, ['audit', 'form'])}>
              <AuditForm />
            </NextIntlClientProvider>
          </div>

          <div className="rise d3 hide-sm relative h-[440px] min-w-0 flex-[1_1_400px]" aria-hidden="true">
            <div className="bob absolute inset-[0_30px_40px_0] overflow-hidden rounded-[22px] border border-ln bg-s1 shadow-[0_50px_100px_-40px_var(--sh)]">
              <div className="flex gap-1.5 border-b border-ln px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-2.5 rounded-full bg-ln2" />
                ))}
              </div>
              <div className="flex flex-col gap-3.5 p-7">
                <div className="h-[30px] w-[70%] rounded-md bg-s2" />
                <div className="h-3.5 w-[90%] rounded-md bg-s2" />
                <div className="h-3.5 w-[60%] rounded-md bg-s2" />
                <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                  <div className="h-[90px] rounded-xl bg-s2" />
                  <div className="h-[90px] rounded-xl bg-s2 outline-2 outline-offset-[3px] outline-[#FF8A3D] outline-dashed" />
                  <div className="h-[90px] rounded-xl bg-s2" />
                </div>
                <div className="h-11 w-40 rounded-full bg-s2 outline-2 outline-offset-[3px] outline-lime outline-dashed" />
              </div>
              <div className="scan pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-[linear-gradient(180deg,transparent,#D4FF3A22_85%,#D4FF3A)]" />
            </div>
            <div className="absolute bottom-0 right-0 flex flex-col gap-2">
              <span className="mono rounded-xl bg-[#FF8A3D] px-3.5 py-2.5 text-xs font-medium text-ink">{t('flag1')}</span>
              <span className="mono rounded-xl bg-lime px-3.5 py-2.5 text-xs font-medium text-ink">{t('flag2')}</span>
            </div>
          </div>
        </div>
      </HeroFx>

      <section className="wrap sec-pad">
        <SectionHead kicker={t('checkEyebrow')} title={t('checkTitle')} />
        <ul className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {(Object.keys(CHECK_ICONS) as (keyof typeof CHECK_ICONS)[]).map((key) => (
            <li key={key} className="card reveal flex min-h-[220px] flex-col gap-3.5 rounded-3xl border border-ln bg-s1 p-8">
              <svg className="ico" width="44" height="44" viewBox="0 0 64 64" fill="none" stroke="#D4FF3A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path className="draw-v" pathLength={1000} d={CHECK_ICONS[key]} />
              </svg>
              <h3 className="m-0 mt-auto text-[22px] font-semibold tracking-[-0.02em]">{t(`checks.${key}.title`)}</h3>
              <p className="text-[15px] leading-relaxed text-t3">{t(`checks.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-[clamp(12px,2vw,24px)] pb-[clamp(80px,10vw,140px)]">
        <div className="mx-auto max-w-[1280px] rounded-[40px] border border-ln bg-s1 p-[clamp(32px,5vw,64px)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="m-0 text-[clamp(32px,3.6vw,52px)] font-semibold tracking-[-0.04em]">{t('sampleTitle')}</h2>
            <span className="mono rounded-full border border-dashed border-ln2 px-3.5 py-2 text-xs text-t3">{t('sampleBadge')}</span>
          </div>
          <ul className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
            {SAMPLE_GAUGES.map((gauge) => (
              <li key={gauge.key} className="reveal flex flex-col items-center gap-3.5 rounded-3xl bg-bg p-6">
                <div className="relative size-[120px]">
                  <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#23272a" strokeWidth="10" />
                    <circle
                      className="gauge"
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={gauge.color}
                      strokeWidth="10"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray="100"
                      strokeDashoffset={100 - gauge.value}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-[34px] font-bold tracking-[-0.04em]">{gauge.value}</span>
                </div>
                <span className="font-semibold">{t(`gauges.${gauge.key}`)}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-8 border-t border-ln">
            {(['1', '2', '3'] as const).map((key, index) => (
              <li key={key} className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-ln py-5">
                <span
                  className="mono rounded-full px-3 py-1.5 text-[11px] font-medium text-ink"
                  style={{ background: index < 2 ? '#FF8A3D' : '#D4FF3A' }}
                >
                  {index < 2 ? t('high') : t('medium')}
                </span>
                <span className="flex-[1_1_320px] text-[17px]">{t(`fixes.${key}`)}</span>
                <span className="mono text-[13px] text-t3">{index < 2 ? t('effortLow') : t('effortMedium')}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
