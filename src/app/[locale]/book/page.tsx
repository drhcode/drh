import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { isAppLocale, localeLabels, routing } from '@/i18n/routing';
import { pickMessages } from '@/i18n/pick';
import { uiAvailability } from '@/i18n/availability';
import { siteConfig } from '@/config/site';
import { Check, Clock, Video } from '@/components/brand/icons';
import { PageHero } from '@/components/blocks/page-hero';
import { Booking } from '@/components/book/booking';
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
  const t = await getTranslations({ locale, namespace: 'book' });

  return buildMetadata({
    locale,
    path: '/book',
    title: t('metaTitle'),
    description: t('metaDescription'),
    available: uiAvailability(['book']),
  });
}

export default async function BookPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, tContact, messages] = await Promise.all([
    getTranslations('book'),
    getTranslations('common'),
    getTranslations('contact'),
    getMessages(),
  ]);
  const host = siteConfig.bookingHost;
  const chip = 'inline-flex items-center gap-2 rounded-full border border-ln2 px-4 py-2.5 text-sm';

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: tContact('title'), path: '/contact' },
              { name: t('crumb'), path: '/book' },
            ],
            locale,
          ),
        )}
      />

      <PageHero
        crumbs={[{ label: t('crumbRoot'), href: '/contact' }, { label: t('crumb') }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={t('heroTitle')}
        titleClassName="max-w-[980px] text-[clamp(40px,8.4vw,136px)] leading-[.92]"
        visual={
          <div className="hide-sm pointer-events-none absolute right-[6%] top-14 size-80" aria-hidden="true">
            <svg viewBox="0 0 320 320" width="320" height="320" className="absolute inset-0 overflow-visible">
              <circle cx="160" cy="160" r="150" fill="none" stroke="#2f3532" strokeWidth="1.5" />
              <circle className="drawloop" pathLength={1000} cx="160" cy="160" r="150" fill="none" stroke="#D4FF3A" strokeWidth="3" strokeLinecap="round" transform="rotate(-90 160 160)" />
              <path d="M160 22v14M160 284v14M22 160h14M284 160h14" stroke="#3a403d" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="orbit absolute left-[157px] top-[60px] h-[100px] w-1.5 origin-bottom rounded-md bg-fg" style={{ animationDuration: '60s' }} />
            <div className="orbit absolute left-[158px] top-[30px] h-[130px] w-1 origin-bottom rounded bg-lime" style={{ animationDuration: '6s' }} />
            <div className="absolute left-[148px] top-[148px] size-6 rounded-full border-[5px] border-bg bg-lime" />
          </div>
        }
      >
        <ul className="rise d2 mt-8 flex flex-wrap gap-2.5">
          <li className={chip}>
            <Clock size={16} stroke="#D4FF3A" />
            {t('chip30')}
          </li>
          <li className={chip}>
            <Video size={16} stroke="#D4FF3A" />
            {t('chipVideo')}
          </li>
          <li className={chip}>
            <Check size={16} stroke="#D4FF3A" />
            {t('chipFree')}
          </li>
          <li className={chip}>{routing.locales.map((code) => localeLabels[code].short).join(' · ')}</li>
        </ul>
      </PageHero>

      <section className="wrap flex flex-wrap items-start gap-6 pb-[120px] pt-16">
        <aside className="rise d2 flex flex-[1_1_280px] flex-col gap-4">
          <div className="rounded-3xl border border-ln bg-s1 p-7">
            <h2 className="eyebrow m-0 text-xs font-normal">{t('leaveWith')}</h2>
            <ol className="mt-[18px] flex flex-col gap-4 text-base leading-normal">
              {(['1', '2', '3'] as const).map((key) => (
                <li key={key} className="flex gap-3">
                  <span className="mono text-t3">{key.padStart(2, '0')}</span>
                  {t(`outcome${key}`)}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex items-center gap-3.5 rounded-3xl border border-ln p-5">
            {host?.photo ? (
              <Image src={host.photo} alt="" width={52} height={52} className="size-[52px] rounded-2xl object-cover" />
            ) : (
              <span aria-hidden="true" className="grid size-[52px] place-items-center rounded-2xl bg-lime text-[15px] font-bold text-ink">
                drh
              </span>
            )}
            <span>
              <span className="block font-semibold">{host?.name ?? t('host')}</span>
              {host?.role && <span className="text-sm text-t3">{host.role}</span>}
            </span>
          </div>
        </aside>

        <div className="rise d3 min-w-0 flex-[2.4_1_620px] rounded-[32px] border border-ln bg-s1 p-[clamp(24px,3vw,40px)]">
          <NextIntlClientProvider messages={pickMessages(messages, ['book', 'form'])}>
            <Booking />
          </NextIntlClientProvider>
        </div>
      </section>
    </>
  );
}
