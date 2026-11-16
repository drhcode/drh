import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getCompanySettings, getPage } from '@/lib/data';
import { Accent } from '@/components/brand/accent';
import { SectionHead } from '@/components/brand/section-head';
import { Crumbs } from '@/components/blocks/page-hero';
import { HeroFx } from '@/components/fx/pointer-fx';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph, organizationSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const page = await getPage(contentLanguage(locale), 'about');

  return buildMetadata({
    locale,
    path: '/about',
    title: seoText(page?.seo.title, null, 'About drh.al | Digital Agency in Albania'),
    description: seoText(
      page?.seo.description,
      null,
      'drh.al is a web development and digital agency based in Albania, building websites, web applications and mobile products for clients locally and internationally.',
    ),
    ogImage: page?.seo.ogImage,
    isIndexable: page?.seo.isIndexable ?? true,
    translations: page?.translations,
  });
}

const PIPELINE_ICONS = ['M8 7l-5 5 5 5M16 7l5 5-5 5', 'M5 12l5 5L20 7', 'M12 3a4 4 0 014 4v1h1a3 3 0 010 6h-1v1a4 4 0 01-8 0v-1H7a3 3 0 010-6h1V7a4 4 0 014-4z'];

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, tHome, settings] = await Promise.all([
    getTranslations('about'),
    getTranslations('common'),
    getTranslations('home'),
    getCompanySettings(),
  ]);

  const words = [t('word1'), t('word2'), t('word3')];

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('crumb'), path: '/about' },
            ],
            locale,
          ),
        )}
      />

      <HeroFx className="grid-bg border-b border-ln">
        <div className="wrap relative pb-[88px] pt-[clamp(64px,9vw,120px)]">
          <Crumbs items={[{ label: tCommon('home'), href: '/' }, { label: t('crumb') }]} label={tCommon('breadcrumb')} />
          <h1 className="rise-t d1 mt-7 text-[clamp(52px,8.4vw,136px)] font-semibold leading-[.92] tracking-[-0.055em]">
            {/* The rotating words are decorative; the heading reads as one sentence. */}
            <span className="sr-only">{t('heroSr', { words: words.join(', ') })}</span>
            <span aria-hidden="true">
              <span className="whitespace-pre-line">{t('heroStart')}</span>{' '}
              <span className="inline-block h-[1.1em] overflow-hidden align-bottom">
                <span className="words">
                  {[...words, words[0]].map((word, index) => (
                    <em key={index} className="it">
                      {word}
                    </em>
                  ))}
                </span>
              </span>
              .
            </span>
          </h1>
          <div className="rise d2 mt-12 flex flex-wrap items-end justify-between gap-10">
            <p className="lead m-0 max-w-[560px]">{t('v2Lead')}</p>
            <Link href="/work" className="btn btn-g btn-lg">
              {tHome('cta2')}
            </Link>
          </div>
        </div>
      </HeroFx>

      <section className="border-b border-ln">
        <dl className="mx-auto grid max-w-[1280px] [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
          {[
            { v: t('stat1Value'), l: t('stat1Label') },
            { v: t('stat2Value'), l: t('stat2Label') },
            { v: t('stat3Value'), l: t('stat3LabelLong') },
          ].map((stat) => {
            const match = stat.v.match(/^(\d+)(.*)$/);
            return (
              <div key={stat.l} className="flex flex-col-reverse border-r border-ln px-[clamp(20px,4vw,48px)] py-14 max-sm:py-9">
                <dt className="mt-3.5 text-base text-t3">{stat.l}</dt>
                <dd className="text-[clamp(72px,8vw,128px)] font-semibold leading-[.9] tracking-[-0.06em]">
                  {match?.[1] ?? stat.v}
                  <span className="text-acct">{match?.[2]}</span>
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="wrap py-[clamp(96px,12vw,180px)]">
        <h2 className="eyebrow m-0 text-[13px] font-normal">{t('philosophyEyebrow')}</h2>
        <p className="fill-text mt-7 text-[clamp(36px,4.8vw,72px)] font-semibold leading-[1.08] tracking-[-0.04em]">
          {t('philosophy')}
        </p>
      </section>

      <section className="px-[clamp(12px,2vw,24px)]">
        <div className="rounded-[40px] border border-ln bg-s1">
          <div className="wrap py-[clamp(64px,8vw,112px)]">
            <SectionHead
              kicker={t('studioEyebrow')}
              title={t('pipelineTitle')}
              titleClassName="max-w-[760px]"
              action={<p className="m-0 max-w-[400px] text-base leading-relaxed text-t3">{t('pipelineNote')}</p>}
            />
            <div className="relative mt-[72px]">
              <div className="hide-sm absolute inset-x-[6%] top-9 h-0.5 bg-ln2" aria-hidden="true">
                <span className="travel absolute -top-[5px] -ml-1.5 size-3 rounded-full bg-lime shadow-[0_0_0_6px_#D4FF3A33]" />
              </div>
              <ol className="relative grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
                {(['1', '2', '3'] as const).map((key, index) => (
                  <li key={key} className="reveal text-center">
                    <span
                      aria-hidden="true"
                      className={
                        index === 2
                          ? 'mx-auto grid size-[72px] place-items-center rounded-[22px] bg-lime text-ink'
                          : 'mx-auto grid size-[72px] place-items-center rounded-[22px] border border-ln2 bg-bg text-acct'
                      }
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={PIPELINE_ICONS[index]} />
                      </svg>
                    </span>
                    <h3 className="m-0 mt-6 text-[22px] font-semibold">{t(`pipeline.${key}.title`)}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-t3">{t(`pipeline.${key}.body`)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap sec-pad">
        <SectionHead kicker={t('valuesEyebrow')} title={t('valuesTitle')} />
        <ul className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
          {(['1', '2', '3', '4', '5', '6'] as const).map((key) => (
            <li key={key} className="card reveal flex min-h-[260px] flex-col rounded-[26px] border border-ln bg-s1 p-9 max-sm:p-7">
              <span className="it text-[56px] leading-none">{key.padStart(2, '0')}</span>
              <h3 className="m-0 mt-auto pt-6 text-[23px] font-semibold tracking-[-0.02em]">{t(`values.${key}.title`)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-t3">{t(`values.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="inv rounded-t-[40px] bg-bg text-fg">
        <div className="wrap sec-pad flex flex-wrap items-center gap-14">
          <div className="reveal flex-[1_1_440px]">
            <p className="eyebrow">{t('marketsEyebrow')}</p>
            <h2 className="h-section mt-5">
              <Accent text={t('marketsTitle')} plain />
            </h2>
            <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-t2">{t('marketsBody')}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {['English', 'Shqip', 'Italiano'].map((lang) => (
                <li key={lang} className="rounded-full bg-fg px-[18px] py-2.5 text-[15px] text-bg">
                  {lang}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="reveal relative h-[420px] flex-[1_1_440px] overflow-hidden rounded-[32px] bg-s2"
            role="img"
            aria-label={t('mapLabel')}
          >
            <div className="grid-bg absolute inset-0 opacity-60" />
            <span className="absolute left-[58%] top-[52%] size-[18px] rounded-full bg-fg" />
            <span className="pulse-dot absolute left-[calc(58%-13px)] top-[calc(52%-13px)] size-11 rounded-full border-2 border-fg" />
            <span className="mono absolute left-[calc(58%+28px)] top-[calc(52%-4px)] text-[13px] font-medium">ALBANIA</span>
            {[
              { name: 'ITALY', left: '42%', top: '40%', label: 'left-[calc(42%-40px)] top-[calc(40%-24px)]' },
              { name: 'UK', left: '24%', top: '18%', label: 'left-[24%] top-[calc(18%+18px)]' },
              { name: 'US', left: '6%', top: '30%', label: 'left-[6%] top-[calc(30%+18px)]' },
            ].map((place) => (
              <span key={place.name}>
                <span className="absolute size-2.5 rounded-full bg-[#4b524e]" style={{ left: place.left, top: place.top }} />
                <span className={`mono absolute text-xs text-t2 ${place.label}`}>{place.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
