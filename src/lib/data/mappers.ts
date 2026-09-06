import type {
  BlogPostRow,
  BlogTranslationRow,
  FaqRow,
  IndustryRow,
  IndustryTranslationRow,
  Language,
  PageRow,
  PageTranslationRow,
  ProjectMediaRow,
  ProjectResultRow,
  ProjectRow,
  ProjectTranslationRow,
  ServiceRow,
  ServiceTranslationRow,
  TechnologyRow,
  TestimonialRow,
} from '@/types/database';
import type {
  BlogPostView,
  FaqView,
  GalleryItem,
  IndustryView,
  PageView,
  ProjectView,
  ServiceView,
  TaxonomyRef,
  TechnologyView,
  TestimonialView,
  TranslationStatus,
} from './types';

/**
 * One mapping layer shared by both data sources.
 *
 * Supabase queries and the offline seed dataset both produce these `Raw*`
 * shapes, so view models are built exactly once and behave identically whether
 * or not a database is connected.
 */

export const DEFAULT_LANGUAGE: Language = 'en';

function pickTranslation<T extends { language: Language }>(
  translations: T[],
  language: Language,
): { row: T | null; isFallback: boolean } {
  const exact = translations.find((t) => t.language === language) ?? null;
  if (exact) return { row: exact, isFallback: false };
  const fallback = translations.find((t) => t.language === DEFAULT_LANGUAGE) ?? null;
  return { row: fallback, isFallback: true };
}

function statusOf(translations: { language: Language }[]): TranslationStatus {
  return {
    en: translations.some((t) => t.language === 'en'),
    sq: translations.some((t) => t.language === 'sq'),
  };
}

export function mapTechnology(row: TechnologyRow): TechnologyView {
  return { slug: row.slug, name: row.name, iconKey: row.icon_key, color: row.color };
}

export function mapTestimonial(row: TestimonialRow, language: Language): TestimonialView {
  return {
    id: row.id,
    clientName: row.client_name,
    position: row.position,
    company: row.company,
    country: row.country,
    photoUrl: row.photo_url,
    logoUrl: row.logo_url,
    rating: row.rating,
    quote: (language === 'sq' ? row.quote_sq : row.quote_en) || row.quote_en,
    featured: row.featured,
  };
}

// ─── Projects ────────────────────────────────────────────────────────────────
export interface RawProject {
  project: ProjectRow;
  translations: ProjectTranslationRow[];
  media: ProjectMediaRow[];
  results: ProjectResultRow[];
  technologies: TechnologyRow[];
  services: { slug: string; titles: Partial<Record<Language, string>> }[];
  industry: { slug: string; titles: Partial<Record<Language, string>> } | null;
  testimonial: TestimonialRow | null;
}

function resolveRef(
  ref: { slug: string; titles: Partial<Record<Language, string>> },
  language: Language,
): TaxonomyRef {
  return { slug: ref.slug, title: ref.titles[language] ?? ref.titles.en ?? ref.slug };
}

export function mapProject(raw: RawProject, language: Language): ProjectView {
  const { row, isFallback } = pickTranslation(raw.translations, language);
  const p = raw.project;

  const gallery: GalleryItem[] = [...raw.media]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      url: m.url,
      alt: (language === 'sq' ? m.alt_sq : m.alt_en) || m.alt_en || '',
      width: m.width,
      height: m.height,
    }));

  return {
    id: p.id,
    slug: p.slug,
    clientName: p.client_name,
    clientLogo: p.client_logo,
    country: p.country,
    projectDate: p.project_date,
    coverImage: p.cover_image,
    coverImageMobile: p.cover_image_mobile,
    websiteUrl: p.website_url,
    featured: p.featured,
    status: p.status,
    industry: raw.industry ? resolveRef(raw.industry, language) : null,
    title: row?.title ?? p.client_name,
    shortDescription: row?.short_description ?? null,
    overview: row?.overview ?? null,
    challenge: row?.challenge ?? null,
    solution: row?.solution ?? null,
    development: row?.development ?? null,
    resultsText: row?.results_text ?? null,
    technologies: raw.technologies.map(mapTechnology),
    services: raw.services.map((s) => resolveRef(s, language)),
    gallery,
    results: [...raw.results]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => ({
        value: r.value,
        label: (language === 'sq' ? r.label_sq : r.label_en) || r.label_en,
      })),
    testimonial: raw.testimonial ? mapTestimonial(raw.testimonial, language) : null,
    seo: {
      title: row?.seo_title ?? null,
      description: row?.seo_description ?? null,
      ogTitle: row?.og_title ?? null,
      ogDescription: row?.og_description ?? null,
      ogImage: p.og_image ?? p.cover_image,
      canonical: p.canonical_url,
      isIndexable: p.is_indexable && p.status === 'published' && !isFallback,
    },
    translations: statusOf(raw.translations),
    hasTranslation: !isFallback,
  };
}

// ─── Services ────────────────────────────────────────────────────────────────
export interface RawService {
  service: ServiceRow;
  translations: ServiceTranslationRow[];
  technologies: TechnologyRow[];
}

export function mapService(raw: RawService, language: Language): ServiceView {
  const { row, isFallback } = pickTranslation(raw.translations, language);
  const s = raw.service;
  return {
    id: s.id,
    slug: s.slug,
    iconKey: s.icon_key,
    coverImage: s.cover_image,
    featured: s.featured,
    status: s.status,
    title: row?.title ?? s.slug,
    headline: row?.headline ?? null,
    shortDescription: row?.short_description ?? null,
    fullDescription: row?.full_description ?? null,
    benefits: row?.benefits ?? [],
    features: row?.features ?? [],
    process: row?.process ?? [],
    ctaTitle: row?.cta_title ?? null,
    ctaBody: row?.cta_body ?? null,
    technologies: raw.technologies.map(mapTechnology),
    seo: {
      title: row?.seo_title ?? null,
      description: row?.seo_description ?? null,
      ogTitle: row?.og_title ?? null,
      ogDescription: row?.og_description ?? null,
      ogImage: s.cover_image,
      canonical: null,
      isIndexable: s.status === 'published' && !isFallback,
    },
    translations: statusOf(raw.translations),
    hasTranslation: !isFallback,
  };
}

// ─── Industries ──────────────────────────────────────────────────────────────
export interface RawIndustry {
  industry: IndustryRow;
  translations: IndustryTranslationRow[];
}

export function mapIndustry(raw: RawIndustry, language: Language): IndustryView {
  const { row, isFallback } = pickTranslation(raw.translations, language);
  const i = raw.industry;
  return {
    id: i.id,
    slug: i.slug,
    iconKey: i.icon_key,
    featured: i.featured,
    status: i.status,
    title: row?.title ?? i.slug,
    heroTitle: row?.hero_title ?? null,
    heroSubtitle: row?.hero_subtitle ?? null,
    description: row?.description ?? null,
    problems: row?.problems ?? [],
    solutions: row?.solutions ?? [],
    ctaTitle: row?.cta_title ?? null,
    ctaBody: row?.cta_body ?? null,
    seo: {
      title: row?.seo_title ?? null,
      description: row?.seo_description ?? null,
      ogTitle: row?.og_title ?? null,
      ogDescription: row?.og_description ?? null,
      ogImage: i.cover_image,
      canonical: null,
      isIndexable: i.status === 'published' && !isFallback,
    },
    translations: statusOf(raw.translations),
    hasTranslation: !isFallback,
  };
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export interface RawBlogPost {
  post: BlogPostRow;
  translations: BlogTranslationRow[];
  category: { slug: string; titles: Partial<Record<Language, string>> } | null;
  relatedService: { slug: string; titles: Partial<Record<Language, string>> } | null;
  tags: { slug: string; titles: Partial<Record<Language, string>> }[];
}

export function mapBlogPost(raw: RawBlogPost, language: Language): BlogPostView {
  const { row, isFallback } = pickTranslation(raw.translations, language);
  const p = raw.post;
  return {
    id: p.id,
    slug: p.slug,
    title: row?.title ?? p.slug,
    excerpt: row?.excerpt ?? null,
    contentHtml: row?.content_html ?? null,
    featuredImage: p.featured_image,
    category: raw.category ? resolveRef(raw.category, language) : null,
    authorName: p.author_name,
    publishedAt: p.published_at,
    readingTime: p.reading_time,
    featured: p.featured,
    status: p.status,
    relatedService: raw.relatedService ? resolveRef(raw.relatedService, language) : null,
    tags: raw.tags.map((t) => resolveRef(t, language)),
    seo: {
      title: row?.seo_title ?? null,
      description: row?.seo_description ?? null,
      ogTitle: row?.og_title ?? null,
      ogDescription: row?.og_description ?? null,
      ogImage: p.og_image ?? p.featured_image,
      canonical: null,
      isIndexable: p.is_indexable && p.status === 'published' && !isFallback,
    },
    translations: statusOf(raw.translations),
    hasTranslation: !isFallback,
  };
}

// ─── FAQs ────────────────────────────────────────────────────────────────────
export function mapFaq(row: FaqRow, language: Language): FaqView {
  const translated = language === 'sq' ? Boolean(row.question_sq && row.answer_sq) : true;
  return {
    id: row.id,
    category: row.category,
    question: (language === 'sq' ? row.question_sq : row.question_en) || row.question_en,
    answer: (language === 'sq' ? row.answer_sq : row.answer_en) || row.answer_en,
    hasTranslation: translated,
  };
}

// ─── Pages ───────────────────────────────────────────────────────────────────
export interface RawPage {
  page: PageRow;
  translations: PageTranslationRow[];
}

export function mapPage(raw: RawPage, language: Language): PageView {
  const { row, isFallback } = pickTranslation(raw.translations, language);
  const p = raw.page;
  return {
    id: p.id,
    slug: p.slug,
    kind: p.kind,
    title: row?.title ?? p.slug,
    sections: row?.sections ?? [],
    seo: {
      title: row?.seo_title ?? null,
      description: row?.seo_description ?? null,
      ogTitle: row?.og_title ?? null,
      ogDescription: row?.og_description ?? null,
      ogImage: p.og_image,
      canonical: p.canonical_url,
      isIndexable: p.is_indexable && p.status === 'published' && !isFallback,
    },
    translations: statusOf(raw.translations),
    hasTranslation: !isFallback,
  };
}
