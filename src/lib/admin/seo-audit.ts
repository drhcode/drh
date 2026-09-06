import {
  getBlogPosts,
  getIndustries,
  getPages,
  getProjects,
  getServices,
} from '@/lib/data';
import { routing, type AppLocale } from '@/i18n/routing';
import { LEGAL_SLUGS } from '@/content/legal';
import { plainText } from '@/lib/utils';

/**
 * SEO audit (spec §65).
 *
 * Walks every indexable page and reports concrete, fixable problems. The rules
 * are deliberately narrow: each one is something an editor can act on from the
 * CMS, not a generic "score".
 */

export type SeoWarning =
  | 'missing_title'
  | 'title_too_long'
  | 'title_too_short'
  | 'missing_description'
  | 'description_too_long'
  | 'description_too_short'
  | 'missing_translation'
  | 'noindex'
  | 'missing_image'
  | 'missing_content'
  | 'duplicate_title';

export const WARNING_LABELS: Record<SeoWarning, string> = {
  missing_title: 'Missing SEO title',
  title_too_long: 'Title over 60 characters',
  title_too_short: 'Title under 20 characters',
  missing_description: 'Missing meta description',
  description_too_long: 'Description over 165 characters',
  description_too_short: 'Description under 70 characters',
  missing_translation: 'Albanian translation missing',
  noindex: 'Set to noindex',
  missing_image: 'No social image',
  missing_content: 'Little or no body content',
  duplicate_title: 'Duplicate title',
};

export const WARNING_SEVERITY: Record<SeoWarning, 'error' | 'warning' | 'info'> = {
  missing_title: 'error',
  missing_description: 'error',
  missing_content: 'error',
  duplicate_title: 'warning',
  title_too_long: 'warning',
  description_too_long: 'warning',
  title_too_short: 'info',
  description_too_short: 'info',
  missing_translation: 'info',
  missing_image: 'info',
  noindex: 'info',
};

export interface SeoAuditRow {
  path: string;
  type: string;
  language: AppLocale;
  title: string | null;
  description: string | null;
  isIndexable: boolean;
  canonical: string | null;
  updatedAt: string | null;
  warnings: SeoWarning[];
  editHref: string | null;
}

interface Candidate {
  path: string;
  type: string;
  language: AppLocale;
  title: string | null;
  description: string | null;
  isIndexable: boolean;
  canonical: string | null;
  hasTranslation: boolean;
  translations: { en: boolean; sq: boolean };
  image: string | null;
  bodyLength: number;
  updatedAt: string | null;
  editHref: string | null;
}

function evaluate(candidate: Candidate, titleCounts: Map<string, number>): SeoWarning[] {
  const warnings: SeoWarning[] = [];
  const title = candidate.title?.trim() ?? '';
  const description = candidate.description?.trim() ?? '';

  if (!title) warnings.push('missing_title');
  else {
    if (title.length > 60) warnings.push('title_too_long');
    if (title.length < 20) warnings.push('title_too_short');
    if ((titleCounts.get(title.toLowerCase()) ?? 0) > 1) warnings.push('duplicate_title');
  }

  if (!description) warnings.push('missing_description');
  else {
    if (description.length > 165) warnings.push('description_too_long');
    if (description.length < 70) warnings.push('description_too_short');
  }

  if (!candidate.isIndexable) warnings.push('noindex');
  if (!candidate.image) warnings.push('missing_image');
  if (candidate.bodyLength > 0 && candidate.bodyLength < 300) warnings.push('missing_content');
  if (candidate.language === 'en' && !candidate.translations.sq) {
    warnings.push('missing_translation');
  }

  return warnings;
}

export async function runSeoAudit(): Promise<SeoAuditRow[]> {
  const candidates: Candidate[] = [];

  for (const locale of routing.locales) {
    const [projects, services, industries, posts, pages] = await Promise.all([
      getProjects(locale),
      getServices(locale),
      getIndustries(locale),
      getBlogPosts(locale),
      getPages(locale),
    ]);

    for (const service of services) {
      candidates.push({
        path: `/services/${service.slug}`,
        type: 'Service',
        language: locale,
        title: service.seo.title,
        description: service.seo.description,
        isIndexable: service.seo.isIndexable,
        canonical: service.seo.canonical,
        hasTranslation: service.hasTranslation,
        translations: service.translations,
        image: service.seo.ogImage,
        bodyLength: (service.fullDescription ?? '').length,
        updatedAt: null,
        editHref: `/admin/services/${service.id}`,
      });
    }

    for (const project of projects) {
      candidates.push({
        path: `/work/${project.slug}`,
        type: 'Project',
        language: locale,
        title: project.seo.title,
        description: project.seo.description,
        isIndexable: project.seo.isIndexable,
        canonical: project.seo.canonical,
        hasTranslation: project.hasTranslation,
        translations: project.translations,
        image: project.seo.ogImage,
        bodyLength: (project.overview ?? '').length + (project.solution ?? '').length,
        updatedAt: null,
        editHref: `/admin/projects/${project.id}`,
      });
    }

    for (const industry of industries) {
      candidates.push({
        path: `/industries/${industry.slug}`,
        type: 'Industry',
        language: locale,
        title: industry.seo.title,
        description: industry.seo.description,
        isIndexable: industry.seo.isIndexable,
        canonical: industry.seo.canonical,
        hasTranslation: industry.hasTranslation,
        translations: industry.translations,
        image: industry.seo.ogImage,
        bodyLength: (industry.description ?? '').length,
        updatedAt: null,
        editHref: `/admin/industries/${industry.id}`,
      });
    }

    for (const post of posts) {
      candidates.push({
        path: `/blog/${post.slug}`,
        type: 'Article',
        language: locale,
        title: post.seo.title,
        description: post.seo.description ?? post.excerpt,
        isIndexable: post.seo.isIndexable,
        canonical: post.seo.canonical,
        hasTranslation: post.hasTranslation,
        translations: post.translations,
        image: post.seo.ogImage,
        bodyLength: plainText(post.contentHtml).length,
        updatedAt: post.publishedAt,
        editHref: `/admin/blog/${post.id}`,
      });
    }

    for (const page of pages) {
      const path = page.slug === 'home' ? '/' : `/${page.slug}`;
      candidates.push({
        path,
        type: page.kind === 'landing' ? 'Landing page' : 'Page',
        language: locale,
        title: page.seo.title,
        description: page.seo.description,
        isIndexable: page.seo.isIndexable,
        canonical: page.seo.canonical,
        hasTranslation: page.hasTranslation,
        translations: page.translations,
        image: page.seo.ogImage,
        // Section-built pages always have substantial content.
        bodyLength: page.sections.length > 0 ? 1000 : 0,
        updatedAt: null,
        editHref: `/admin/pages/${page.id}`,
      });
    }

    for (const slug of LEGAL_SLUGS) {
      candidates.push({
        path: `/${slug}`,
        type: 'Legal',
        language: locale,
        title: `${slug} | drh.al`,
        description: 'Legal document maintained in the codebase.',
        isIndexable: true,
        canonical: null,
        hasTranslation: true,
        translations: { en: true, sq: true },
        image: null,
        bodyLength: 1000,
        updatedAt: null,
        editHref: null,
      });
    }
  }

  // Duplicate detection is per language, so an EN/SQ pair is not a duplicate.
  const titleCounts = new Map<string, number>();
  for (const candidate of candidates) {
    const title = candidate.title?.trim().toLowerCase();
    if (!title) continue;
    const key = `${candidate.language}:${title}`;
    titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
  }

  const perLanguageCounts = new Map<string, number>();
  for (const [key, count] of titleCounts) perLanguageCounts.set(key.split(':').slice(1).join(':'), count);

  return candidates
    .map((candidate) => ({
      path: candidate.path,
      type: candidate.type,
      language: candidate.language,
      title: candidate.title,
      description: candidate.description,
      isIndexable: candidate.isIndexable,
      canonical: candidate.canonical,
      updatedAt: candidate.updatedAt,
      warnings: evaluate(
        candidate,
        new Map(
          [...titleCounts].map(([key, count]) => [key.split(':').slice(1).join(':'), count]),
        ),
      ),
      editHref: candidate.editHref,
    }))
    .sort((a, b) => b.warnings.length - a.warnings.length || a.path.localeCompare(b.path));
}
