import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getCompanySettings, getPage } from '@/lib/data';
import { PageSections } from '@/components/sections/page-sections';
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

  const page = await getPage(locale, 'about');

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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [page, settings] = await Promise.all([getPage(locale, 'about'), getCompanySettings()]);
  if (!page) notFound();

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: page.title, path: '/about' },
            ],
            locale as AppLocale,
          ),
        )}
      />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}
