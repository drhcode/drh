import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentLanguage, isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { LEGAL_SLUGS, LEGAL_LAST_UPDATED, getLegalDocument } from '@/content/legal';
import { getCompanySettings, getLandingPageSlugs, getPage } from '@/lib/data';
import { withHeadingAnchors } from '@/lib/content/html';
import { PageSections } from '@/components/sections/page-sections';
import { TableOfContents } from '@/components/site/table-of-contents';
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
    const doc = getLegalDocument(pageSlug, contentLanguage(locale));
    return buildMetadata({
      locale,
      path: `/${pageSlug}`,
      title: `${doc.title} | drh.al`,
      description: doc.intro,
      // Legal documents exist in English and Albanian.
      available: ['en', 'sq'],
    });
  }

  const page = await getPage(contentLanguage(locale), pageSlug);
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

  const page = await getPage(contentLanguage(locale), pageSlug);
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
            locale,
          ),
        )}
      />
      <PageSections sections={page.sections} locale={contentLanguage(locale)} />
    </>
  );
}

async function LegalDocumentPage({ slug, locale }: { slug: LegalSlug; locale: AppLocale }) {
  const language = contentLanguage(locale);
  const doc = getLegalDocument(slug, language);
  const t = await getTranslations('legal');
  const { html, toc } = withHeadingAnchors(doc.html);

  return (
    <article lang={locale === language ? undefined : language}>
      <header className="grid-bg border-b border-ln">
        <div className="wrap pb-14 pt-[clamp(56px,8vw,104px)]">
          <h1 className="rise m-0 max-w-[900px] text-[clamp(44px,6.4vw,92px)] font-semibold leading-[.96] tracking-[-0.05em]">
            {doc.title}
          </h1>
          <p className="lead rise d1 mt-6 max-w-[680px]">{doc.intro}</p>
          <p className="mono rise d2 mt-6 text-xs uppercase text-t3">
            {t('lastUpdated')} <time dateTime={LEGAL_LAST_UPDATED}>{formatDate(LEGAL_LAST_UPDATED, locale)}</time>
          </p>
        </div>
      </header>

      <div className="wrap flex flex-wrap gap-16 py-20">
        {toc.length > 2 && (
          <aside className="hide-sm flex-[0_0_240px]">
            <TableOfContents entries={toc} label={doc.title} />
          </aside>
        )}
        <div className="prose-v2 min-w-0 max-w-[720px] flex-[1_1_560px] text-[17px]" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
