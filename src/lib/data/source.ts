import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import * as seed from '@/content/seed';
import type {
  FaqRow,
  Language,
  TechnologyRow,
  TestimonialRow,
} from '@/types/database';
import type { CompanySettings } from '@/content/seed/settings';
import type { RawBlogPost, RawIndustry, RawPage, RawProject, RawService } from './mappers';

/**
 * Data source.
 *
 * When Supabase is configured every read goes to PostgreSQL. When it is not —
 * a fresh clone, CI, or a local preview — reads fall back to the typed seed
 * dataset in src/content/seed so the site still renders. The fallback is
 * read-only: admin writes require a real database.
 *
 * `cache()` deduplicates identical reads within a single request.
 */

export const usingDatabase = isSupabaseConfigured;

type TitleMap = Partial<Record<Language, string>>;

interface TranslationRowLike {
  language: Language;
  title: string;
}

function titlesFrom(rows: TranslationRowLike[] | null | undefined): TitleMap {
  const map: TitleMap = {};
  for (const row of rows ?? []) map[row.language] = row.title;
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Technologies
// ─────────────────────────────────────────────────────────────────────────────
export const fetchTechnologies = cache(async (): Promise<TechnologyRow[]> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return seed.technologies.filter((t) => t.is_active);

  const { data } = await supabase
    .from('technologies')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return (data as TechnologyRow[] | null) ?? [];
});

// ─────────────────────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────────────────────
const PROJECT_SELECT = `
  *,
  project_translations(*),
  project_media(*),
  project_results(*),
  project_technologies(technologies(*)),
  project_services(services(slug, service_translations(language, title))),
  industry:industries(slug, industry_translations(language, title)),
  testimonial:testimonials!projects_testimonial_fk(*)
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToRawProject(row: any): RawProject {
  const {
    project_translations,
    project_media,
    project_results,
    project_technologies,
    project_services,
    industry,
    testimonial,
    ...project
  } = row;

  return {
    project,
    translations: project_translations ?? [],
    media: project_media ?? [],
    results: project_results ?? [],
    technologies: (project_technologies ?? [])
      .map((pt: any) => pt.technologies)
      .filter(Boolean),
    services: (project_services ?? [])
      .map((ps: any) => ps.services)
      .filter(Boolean)
      .map((s: any) => ({ slug: s.slug, titles: titlesFrom(s.service_translations) })),
    industry: industry
      ? { slug: industry.slug, titles: titlesFrom(industry.industry_translations) }
      : null,
    testimonial: (testimonial as TestimonialRow | null) ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function seedRawProjects(): RawProject[] {
  return seed.projects.map((project) => ({
    project,
    translations: seed.projectTranslations.filter((t) => t.project_id === project.id),
    media: seed.projectMedia.filter((m) => m.project_id === project.id),
    results: [],
    technologies: seed.projectTechnologies
      .filter((t) => t.project_id === project.id)
      .map((t) => seed.techBySlug(t.technology_slug)),
    services: seed.projectServices
      .filter((s) => s.project_id === project.id)
      .map((s) => ({
        slug: s.service_slug,
        titles: titlesFrom(
          seed.serviceTranslations.filter(
            (t) => t.service_id === seed.serviceIdBySlug.get(s.service_slug),
          ),
        ),
      })),
    industry: (() => {
      const industry = seed.industries.find((i) => i.id === project.industry_id);
      if (!industry) return null;
      return {
        slug: industry.slug,
        titles: titlesFrom(
          seed.industryTranslations.filter((t) => t.industry_id === industry.id),
        ),
      };
    })(),
    testimonial: null,
  }));
}

export const fetchProjects = cache(
  async (options: { includeUnpublished?: boolean } = {}): Promise<RawProject[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const rows = seedRawProjects();
      return options.includeUnpublished
        ? rows
        : rows.filter((r) => r.project.status === 'published');
    }

    let query = supabase.from('projects').select(PROJECT_SELECT);
    if (!options.includeUnpublished) query = query.eq('status', 'published');

    const { data } = await query
      .order('featured', { ascending: false })
      .order('sort_order')
      .order('project_date', { ascending: false });

    return (data ?? []).map(rowToRawProject);
  },
);

export const fetchProjectBySlug = cache(
  async (slug: string, options: { includeUnpublished?: boolean } = {}) => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return (
        seedRawProjects().find(
          (r) =>
            r.project.slug === slug &&
            (options.includeUnpublished || r.project.status === 'published'),
        ) ?? null
      );
    }

    let query = supabase.from('projects').select(PROJECT_SELECT).eq('slug', slug);
    if (!options.includeUnpublished) query = query.eq('status', 'published');

    const { data } = await query.maybeSingle();
    return data ? rowToRawProject(data) : null;
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_SELECT = `
  *,
  service_translations(*),
  service_technologies(technologies(*))
`;

function seedRawServices(): RawService[] {
  return seed.services.map((service) => ({
    service,
    translations: seed.serviceTranslations.filter((t) => t.service_id === service.id),
    technologies: seed.serviceTechnologies
      .filter((t) => t.service_id === service.id)
      .map((t) => seed.techBySlug(t.technology_slug)),
  }));
}

export const fetchServices = cache(
  async (options: { includeUnpublished?: boolean } = {}): Promise<RawService[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const rows = seedRawServices();
      return options.includeUnpublished
        ? rows
        : rows.filter((r) => r.service.status === 'published');
    }

    let query = supabase.from('services').select(SERVICE_SELECT);
    if (!options.includeUnpublished) query = query.eq('status', 'published');

    const { data } = await query.order('sort_order');
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((row: any) => {
      const { service_translations, service_technologies, ...service } = row;
      return {
        service,
        translations: service_translations ?? [],
        technologies: (service_technologies ?? [])
          .map((st: any) => st.technologies)
          .filter(Boolean),
      };
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
);

export const fetchServiceBySlug = cache(async (slug: string, options: { includeUnpublished?: boolean } = {}) => {
  const all = await fetchServices(options);
  return all.find((s) => s.service.slug === slug) ?? null;
});

// ─────────────────────────────────────────────────────────────────────────────
// Industries
// ─────────────────────────────────────────────────────────────────────────────
function seedRawIndustries(): RawIndustry[] {
  return seed.industries.map((industry) => ({
    industry,
    translations: seed.industryTranslations.filter((t) => t.industry_id === industry.id),
  }));
}

export const fetchIndustries = cache(
  async (options: { includeUnpublished?: boolean } = {}): Promise<RawIndustry[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const rows = seedRawIndustries();
      return options.includeUnpublished
        ? rows
        : rows.filter((r) => r.industry.status === 'published');
    }

    let query = supabase.from('industries').select('*, industry_translations(*)');
    if (!options.includeUnpublished) query = query.eq('status', 'published');

    const { data } = await query.order('sort_order');
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((row: any) => {
      const { industry_translations, ...industry } = row;
      return { industry, translations: industry_translations ?? [] };
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
);

export const fetchIndustryBySlug = cache(
  async (slug: string, options: { includeUnpublished?: boolean } = {}) => {
    const all = await fetchIndustries(options);
    return all.find((i) => i.industry.slug === slug) ?? null;
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Blog
// ─────────────────────────────────────────────────────────────────────────────
const BLOG_SELECT = `
  *,
  blog_translations(*),
  category:blog_categories(slug, name_en, name_sq),
  related_service:services(slug, service_translations(language, title)),
  blog_post_tags(blog_tags(slug, name_en, name_sq))
`;

function nameTitles(row: { name_en: string; name_sq: string | null }): TitleMap {
  return { en: row.name_en, sq: row.name_sq ?? undefined };
}

function seedRawBlogPosts(): RawBlogPost[] {
  return seed.blogPosts.map((post) => {
    const category = seed.blogCategories.find((c) => c.id === post.category_id) ?? null;
    const service = seed.services.find((s) => s.id === post.related_service_id) ?? null;
    return {
      post,
      translations: seed.blogTranslations.filter((t) => t.post_id === post.id),
      category: category ? { slug: category.slug, titles: nameTitles(category) } : null,
      relatedService: service
        ? {
            slug: service.slug,
            titles: titlesFrom(
              seed.serviceTranslations.filter((t) => t.service_id === service.id),
            ),
          }
        : null,
      tags: [],
    };
  });
}

export const fetchBlogPosts = cache(
  async (options: { includeUnpublished?: boolean } = {}): Promise<RawBlogPost[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const rows = seedRawBlogPosts();
      return (
        options.includeUnpublished ? rows : rows.filter((r) => r.post.status === 'published')
      ).sort(
        (a, b) =>
          new Date(b.post.published_at ?? 0).getTime() -
          new Date(a.post.published_at ?? 0).getTime(),
      );
    }

    let query = supabase.from('blog_posts').select(BLOG_SELECT);
    if (!options.includeUnpublished) {
      query = query.eq('status', 'published').lte('published_at', new Date().toISOString());
    }

    const { data } = await query.order('published_at', { ascending: false });
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((row: any) => {
      const { blog_translations, category, related_service, blog_post_tags, ...post } = row;
      return {
        post,
        translations: blog_translations ?? [],
        category: category ? { slug: category.slug, titles: nameTitles(category) } : null,
        relatedService: related_service
          ? {
              slug: related_service.slug,
              titles: titlesFrom(related_service.service_translations),
            }
          : null,
        tags: (blog_post_tags ?? [])
          .map((t: any) => t.blog_tags)
          .filter(Boolean)
          .map((t: any) => ({ slug: t.slug, titles: nameTitles(t) })),
      };
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
);

export const fetchBlogPostBySlug = cache(
  async (slug: string, options: { includeUnpublished?: boolean } = {}) => {
    const all = await fetchBlogPosts(options);
    return all.find((p) => p.post.slug === slug) ?? null;
  },
);

export const fetchBlogCategories = cache(async () => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return seed.blogCategories;
  const { data } = await supabase.from('blog_categories').select('*').order('sort_order');
  return data ?? seed.blogCategories;
});

// ─────────────────────────────────────────────────────────────────────────────
// FAQs & testimonials
// ─────────────────────────────────────────────────────────────────────────────
export const fetchFaqs = cache(
  async (options: { category?: string; serviceId?: string; industryId?: string } = {}): Promise<FaqRow[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return seed.faqs.filter(
        (f) => f.is_active && (!options.category || f.category === options.category),
      );
    }

    let query = supabase.from('faqs').select('*').eq('is_active', true);
    if (options.category) query = query.eq('category', options.category);
    if (options.serviceId) query = query.eq('service_id', options.serviceId);
    if (options.industryId) query = query.eq('industry_id', options.industryId);

    const { data } = await query.order('sort_order');
    return (data as FaqRow[] | null) ?? [];
  },
);

export const fetchTestimonials = cache(
  async (options: { featuredOnly?: boolean } = {}): Promise<TestimonialRow[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return seed.testimonials;

    let query = supabase.from('testimonials').select('*').eq('is_active', true);
    if (options.featuredOnly) query = query.eq('featured', true);

    const { data } = await query.order('sort_order');
    return (data as TestimonialRow[] | null) ?? [];
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────────────────────────────────────
function seedRawPages(): RawPage[] {
  return seed.pages.map((page) => ({
    page,
    translations: seed.pageTranslations.filter((t) => t.page_id === page.id),
  }));
}

export const fetchPages = cache(
  async (options: { kind?: 'system' | 'landing'; includeUnpublished?: boolean } = {}): Promise<RawPage[]> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return seedRawPages().filter(
        (p) =>
          (!options.kind || p.page.kind === options.kind) &&
          (options.includeUnpublished || p.page.status === 'published'),
      );
    }

    let query = supabase.from('pages').select('*, page_translations(*)');
    if (options.kind) query = query.eq('kind', options.kind);
    if (!options.includeUnpublished) query = query.eq('status', 'published');

    const { data } = await query.order('sort_order');
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((row: any) => {
      const { page_translations, ...page } = row;
      return { page, translations: page_translations ?? [] };
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
);

export const fetchPageBySlug = cache(
  async (slug: string, options: { includeUnpublished?: boolean } = {}) => {
    const all = await fetchPages(options);
    return all.find((p) => p.page.slug === slug) ?? null;
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────────────────────────────
export const fetchCompanySettings = cache(async (): Promise<CompanySettings> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return seed.defaultCompanySettings;

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'company')
    .maybeSingle();

  if (!data?.value) return seed.defaultCompanySettings;
  return { ...seed.defaultCompanySettings, ...(data.value as Partial<CompanySettings>) };
});
