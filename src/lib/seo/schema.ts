import type { CompanySettings } from '@/content/seed/settings';
import type { BlogPostView, FaqView, ProjectView, ServiceView } from '@/lib/data/types';
import type { AppLocale } from '@/i18n/routing';
import { publicEnv } from '@/lib/env';
import { absoluteUrl, SITE_NAME } from './metadata';
import { plainText, truncate } from '@/lib/utils';

/**
 * Structured data (spec §69).
 *
 * Only claims we can substantiate are marked up. There is deliberately no
 * AggregateRating, Review, award or certification markup anywhere in this file
 * — see spec §69 and §100. If drh.al later collects real reviews through the
 * testimonials CMS, review markup can be added from verified data.
 */

type JsonLdValue = Record<string, unknown>;

export function organizationSchema(settings: CompanySettings): JsonLdValue {
  const sameAs = Object.values(settings.social).filter(Boolean);

  return {
    '@type': 'ProfessionalService',
    '@id': `${publicEnv.siteUrl}/#organization`,
    name: settings.companyName,
    url: publicEnv.siteUrl,
    description: settings.tagline,
    email: settings.email,
    telephone: settings.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AL',
      addressLocality: settings.location,
    },
    areaServed: [
      { '@type': 'Country', name: 'Albania' },
      { '@type': 'Place', name: settings.serviceArea },
    ],
    knowsLanguage: ['en', 'sq'],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteSchema(locale: AppLocale): JsonLdValue {
  return {
    '@type': 'WebSite',
    '@id': `${publicEnv.siteUrl}/#website`,
    url: publicEnv.siteUrl,
    name: SITE_NAME,
    inLanguage: locale === 'sq' ? 'sq-AL' : 'en',
    publisher: { '@id': `${publicEnv.siteUrl}/#organization` },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
  locale: AppLocale,
): JsonLdValue {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, locale),
    })),
  };
}

export function serviceSchema(
  service: ServiceView,
  locale: AppLocale,
  settings: CompanySettings,
): JsonLdValue {
  return {
    '@type': 'Service',
    name: service.title,
    serviceType: service.title,
    description: service.shortDescription ?? service.headline ?? service.title,
    url: absoluteUrl(`/services/${service.slug}`, locale),
    provider: { '@id': `${publicEnv.siteUrl}/#organization` },
    areaServed: [
      { '@type': 'Country', name: 'Albania' },
      { '@type': 'Place', name: settings.serviceArea },
    ],
  };
}

export function articleSchema(post: BlogPostView, locale: AppLocale): JsonLdValue {
  return {
    '@type': 'Article',
    headline: truncate(post.title, 110),
    description: post.excerpt ?? truncate(plainText(post.contentHtml), 200),
    url: absoluteUrl(`/blog/${post.slug}`, locale),
    inLanguage: locale === 'sq' ? 'sq-AL' : 'en',
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    author: { '@type': 'Organization', name: post.authorName ?? SITE_NAME },
    publisher: { '@id': `${publicEnv.siteUrl}/#organization` },
    ...(post.featuredImage
      ? { image: new URL(post.featuredImage, publicEnv.siteUrl).toString() }
      : {}),
    ...(post.category ? { articleSection: post.category.title } : {}),
  };
}

export function projectSchema(project: ProjectView, locale: AppLocale): JsonLdValue {
  return {
    '@type': 'CreativeWork',
    name: `${project.clientName} — ${project.title}`,
    description: project.shortDescription ?? project.title,
    url: absoluteUrl(`/work/${project.slug}`, locale),
    inLanguage: locale === 'sq' ? 'sq-AL' : 'en',
    creator: { '@id': `${publicEnv.siteUrl}/#organization` },
    ...(project.projectDate ? { dateCreated: project.projectDate } : {}),
    ...(project.coverImage
      ? { image: new URL(project.coverImage, publicEnv.siteUrl).toString() }
      : {}),
  };
}

/**
 * FAQPage markup, but only when there are genuinely translated Q&A pairs.
 * Returns null otherwise so we never mark up fallback-language content.
 */
export function faqSchema(faqs: FaqView[]): JsonLdValue | null {
  const usable = faqs.filter((faq) => faq.hasTranslation && faq.question && faq.answer);
  if (usable.length === 0) return null;

  return {
    '@type': 'FAQPage',
    mainEntity: usable.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Wraps one or more schema objects into a single @graph document. */
export function jsonLdGraph(...nodes: (JsonLdValue | null | undefined)[]): string {
  const graph = nodes.filter(Boolean);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
