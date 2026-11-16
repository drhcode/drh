import type { MetadataRoute } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { cmsAvailability, uiAvailability } from '@/i18n/availability';
import {
  getBlogPosts,
  getIndustries,
  getPages,
  getProjects,
  getServices,
} from '@/lib/data';
import { LEGAL_SLUGS } from '@/content/legal';
import { absoluteUrl } from '@/lib/seo/metadata';

/**
 * Dynamic sitemap (spec §67).
 *
 * Excludes drafts, archived content, anything marked noindex, admin routes and
 * — importantly — locales that have no real translation, so Google is never
 * pointed at a page showing fallback-language copy.
 */

type Entry = MetadataRoute.Sitemap[number];

interface Localised {
  path: string;
  changeFrequency: Entry['changeFrequency'];
  priority: number;
  lastModified?: string | Date;
  /** Locales this content genuinely exists in. */
  locales: AppLocale[];
}

function toEntries(items: Localised[]): MetadataRoute.Sitemap {
  return items.flatMap((item) =>
    item.locales.map((locale) => ({
      url: absoluteUrl(item.path, locale),
      lastModified: item.lastModified,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
      alternates: {
        languages: Object.fromEntries(
          item.locales.map((code) => [code, absoluteUrl(item.path, code)]),
        ),
      },
    })),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /*
   * Pages whose content comes from the CMS exist in English and Albanian.
   * Italian URLs render English fallback content and are noindex until the
   * CMS holds Italian translations, so they are not listed. The code-owned
   * tools (pricing, book, audit) are listed in every locale whose interface
   * copy is fully translated.
   */
  const allLocales: AppLocale[] = cmsAvailability(null);

  const [projects, services, industries, posts, landingPages] = await Promise.all([
    getProjects('en'),
    getServices('en'),
    getIndustries('en'),
    getBlogPosts('en'),
    getPages('en', { kind: 'landing' }),
  ]);

  const staticPages: Localised[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1, locales: allLocales },
    { path: '/work', changeFrequency: 'weekly', priority: 0.9, locales: allLocales },
    { path: '/services', changeFrequency: 'monthly', priority: 0.9, locales: allLocales },
    { path: '/industries', changeFrequency: 'monthly', priority: 0.7, locales: allLocales },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7, locales: allLocales },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8, locales: allLocales },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.9, locales: allLocales },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.8, locales: uiAvailability(['pricing']) },
    { path: '/book', changeFrequency: 'monthly', priority: 0.7, locales: uiAvailability(['book']) },
    { path: '/audit', changeFrequency: 'monthly', priority: 0.7, locales: uiAvailability(['audit']) },
    ...LEGAL_SLUGS.map<Localised>((slug) => ({
      path: `/${slug}`,
      changeFrequency: 'yearly',
      priority: 0.2,
      locales: allLocales,
    })),
  ];

  const projectEntries = projects
    .filter((project) => project.seo.isIndexable)
    .map<Localised>((project) => ({
      path: `/work/${project.slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      locales: cmsAvailability(project.translations),
    }));

  const serviceEntries = services
    .filter((service) => service.seo.isIndexable)
    .map<Localised>((service) => ({
      path: `/services/${service.slug}`,
      changeFrequency: 'monthly',
      priority: 0.9,
      locales: cmsAvailability(service.translations),
    }));

  const industryEntries = industries
    .filter((industry) => industry.seo.isIndexable)
    .map<Localised>((industry) => ({
      path: `/industries/${industry.slug}`,
      changeFrequency: 'monthly',
      priority: 0.7,
      locales: cmsAvailability(industry.translations),
    }));

  const postEntries = posts
    .filter((post) => post.seo.isIndexable)
    .map<Localised>((post) => ({
      path: `/blog/${post.slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
      lastModified: post.publishedAt ?? undefined,
      locales: cmsAvailability(post.translations),
    }));

  const landingEntries = landingPages
    .filter((page) => page.seo.isIndexable)
    .map<Localised>((page) => ({
      path: `/${page.slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      locales: cmsAvailability(page.translations),
    }));

  return toEntries([
    ...staticPages,
    ...serviceEntries,
    ...projectEntries,
    ...industryEntries,
    ...postEntries,
    ...landingEntries,
  ]).filter((entry) => Boolean(entry.url));
}
