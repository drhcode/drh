import type { Metadata } from 'next';
import { publicEnv } from '@/lib/env';
import { routing, type AppLocale } from '@/i18n/routing';
import type { TranslationStatus } from '@/lib/data/types';
import { truncate } from '@/lib/utils';
import { getCompanySettings } from '@/lib/data';

export const SITE_NAME = 'drh.al';

/** Absolute URL for a locale-relative path. `/` and `/sq` for the home page. */
export function absoluteUrl(path: string, locale: AppLocale = 'en'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const url = `${publicEnv.siteUrl}${prefix}${clean}`;
  // The site root needs an explicit trailing slash to be a valid canonical.
  return url === publicEnv.siteUrl ? `${url}/` : url;
}

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Locale-relative path, e.g. "/work/ersk-shpk". */
  path: string;
  locale: AppLocale;
  ogImage?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonical?: string | null;
  /**
   * False for drafts, archived content, or a page being served with fallback
   * copy because this language has no translation yet (spec §10).
   */
  isIndexable?: boolean;
  /**
   * Which languages actually have this content. Only translated languages get
   * an hreflang entry — pointing hreflang at a fallback page is worse than
   * omitting it.
   */
  translations?: TranslationStatus;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

/**
 * Async because the default social image is editable from /admin/settings.
 * Every caller already returns this straight out of an async generateMetadata,
 * so returning a promise needs no change at the call sites.
 */
export async function buildMetadata({
  title,
  description,
  path,
  locale,
  ogImage,
  ogTitle,
  ogDescription,
  canonical,
  isIndexable = true,
  translations,
  type = 'website',
  publishedTime,
  modifiedTime,
}: BuildMetadataOptions): Promise<Metadata> {
  const url = canonical ?? absoluteUrl(path, locale);

  const available = translations
    ? routing.locales.filter((code) => translations[code])
    : routing.locales;

  const languages: Record<string, string> = {};
  for (const code of available) {
    languages[code === 'en' ? 'en' : 'sq'] = absoluteUrl(path, code);
  }
  if (available.includes('en')) {
    languages['x-default'] = absoluteUrl(path, 'en');
  }

  const settings = await getCompanySettings();
  const fallbackImage = settings.defaultOgImage || '/og/default.png';
  const image = new URL(ogImage || fallbackImage, publicEnv.siteUrl).toString();

  return {
    // CMS titles already include the brand, so the root layout's
    // "%s | drh.al" template is bypassed rather than applied twice.
    title: { absolute: title },
    description: truncate(description, 300),
    alternates: {
      canonical: url,
      languages: Object.keys(languages).length > 1 ? languages : undefined,
    },
    robots: isIndexable
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : { index: false, follow: true },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      locale: locale === 'sq' ? 'sq_AL' : 'en_GB',
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle ?? title }],
      ...(type === 'article'
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [image],
    },
  };
}

/**
 * Falls back through CMS SEO fields to sensible page content, so a page is
 * never published with an empty title or description.
 */
export function seoText(
  seoValue: string | null | undefined,
  fallback: string | null | undefined,
  ultimate: string,
): string {
  return seoValue?.trim() || fallback?.trim() || ultimate;
}
