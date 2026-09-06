/**
 * Hand-authored types mirroring supabase/migrations/0001_schema.sql.
 *
 * Kept in this repo rather than generated so the app type-checks without a live
 * database. After schema changes, run:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 * and re-export the aliases at the bottom.
 */

export type Language = 'en' | 'sq';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'marketing';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'won'
  | 'lost';
export type MediaKind = 'image' | 'video' | 'document';
export type SubscriberStatus = 'pending' | 'subscribed' | 'unsubscribed';

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TechnologyRow {
  id: string;
  slug: string;
  name: string;
  icon_key: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface IndustryRow {
  id: string;
  slug: string;
  icon_key: string | null;
  cover_image: string | null;
  status: ContentStatus;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface RichPair {
  title: string;
  body: string;
}

export interface IndustryTranslationRow {
  id?: string;
  industry_id: string;
  language: Language;
  title: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  description: string | null;
  problems: RichPair[];
  solutions: RichPair[];
  cta_title: string | null;
  cta_body: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title?: string | null;
  og_description?: string | null;
  is_complete: boolean;
}

export interface ServiceRow {
  id: string;
  slug: string;
  icon_key: string | null;
  cover_image: string | null;
  status: ContentStatus;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  body: string;
}

export interface ServiceTranslationRow {
  id?: string;
  service_id: string;
  language: Language;
  title: string;
  headline: string | null;
  short_description: string | null;
  full_description: string | null;
  benefits: RichPair[];
  features: string[];
  process: ProcessStep[];
  cta_title: string | null;
  cta_body: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title?: string | null;
  og_description?: string | null;
  is_complete: boolean;
}

export interface ProjectRow {
  id: string;
  slug: string;
  client_name: string;
  client_logo: string | null;
  industry_id: string | null;
  country: string | null;
  project_date: string | null;
  cover_image: string | null;
  cover_image_mobile: string | null;
  og_image: string | null;
  canonical_url: string | null;
  website_url: string | null;
  featured: boolean;
  status: ContentStatus;
  is_indexable: boolean;
  sort_order: number;
  testimonial_id: string | null;
  view_count: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
}

export interface ProjectTranslationRow {
  id?: string;
  project_id: string;
  language: Language;
  title: string;
  short_description: string | null;
  overview: string | null;
  challenge: string | null;
  solution: string | null;
  development: string | null;
  results_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title?: string | null;
  og_description?: string | null;
  is_complete: boolean;
}

export interface ProjectMediaRow {
  id: string;
  project_id: string;
  media_id: string | null;
  url: string;
  alt_en: string | null;
  alt_sq: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export interface ProjectResultRow {
  id: string;
  project_id: string;
  value: string;
  label_en: string;
  label_sq: string | null;
  sort_order: number;
}

export interface BlogCategoryRow {
  id: string;
  slug: string;
  name_en: string;
  name_sq: string | null;
  sort_order: number;
}

export interface BlogTagRow {
  id: string;
  slug: string;
  name_en: string;
  name_sq: string | null;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  category_id: string | null;
  author_id: string | null;
  author_name: string | null;
  featured_image: string | null;
  og_image: string | null;
  status: ContentStatus;
  featured: boolean;
  is_indexable: boolean;
  published_at: string | null;
  reading_time: number;
  view_count: number;
  related_service_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogTranslationRow {
  id?: string;
  post_id: string;
  language: Language;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title?: string | null;
  og_description?: string | null;
  is_complete: boolean;
}

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string | null;
  attachment_url: string | null;
  status: LeadStatus;
  estimated_value: number | null;
  won_value: number | null;
  language: Language;
  source: string | null;
  source_page: string | null;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  first_touch: Record<string, string | null> | null;
  country: string | null;
  city: string | null;
  device: string | null;
  is_archived: boolean;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNoteRow {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  created_at: string;
}

export interface LeadActivityRow {
  id: string;
  lead_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  from_value: string | null;
  to_value: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TestimonialRow {
  id: string;
  client_name: string;
  position: string | null;
  company: string | null;
  country: string | null;
  photo_url: string | null;
  logo_url: string | null;
  rating: number | null;
  quote_en: string;
  quote_sq: string | null;
  project_id: string | null;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface FaqRow {
  id: string;
  category: string;
  question_en: string;
  answer_en: string;
  question_sq: string | null;
  answer_sq: string | null;
  service_id: string | null;
  industry_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface PageRow {
  id: string;
  slug: string;
  kind: 'system' | 'landing';
  status: ContentStatus;
  is_indexable: boolean;
  canonical_url: string | null;
  og_image: string | null;
  sort_order: number;
  updated_at?: string;
}

/** Predefined section blocks — no free-form page builder (spec §63). */
export type PageSection =
  | { type: 'hero'; eyebrow?: string; title: string; subtitle?: string; body?: string; primaryCta?: string; secondaryCta?: string; note?: string }
  | { type: 'metrics'; title?: string; items: { value: string; label: string }[] }
  | { type: 'richText'; title?: string; body: string }
  | { type: 'featureGrid'; title?: string; subtitle?: string; items: RichPair[] }
  | { type: 'process'; title?: string; subtitle?: string; steps: ProcessStep[] }
  | { type: 'services'; title?: string; subtitle?: string }
  | { type: 'projects'; title?: string; subtitle?: string; limit?: number }
  | { type: 'industries'; title?: string; subtitle?: string }
  | { type: 'technologies'; title?: string }
  | { type: 'testimonials'; title?: string; subtitle?: string }
  | { type: 'blog'; title?: string; subtitle?: string; limit?: number }
  | { type: 'faq'; title?: string; subtitle?: string; category?: string }
  | { type: 'cta'; title: string; body?: string; primaryCta?: string };

export interface PageTranslationRow {
  id?: string;
  page_id: string;
  language: Language;
  title: string;
  sections: PageSection[];
  seo_title: string | null;
  seo_description: string | null;
  og_title?: string | null;
  og_description?: string | null;
  is_complete: boolean;
}

export interface MediaRow {
  id: string;
  bucket: string;
  path: string;
  url: string;
  kind: MediaKind;
  mime_type: string;
  file_name: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_en: string | null;
  alt_sq: string | null;
  folder: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  language: Language;
  source: string | null;
  status: SubscriberStatus;
  confirmed_at: string | null;
  created_at: string;
}

export interface RedirectRow {
  id: string;
  source: string;
  destination: string;
  status_code: 301 | 302 | 307 | 308;
  is_active: boolean;
  hit_count: number;
  created_at: string;
  updated_at: string;
}

export interface SeoSettingRow {
  id: string;
  path: string;
  language: Language;
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  is_indexable: boolean;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminNotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  severity: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface IntegrationRow {
  key: string;
  label: string;
  is_enabled: boolean;
  config: Record<string, unknown>;
  last_status: string | null;
  last_checked_at: string | null;
  updated_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
