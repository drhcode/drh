import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, isAppLocale } from '@/i18n/routing';
import { getCompanySettings, getFeaturedServices, getServices } from '@/lib/data';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { CookieConsent } from '@/components/site/cookie-consent';
import { AnalyticsScripts } from '@/components/site/analytics-scripts';
import { ConsentProvider } from '@/components/site/consent-provider';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  const [messages, t, settings, services, allServices] = await Promise.all([
    getMessages(),
    getTranslations('nav'),
    getCompanySettings(),
    getFeaturedServices(locale),
    getServices(locale),
  ]);

  return (
    <NextIntlClientProvider messages={messages}>
      <ConsentProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
        >
          {t('skipToContent')}
        </a>

        <div className="flex min-h-dvh flex-col">
          <SiteHeader
            featuredServices={services.map((s) => ({
              slug: s.slug,
              title: s.title,
              shortDescription: s.shortDescription,
              iconKey: s.iconKey,
            }))}
            allServices={allServices.map((s) => ({ slug: s.slug, title: s.title }))}
            branding={{
              logo: settings.logo || null,
              logoDark: settings.logoDark || null,
              companyName: settings.companyName,
            }}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter settings={settings} services={allServices.map((s) => ({ slug: s.slug, title: s.title }))} />
        </div>

        <CookieConsent />
        <AnalyticsScripts />
      </ConsentProvider>
    </NextIntlClientProvider>
  );
}
