import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { LEGAL_SLUGS, LEGAL_LAST_UPDATED, getLegalDocument } from '@/content/legal';
import { getCompanySettings, getLandingPageSlugs, getPage } from '@/lib/data';
import { withHeadingAnchors } from '@/lib/content/html';
import { PageSections } from '@/components/sections/page-sections';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph, organizationSchema } from '@/lib/seo/schema';
import { formatDate } from '@/lib/utils';

/**
 * Root-level pages that live directly under `/`.
 *
 * Two kinds share this segment because Next.js allows only one dynamic slug
 * name per path level:
 *   • legal documents  — /privacy, /terms, /cookies
 *   • SEO landing pages — /web-development-albania, /seo-albania, … (spec §97)
 *
 * Static routes such as /work and /services are matched first by the router,
 * so they never reach here.
 */

interface Props {
  params: Promise<{ locale: string; pageSlug: string }>;
}

export const revalidate = 3600;

type LegalSlug = (typeof LEGAL_SLUGS)[number];
const isLegalSlug = (value: string): value is LegalSlug =>
  (LEGAL_SLUGS as string[]).includes(value);

export async function generateStaticParams() {
  const landings = await getLandingPageSlugs();
  return routing.locales.flatMap((locale) => [
    ...LEGAL_SLUGS.map((pageSlug) => ({ locale, pageSlug })),
    // Landing pages target English commercial queries and are English-only,
    // so they are generated for the default locale only.
    ...(locale === routing.defaultLocale ? landings.map((pageSlug) => ({ locale, pageSlug })) : []),
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pageSlug } = await params;
  if (!isAppLocale(locale)) return {};

  if (isLegalSlug(pageSlug)) {
    const doc = getLegalDocument(pageSlug, locale);
    return buildMetadata({
      locale,
      path: `/${pageSlug}`,
      title: `${doc.title} | drh.al`,
      description: doc.intro,
    });
  }

  const page = await getPage(locale, pageSlug);
  if (!page || page.kind !== 'landing') return {};

  return buildMetadata({
    locale,
    path: `/${pageSlug}`,
    title: seoText(page.seo.title, page.title, `${page.title} | drh.al`),
    description: seoText(page.seo.description, null, page.title),
    ogImage: page.seo.ogImage,
    canonical: page.seo.canonical,
    isIndexable: page.seo.isIndexable,
    translations: page.translations,
  });
}

export default async function RootLevelPage({ params }: Props) {
  const { locale, pageSlug } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  if (isLegalSlug(pageSlug)) return <LegalDocumentPage slug={pageSlug} locale={locale} />;

  const page = await getPage(locale, pageSlug);
  if (!page || page.kind !== 'landing') notFound();

  const settings = await getCompanySettings();

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          organizationSchema(settings),
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: page.title, path: `/${pageSlug}` },
            ],
            locale as AppLocale,
          ),
        )}
      />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

async function LegalDocumentPage({ slug, locale }: { slug: LegalSlug; locale: AppLocale }) {
  const doc = getLegalDocument(slug, locale);
  const t = await getTranslations('legal');
  const { html } = withHeadingAnchors(doc.html);

  return (
    <article>
      <header className="border-b border-border">
        <div className="container-page pb-12 pt-14 md:pt-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl leading-[1.12] md:text-5xl">{doc.title}</h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{doc.intro}</p>
            <p className="mt-6 text-sm text-subtle-foreground">
              {t('lastUpdated')}{' '}
              <time dateTime={LEGAL_LAST_UPDATED}>{formatDate(LEGAL_LAST_UPDATED, locale)}</time>
            </p>
          </div>
        </div>
      </header>

      <div className="container-page py-14 md:py-16">
        <div className="max-w-2xl">
          <div className="prose-drh" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </article>
  );
}
