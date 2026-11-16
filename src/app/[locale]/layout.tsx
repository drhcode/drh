import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing, isAppLocale, contentLanguage, localeLabels } from '@/i18n/routing';
import { Document, rootMetadata } from '@/components/document';
import { pickMessages } from '@/i18n/pick';
import { getCompanySettings, getServices } from '@/lib/data';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { FloatingDock } from '@/components/site/floating-dock';
import { PageCurtain } from '@/components/site/page-curtain';
import { CookieConsent } from '@/components/site/cookie-consent';
import { AnalyticsScripts } from '@/components/site/analytics-scripts';
import { ConsentProvider } from '@/components/site/consent-provider';
import '@/styles/site.css';

export { viewport } from '@/components/document';

export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata();
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Namespaces every page's client components need. Page-specific client
 * components (forms, estimator, booking) get their own provider, so the full
 * catalogue is never serialised into every page.
 */
const SHELL_NAMESPACES = ['nav', 'newsletter', 'footer', 'cookies', 'search', 'common', 'error'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  setRequestLocale(locale);

  const [messages, t, settings, services] = await Promise.all([
    getMessages(),
    getTranslations('nav'),
    getCompanySettings(),
    getServices(contentLanguage(locale)),
  ]);

  return (
    <Document lang={localeLabels[locale].htmlLang}>
    <NextIntlClientProvider messages={pickMessages(messages, SHELL_NAMESPACES)}>
      <ConsentProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-300 focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:font-semibold focus:text-ink"
        >
          {t('skipToContent')}
        </a>

        <div className="site-v2 relative flex min-h-dvh flex-col overflow-x-clip">
          <PageCurtain />
          <SiteHeader />
          <main id="main" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter settings={settings} services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
          <FloatingDock whatsapp={settings.whatsapp} />
        </div>

        <CookieConsent />
        <AnalyticsScripts />
      </ConsentProvider>
    </NextIntlClientProvider>
    </Document>
  );
}
