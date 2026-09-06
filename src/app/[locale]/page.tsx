import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isAppLocale, type AppLocale } from '@/i18n/routing';
import { getCompanySettings, getFaqs, getPage } from '@/lib/data';
import { PageSections } from '@/components/sections/page-sections';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { faqSchema, jsonLdGraph, organizationSchema, websiteSchema } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const page = await getPage(locale, 'home');

  return buildMetadata({
    locale,
    path: '/',
    title: seoText(
      page?.seo.title,
      null,
      'Web Development Albania | Websites, Apps & SEO | drh.al',
    ),
    description: seoText(
      page?.seo.description,
      null,
      'drh.al is a web development agency in Albania building high-performance websites, web apps and mobile apps with SEO and digital marketing for businesses worldwide.',
    ),
    ogImage: page?.seo.ogImage,
    translations: page?.translations,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [page, settings, faqs] = await Promise.all([
    getPage(locale, 'home'),
    getCompanySettings(),
    getFaqs(locale, { category: 'general' }),
  ]);

  if (!page) notFound();

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          websiteSchema(locale as AppLocale),
          faqSchema(faqs),
        )}
      />
      <PageSections sections={page.sections} locale={locale} signature />
    </>
  );
}
