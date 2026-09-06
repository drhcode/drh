import type {
  ContentStatus,
  Language,
  PageSection,
  ProcessStep,
  RichPair,
} from '@/types/database';

/** Which languages have a saved translation for a piece of content (spec §10). */
export interface TranslationStatus {
  en: boolean;
  sq: boolean;
}

export interface SeoView {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
  isIndexable: boolean;
}

export interface TechnologyView {
  slug: string;
  name: string;
  iconKey: string | null;
  color: string | null;
}

export interface TaxonomyRef {
  slug: string;
  title: string;
}

export interface TestimonialView {
  id: string;
  clientName: string;
  position: string | null;
  company: string | null;
  country: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
  rating: number | null;
  quote: string;
  featured: boolean;
}

export interface GalleryItem {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface ResultMetric {
  value: string;
  label: string;
}

export interface ProjectView {
  id: string;
  slug: string;
  clientName: string;
  clientLogo: string | null;
  country: string | null;
  projectDate: string | null;
  coverImage: string | null;
  coverImageMobile: string | null;
  websiteUrl: string | null;
  featured: boolean;
  status: ContentStatus;
  industry: TaxonomyRef | null;
  title: string;
  shortDescription: string | null;
  overview: string | null;
  challenge: string | null;
  solution: string | null;
  development: string | null;
  resultsText: string | null;
  technologies: TechnologyView[];
  services: TaxonomyRef[];
  gallery: GalleryItem[];
  results: ResultMetric[];
  testimonial: TestimonialView | null;
  seo: SeoView;
  translations: TranslationStatus;
  hasTranslation: boolean;
}

export interface ServiceView {
  id: string;
  slug: string;
  iconKey: string | null;
  coverImage: string | null;
  featured: boolean;
  status: ContentStatus;
  title: string;
  headline: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  benefits: RichPair[];
  features: string[];
  process: ProcessStep[];
  ctaTitle: string | null;
  ctaBody: string | null;
  technologies: TechnologyView[];
  seo: SeoView;
  translations: TranslationStatus;
  hasTranslation: boolean;
}

export interface IndustryView {
  id: string;
  slug: string;
  iconKey: string | null;
  featured: boolean;
  status: ContentStatus;
  title: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  description: string | null;
  problems: RichPair[];
  solutions: RichPair[];
  ctaTitle: string | null;
  ctaBody: string | null;
  seo: SeoView;
  translations: TranslationStatus;
  hasTranslation: boolean;
}

export interface BlogPostView {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string | null;
  featuredImage: string | null;
  category: TaxonomyRef | null;
  authorName: string | null;
  publishedAt: string | null;
  readingTime: number;
  featured: boolean;
  status: ContentStatus;
  relatedService: TaxonomyRef | null;
  tags: TaxonomyRef[];
  seo: SeoView;
  translations: TranslationStatus;
  hasTranslation: boolean;
}

export interface FaqView {
  id: string;
  category: string;
  question: string;
  answer: string;
  /** False when the requested language has no translation — hidden from FAQ schema. */
  hasTranslation: boolean;
}

export interface PageView {
  id: string;
  slug: string;
  kind: 'system' | 'landing';
  title: string;
  sections: PageSection[];
  seo: SeoView;
  translations: TranslationStatus;
  hasTranslation: boolean;
}

export interface SearchResult {
  type: 'project' | 'service' | 'industry' | 'blog' | 'page';
  title: string;
  description: string | null;
  href: string;
}

export type { Language, PageSection, ProcessStep, RichPair };
