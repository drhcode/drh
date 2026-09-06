import type { Language } from '@/types/database';
import {
  fetchBlogPostBySlug,
  fetchBlogPosts,
  fetchBlogCategories,
  fetchCompanySettings,
  fetchFaqs,
  fetchIndustries,
  fetchIndustryBySlug,
  fetchPageBySlug,
  fetchPages,
  fetchProjectBySlug,
  fetchProjects,
  fetchServiceBySlug,
  fetchServices,
  fetchTechnologies,
  fetchTestimonials,
  usingDatabase,
} from './source';
import {
  mapBlogPost,
  mapFaq,
  mapIndustry,
  mapPage,
  mapProject,
  mapService,
  mapTechnology,
  mapTestimonial,
} from './mappers';
import type {
  BlogPostView,
  FaqView,
  IndustryView,
  PageView,
  ProjectView,
  SearchResult,
  ServiceView,
  TechnologyView,
  TestimonialView,
} from './types';

export * from './types';
export { usingDatabase };

interface ReadOptions {
  includeUnpublished?: boolean;
}

// ─── Projects ────────────────────────────────────────────────────────────────
export async function getProjects(
  locale: Language,
  options: ReadOptions = {},
): Promise<ProjectView[]> {
  const raw = await fetchProjects(options);
  return raw.map((r) => mapProject(r, locale));
}

export async function getFeaturedProjects(
  locale: Language,
  limit = 3,
): Promise<ProjectView[]> {
  const all = await getProjects(locale);
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getProject(
  locale: Language,
  slug: string,
  options: ReadOptions = {},
): Promise<ProjectView | null> {
  const raw = await fetchProjectBySlug(slug, options);
  return raw ? mapProject(raw, locale) : null;
}

/** Wraps around so the last project links to the first (spec §24). */
export async function getAdjacentProject(
  locale: Language,
  slug: string,
): Promise<ProjectView | null> {
  const all = await getProjects(locale);
  if (all.length < 2) return null;
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return all[(index + 1) % all.length];
}

export async function getProjectsByService(
  locale: Language,
  serviceSlug: string,
  limit = 3,
): Promise<ProjectView[]> {
  const all = await getProjects(locale);
  return all.filter((p) => p.services.some((s) => s.slug === serviceSlug)).slice(0, limit);
}

export async function getProjectsByIndustry(
  locale: Language,
  industrySlug: string,
  limit = 3,
): Promise<ProjectView[]> {
  const all = await getProjects(locale);
  return all.filter((p) => p.industry?.slug === industrySlug).slice(0, limit);
}

// ─── Services ────────────────────────────────────────────────────────────────
export async function getServices(
  locale: Language,
  options: ReadOptions = {},
): Promise<ServiceView[]> {
  const raw = await fetchServices(options);
  return raw.map((r) => mapService(r, locale));
}

export async function getFeaturedServices(locale: Language): Promise<ServiceView[]> {
  const all = await getServices(locale);
  const featured = all.filter((s) => s.featured);
  return featured.length > 0 ? featured : all.slice(0, 6);
}

export async function getService(
  locale: Language,
  slug: string,
  options: ReadOptions = {},
): Promise<ServiceView | null> {
  const raw = await fetchServiceBySlug(slug, options);
  return raw ? mapService(raw, locale) : null;
}

// ─── Industries ──────────────────────────────────────────────────────────────
export async function getIndustries(
  locale: Language,
  options: ReadOptions = {},
): Promise<IndustryView[]> {
  const raw = await fetchIndustries(options);
  return raw.map((r) => mapIndustry(r, locale));
}

export async function getIndustry(
  locale: Language,
  slug: string,
  options: ReadOptions = {},
): Promise<IndustryView | null> {
  const raw = await fetchIndustryBySlug(slug, options);
  return raw ? mapIndustry(raw, locale) : null;
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export async function getBlogPosts(
  locale: Language,
  options: ReadOptions & { category?: string; tag?: string; query?: string } = {},
): Promise<BlogPostView[]> {
  const raw = await fetchBlogPosts(options);
  let posts = raw.map((r) => mapBlogPost(r, locale));

  if (options.category) posts = posts.filter((p) => p.category?.slug === options.category);
  if (options.tag) posts = posts.filter((p) => p.tags.some((t) => t.slug === options.tag));
  if (options.query) {
    const needle = options.query.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        (p.excerpt ?? '').toLowerCase().includes(needle),
    );
  }
  return posts;
}

export async function getBlogPost(
  locale: Language,
  slug: string,
  options: ReadOptions = {},
): Promise<BlogPostView | null> {
  const raw = await fetchBlogPostBySlug(slug, options);
  return raw ? mapBlogPost(raw, locale) : null;
}

export async function getRelatedBlogPosts(
  locale: Language,
  post: BlogPostView,
  limit = 3,
): Promise<BlogPostView[]> {
  const all = await getBlogPosts(locale);
  const others = all.filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter((p) => p.category?.slug === post.category?.slug);
  return [...sameCategory, ...others.filter((p) => !sameCategory.includes(p))].slice(0, limit);
}

export async function getBlogCategories(locale: Language) {
  const rows = await fetchBlogCategories();
  return rows.map((c) => ({
    slug: c.slug,
    title: (locale === 'sq' ? c.name_sq : c.name_en) || c.name_en,
  }));
}

// ─── FAQs, testimonials, technologies ────────────────────────────────────────
export async function getFaqs(
  locale: Language,
  options: { category?: string; serviceId?: string; industryId?: string } = {},
): Promise<FaqView[]> {
  const rows = await fetchFaqs(options);
  return rows.map((r) => mapFaq(r, locale));
}

export async function getTestimonials(
  locale: Language,
  options: { featuredOnly?: boolean } = {},
): Promise<TestimonialView[]> {
  const rows = await fetchTestimonials(options);
  return rows.map((r) => mapTestimonial(r, locale));
}

export async function getTechnologies(): Promise<TechnologyView[]> {
  const rows = await fetchTechnologies();
  return rows.map(mapTechnology);
}

// ─── Pages ───────────────────────────────────────────────────────────────────
export async function getPage(
  locale: Language,
  slug: string,
  options: ReadOptions = {},
): Promise<PageView | null> {
  const raw = await fetchPageBySlug(slug, options);
  return raw ? mapPage(raw, locale) : null;
}

export async function getPages(
  locale: Language,
  options: ReadOptions & { kind?: 'system' | 'landing' } = {},
): Promise<PageView[]> {
  const raw = await fetchPages(options);
  return raw.map((r) => mapPage(r, locale));
}

export async function getLandingPageSlugs(): Promise<string[]> {
  const raw = await fetchPages({ kind: 'landing' });
  return raw.map((r) => r.page.slug);
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const getCompanySettings = fetchCompanySettings;

// ─── Site-wide search (spec §71) ─────────────────────────────────────────────
export async function getSearchIndex(locale: Language): Promise<SearchResult[]> {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const [projects, services, industries, posts] = await Promise.all([
    getProjects(locale),
    getServices(locale),
    getIndustries(locale),
    getBlogPosts(locale),
  ]);

  return [
    ...services.map<SearchResult>((s) => ({
      type: 'service',
      title: s.title,
      description: s.shortDescription,
      href: `${prefix}/services/${s.slug}`,
    })),
    ...projects.map<SearchResult>((p) => ({
      type: 'project',
      title: `${p.clientName} — ${p.title}`,
      description: p.shortDescription,
      href: `${prefix}/work/${p.slug}`,
    })),
    ...industries.map<SearchResult>((i) => ({
      type: 'industry',
      title: i.title,
      description: i.description,
      href: `${prefix}/industries/${i.slug}`,
    })),
    ...posts.map<SearchResult>((p) => ({
      type: 'blog',
      title: p.title,
      description: p.excerpt,
      href: `${prefix}/blog/${p.slug}`,
    })),
  ];
}
