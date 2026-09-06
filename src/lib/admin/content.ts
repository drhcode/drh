import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type {
  BlogCategoryRow,
  BlogPostRow,
  BlogTranslationRow,
  FaqRow,
  IndustryRow,
  IndustryTranslationRow,
  MediaRow,
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

/**
 * Admin-side content reads.
 *
 * Unlike the public data layer these return every status (draft, archived) and
 * both translations regardless of completeness, because that is exactly what an
 * editor needs to see. Callers must already have passed a capability check.
 */

export interface AdminProject {
  project: ProjectRow;
  translations: ProjectTranslationRow[];
  media: ProjectMediaRow[];
  results: ProjectResultRow[];
  technologySlugs: string[];
  serviceSlugs: string[];
}

const PROJECT_SELECT = `
  *,
  project_translations(*),
  project_media(*),
  project_results(*),
  project_technologies(technologies(slug)),
  project_services(services(slug))
`;

export async function listAdminProjects(): Promise<
  (ProjectRow & { translations: ProjectTranslationRow[]; industrySlug: string | null })[]
> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('projects')
    .select('*, project_translations(language, title, is_complete), industries(slug)')
    .order('sort_order')
    .order('created_at', { ascending: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const { project_translations, industries, ...project } = row;
    return {
      ...(project as ProjectRow),
      translations: (project_translations ?? []) as ProjectTranslationRow[],
      industrySlug: industries?.slug ?? null,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getAdminProject(id: string): Promise<AdminProject | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase.from('projects').select(PROJECT_SELECT).eq('id', id).maybeSingle();
  if (!data) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const row = data as any;
  return {
    project: row as ProjectRow,
    translations: (row.project_translations ?? []) as ProjectTranslationRow[],
    media: ((row.project_media ?? []) as ProjectMediaRow[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    results: ((row.project_results ?? []) as ProjectResultRow[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    technologySlugs: (row.project_technologies ?? [])
      .map((item: any) => item.technologies?.slug)
      .filter(Boolean),
    serviceSlugs: (row.project_services ?? [])
      .map((item: any) => item.services?.slug)
      .filter(Boolean),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Reference lists used to populate editor selects. */
export async function getEditorReferences(): Promise<{
  technologies: TechnologyRow[];
  services: (ServiceRow & { title: string })[];
  industries: (IndustryRow & { title: string })[];
  testimonials: TestimonialRow[];
  categories: BlogCategoryRow[];
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { technologies: [], services: [], industries: [], testimonials: [], categories: [] };
  }

  const [tech, services, industries, testimonials, categories] = await Promise.all([
    supabase.from('technologies').select('*').order('sort_order'),
    supabase.from('services').select('*, service_translations(language, title)').order('sort_order'),
    supabase
      .from('industries')
      .select('*, industry_translations(language, title)')
      .order('sort_order'),
    supabase.from('testimonials').select('*').order('sort_order'),
    supabase.from('blog_categories').select('*').order('sort_order'),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const titleOf = (translations: any[]): string =>
    translations?.find((t) => t.language === 'en')?.title ?? translations?.[0]?.title ?? '';

  return {
    technologies: (tech.data as TechnologyRow[] | null) ?? [],
    services: ((services.data ?? []) as any[]).map((row) => ({
      ...(row as ServiceRow),
      title: titleOf(row.service_translations) || row.slug,
    })),
    industries: ((industries.data ?? []) as any[]).map((row) => ({
      ...(row as IndustryRow),
      title: titleOf(row.industry_translations) || row.slug,
    })),
    testimonials: (testimonials.data as TestimonialRow[] | null) ?? [],
    categories: (categories.data as BlogCategoryRow[] | null) ?? [],
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export interface AdminBlogPost {
  post: BlogPostRow;
  translations: BlogTranslationRow[];
}

export async function listAdminBlogPosts(): Promise<
  (BlogPostRow & { translations: BlogTranslationRow[]; categorySlug: string | null })[]
> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_translations(language, title, is_complete), blog_categories(slug, name_en)')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const { blog_translations, blog_categories, ...post } = row;
    return {
      ...(post as BlogPostRow),
      translations: (blog_translations ?? []) as BlogTranslationRow[],
      categorySlug: blog_categories?.name_en ?? null,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getAdminBlogPost(id: string): Promise<AdminBlogPost | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_translations(*)')
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const row = data as any;
  const { blog_translations, ...post } = row;
  return { post: post as BlogPostRow, translations: (blog_translations ?? []) as BlogTranslationRow[] };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// ─── Services & industries ───────────────────────────────────────────────────
export async function listAdminServices(): Promise<
  (ServiceRow & { translations: ServiceTranslationRow[] })[]
> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('services')
    .select('*, service_translations(*)')
    .order('sort_order');

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const { service_translations, ...service } = row;
    return { ...(service as ServiceRow), translations: (service_translations ?? []) as ServiceTranslationRow[] };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getAdminService(id: string) {
  const services = await listAdminServices();
  return services.find((service) => service.id === id) ?? null;
}

export async function listAdminIndustries(): Promise<
  (IndustryRow & { translations: IndustryTranslationRow[] })[]
> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('industries')
    .select('*, industry_translations(*)')
    .order('sort_order');

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const { industry_translations, ...industry } = row;
    return {
      ...(industry as IndustryRow),
      translations: (industry_translations ?? []) as IndustryTranslationRow[],
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getAdminIndustry(id: string) {
  const industries = await listAdminIndustries();
  return industries.find((industry) => industry.id === id) ?? null;
}

// ─── Simple tables ───────────────────────────────────────────────────────────
export async function listTestimonials(): Promise<TestimonialRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from('testimonials').select('*').order('sort_order');
  return (data as TestimonialRow[] | null) ?? [];
}

export async function getTestimonial(id: string): Promise<TestimonialRow | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from('testimonials').select('*').eq('id', id).maybeSingle();
  return (data as TestimonialRow | null) ?? null;
}

export async function listFaqs(): Promise<FaqRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from('faqs').select('*').order('category').order('sort_order');
  return (data as FaqRow[] | null) ?? [];
}

export async function listAdminMedia(folder?: string): Promise<MediaRow[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase.from('media').select('*');
  if (folder && folder !== 'all') query = query.eq('folder', folder);

  const { data } = await query.order('created_at', { ascending: false }).limit(200);
  return (data as MediaRow[] | null) ?? [];
}

// ─── Pages ───────────────────────────────────────────────────────────────────
export async function listAdminPages(): Promise<
  (PageRow & { translations: PageTranslationRow[] })[]
> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('pages')
    .select('*, page_translations(*)')
    .order('kind')
    .order('sort_order');

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const { page_translations, ...page } = row;
    return { ...(page as PageRow), translations: (page_translations ?? []) as PageTranslationRow[] };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getAdminPage(id: string) {
  const pages = await listAdminPages();
  return pages.find((page) => page.id === id) ?? null;
}

/** Convenience: pick a translation, or an empty shell for the editor. */
export function translationFor<T extends { language: string }>(
  translations: T[],
  language: 'en' | 'sq',
): T | undefined {
  return translations.find((translation) => translation.language === language);
}

export function translationStatus(translations: { language: string }[]): {
  en: boolean;
  sq: boolean;
} {
  return {
    en: translations.some((t) => t.language === 'en'),
    sq: translations.some((t) => t.language === 'sq'),
  };
}
