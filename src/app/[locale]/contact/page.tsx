import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { pickMessages } from '@/i18n/pick';
import { getCompanySettings, getPage } from '@/lib/data';
import { Accent } from '@/components/brand/accent';
import { HeroFx } from '@/components/fx/pointer-fx';
import { ProjectInquiryForm } from '@/components/forms/project-inquiry-form';
import { TrackedLink } from '@/components/site/tracked-link';
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

  const [page, t] = await Promise.all([
    getPage(contentLanguage(locale), 'contact'),
    getTranslations({ locale, namespace: 'contact' }),
  ]);

  return buildMetadata({
    locale,
    path: '/contact',
    title: seoText(page?.seo.title, null, `${t('title')} | drh.al`),
    description: seoText(
      page?.seo.description,
      null,
      'Tell us about your project. drh.al replies within 24 hours with recommended next steps.',
    ),
    translations: page?.translations,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, tFooter, messages, settings] = await Promise.all([
    getTranslations('contact'),
    getTranslations('common'),
    getTranslations('footer'),
    getMessages(),
    getCompanySettings(),
  ]);

  const path = 'M10 250 C 140 250, 160 60, 300 90 S 480 230, 550 30';
  const card = 'card block rounded-[22px] border border-ln p-6 text-fg';

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('title'), path: '/contact' },
            ],
            locale,
          ),
        )}
      />

      <HeroFx className="grid-bg border-b border-ln">
        <div className="hide-sm pointer-events-none absolute right-[4%] top-12 h-[280px] w-[560px]" aria-hidden="true">
          <svg viewBox="0 0 560 280" width="560" height="280" className="absolute inset-0 overflow-visible">
            <path className="flow" d={path} fill="none" stroke="#3a403d" strokeWidth="2" />
            <circle cx="10" cy="250" r="5" fill="#8F9893" />
            <circle className="glow" cx="550" cy="30" r="22" fill="#D4FF3A" fillOpacity=".2" />
            <circle cx="550" cy="30" r="9" fill="#D4FF3A" />
            <text x="472" y="72" className="mono" style={{ fontSize: 11, fontWeight: 500, fill: 'var(--t3)', letterSpacing: 1 }}>
              {t('inbox')}
            </text>
          </svg>
          <div className="fly absolute left-0 top-0 size-9 text-acct" style={{ offsetPath: `path('${path}')`, offsetRotate: 'auto 45deg' }}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </div>
        </div>
        <div className="wrap relative pb-16 pt-[clamp(56px,8vw,104px)]">
          <p className="rise inline-flex items-center gap-2.5 rounded-full border border-ln2 py-2 pl-3 pr-4 text-sm text-t1">
            <span className="pulse-dot size-2 rounded-full bg-lime" aria-hidden="true" />
            {t('responseTime')}
          </p>
          <h1 className="h-hero rise-t d1 mt-7">
            <Accent text={t('v2Title')} />
          </h1>
        </div>
      </HeroFx>

      <section className="wrap flex flex-wrap items-start gap-10 pb-[120px] pt-16">
        <aside className="rise d2 flex flex-[1_1_300px] flex-col gap-3">
          <Link href="/book" className="card on-lime block rounded-[22px] border border-lime bg-lime p-6 text-ink">
            <span className="mono text-xs tracking-[.08em]">{t('preferTalk')}</span>
            <span className="mt-2 block text-[22px] font-semibold tracking-[-0.02em]">{t('bookCallCard')} →</span>
          </Link>
          <TrackedLink href={`mailto:${settings.email}`} event="email" className={card}>
            <span className="label">{tCommon('email')}</span>
            <span className="mt-2 block text-[22px] font-semibold">{settings.email}</span>
          </TrackedLink>
          <TrackedLink href={`https://wa.me/${settings.whatsapp}`} event="whatsapp" external className={card}>
            <span className="label">{tCommon('whatsapp')}</span>
            <span className="mt-2 block text-[22px] font-semibold">{t('chatWithUs')}</span>
          </TrackedLink>
          <TrackedLink href={`tel:${settings.phone}`} event="phone" className={card}>
            <span className="label">{tCommon('phone')}</span>
            <span className="mt-2 block text-[22px] font-semibold">{settings.phoneDisplay}</span>
          </TrackedLink>
          <div className="rounded-[22px] bg-s1 p-6">
            <span className="label">{tCommon('location')}</span>
            <span className="mt-2 block text-[22px] font-semibold">{tFooter('location')}</span>
          </div>
        </aside>

        <div className="rise d3 min-w-0 flex-[2.2_1_560px] rounded-[32px] border border-ln bg-s1 p-[clamp(24px,4vw,48px)]">
          <NextIntlClientProvider messages={pickMessages(messages, ['form', 'contactForm'])}>
            <ProjectInquiryForm email={settings.email} />
          </NextIntlClientProvider>
        </div>
      </section>
    </>
  );
}
