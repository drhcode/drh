import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, Globe2, Mail, MessageCircle, Phone } from 'lucide-react';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getCompanySettings, getFaqs, getPage } from '@/lib/data';
import { ProjectInquiryForm } from '@/components/forms/project-inquiry-form';
import { EmailLink, PhoneLink, WhatsAppLink } from '@/components/site/contact-links';
import { FaqSection } from '@/components/sections/faq-section';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, jsonLdGraph, organizationSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const [page, t] = await Promise.all([
    getPage(locale, 'contact'),
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

  const [t, tFaq, settings, faqs] = await Promise.all([
    getTranslations('contact'),
    getTranslations('services'),
    getCompanySettings(),
    getFaqs(locale, { category: 'general' }),
  ]);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/contact' },
            ],
            locale as AppLocale,
          ),
          faqSchema(faqs),
        )}
      />

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Intro + contact details */}
          <div className="lg:col-span-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-accent">
              {t('title')}
            </p>
            <h1 className="text-balance text-4xl leading-[1.1] md:text-5xl">{t('heroTitle')}</h1>

            <div className="mt-6 space-y-4">
              {t('heroDescription')
                .split(/\n{2,}/)
                .map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
            </div>

            <div className="mt-10 rounded-xl border border-border bg-surface p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-subtle-foreground">
                {t('detailsTitle')}
              </h2>
              <ul className="mt-5 space-y-4 text-[0.9375rem]">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <EmailLink email={settings.email} className="text-foreground" />
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <PhoneLink
                    phone={settings.phone}
                    display={settings.phoneDisplay}
                    className="text-foreground"
                  />
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <WhatsAppLink
                    number={settings.whatsapp}
                    label={t('whatsappCta')}
                    className="text-foreground"
                  />
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Globe2 className="mt-0.5 size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
                  <span>
                    {settings.location} · {settings.serviceArea}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Clock className="mt-0.5 size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
                  <span>{t('responseTime')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
              <ProjectInquiryForm />
            </div>
          </div>
        </div>
      </div>

      <FaqSection title={tFaq('faq')} faqs={faqs} />
    </>
  );
}
