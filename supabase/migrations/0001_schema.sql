-- ============================================================================
-- drh.al — core schema
-- PostgreSQL / Supabase. Run in order: 0001 -> 0002 -> seed.sql
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────────────────────
do $enums$ begin
  create type user_role         as enum ('super_admin','admin','editor','marketing');
exception when duplicate_object then null; end $enums$;
do $enums$ begin
  create type content_status    as enum ('draft','published','archived');
exception when duplicate_object then null; end $enums$;
do $enums$ begin
  create type language_code     as enum ('en','sq');
exception when duplicate_object then null; end $enums$;
do $enums$ begin
  create type lead_status       as enum ('new','contacted','qualified','proposal_sent','won','lost');
exception when duplicate_object then null; end $enums$;
do $enums$ begin
  create type media_kind        as enum ('image','video','document');
exception when duplicate_object then null; end $enums$;
do $enums$ begin
  create type subscriber_status as enum ('pending','subscribed','unsubscribed');
exception when duplicate_object then null; end $enums$;

-- ─── Utility: updated_at trigger ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end $fn$;

-- ============================================================================
-- Users & access control
-- ============================================================================
create table if not exists public.admin_users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text,
  avatar_url    text,
  role          user_role not null default 'editor',
  is_active     boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists admin_users_role_idx on public.admin_users(role) where is_active;

-- ============================================================================
-- Taxonomy
-- ============================================================================
create table if not exists public.technologies (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  icon_key   text,
  color      text,
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.industries (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  icon_key    text,
  cover_image text,
  status      content_status not null default 'published',
  featured    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.industry_translations (
  id              uuid primary key default gen_random_uuid(),
  industry_id     uuid not null references public.industries(id) on delete cascade,
  language        language_code not null,
  title           text not null,
  hero_title      text,
  hero_subtitle   text,
  description     text,
  problems        jsonb not null default '[]'::jsonb,   -- [{title, body}]
  solutions       jsonb not null default '[]'::jsonb,   -- [{title, body}]
  cta_title       text,
  cta_body        text,
  seo_title       text,
  seo_description text,
  og_title        text,
  og_description  text,
  is_complete     boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (industry_id, language)
);

-- ============================================================================
-- Services
-- ============================================================================
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  icon_key    text,
  cover_image text,
  status      content_status not null default 'published',
  featured    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.service_translations (
  id                uuid primary key default gen_random_uuid(),
  service_id        uuid not null references public.services(id) on delete cascade,
  language          language_code not null,
  title             text not null,
  headline          text,
  short_description text,
  full_description  text,
  benefits          jsonb not null default '[]'::jsonb,  -- [{title, body}]
  features          jsonb not null default '[]'::jsonb,  -- ["…"]
  process           jsonb not null default '[]'::jsonb,  -- [{step,title,body}]
  cta_title         text,
  cta_body          text,
  seo_title         text,
  seo_description   text,
  og_title          text,
  og_description    text,
  is_complete       boolean not null default false,
  updated_at        timestamptz not null default now(),
  unique (service_id, language)
);

create table if not exists public.service_technologies (
  service_id    uuid not null references public.services(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (service_id, technology_id)
);

-- ============================================================================
-- Projects / portfolio
-- ============================================================================
create table if not exists public.projects (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  client_name        text not null,
  client_logo        text,
  industry_id        uuid references public.industries(id) on delete set null,
  country            text,
  project_date       date,
  cover_image        text,
  cover_image_mobile text,
  og_image           text,
  canonical_url      text,
  website_url        text,
  featured           boolean not null default false,
  status             content_status not null default 'draft',
  is_indexable       boolean not null default true,
  sort_order         int not null default 0,
  testimonial_id     uuid,
  view_count         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  published_at       timestamptz
);
create index if not exists projects_status_idx   on public.projects(status, featured, sort_order);
create index if not exists projects_industry_idx on public.projects(industry_id);

create table if not exists public.project_translations (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  language          language_code not null,
  title             text not null,
  short_description text,
  overview          text,
  challenge         text,
  solution          text,
  development       text,
  results_text      text,
  seo_title         text,
  seo_description   text,
  og_title          text,
  og_description    text,
  is_complete       boolean not null default false,
  updated_at        timestamptz not null default now(),
  unique (project_id, language)
);

create table if not exists public.project_media (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_id   uuid,
  url        text not null,
  alt_en     text,
  alt_sq     text,
  caption    text,
  width      int,
  height     int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_media_project_idx on public.project_media(project_id, sort_order);

create table if not exists public.project_results (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  value      text not null,           -- e.g. "70%"
  label_en   text not null,           -- e.g. "Faster load time"
  label_sq   text,
  sort_order int not null default 0
);

create table if not exists public.project_technologies (
  project_id    uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

create table if not exists public.project_services (
  project_id uuid not null references public.projects(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (project_id, service_id)
);

-- ============================================================================
-- Blog
-- ============================================================================
create table if not exists public.blog_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_en    text not null,
  name_sq    text,
  sort_order int not null default 0
);

create table if not exists public.blog_tags (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  name_en text not null,
  name_sq text
);

create table if not exists public.blog_posts (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  category_id        uuid references public.blog_categories(id) on delete set null,
  author_id          uuid references public.admin_users(id) on delete set null,
  author_name        text,
  featured_image     text,
  og_image           text,
  status             content_status not null default 'draft',
  featured           boolean not null default false,
  is_indexable       boolean not null default true,
  published_at       timestamptz,
  reading_time       int not null default 1,
  view_count         int not null default 0,
  related_service_id uuid references public.services(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts(status, published_at desc);

create table if not exists public.blog_translations (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null references public.blog_posts(id) on delete cascade,
  language        language_code not null,
  title           text not null,
  excerpt         text,
  content_html    text,
  seo_title       text,
  seo_description text,
  og_title        text,
  og_description  text,
  is_complete     boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (post_id, language)
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id  uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============================================================================
-- Leads / CRM
-- ============================================================================
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  phone           text,
  company         text,
  website         text,
  service         text,
  budget          text,
  timeline        text,
  message         text,
  attachment_url  text,
  status          lead_status not null default 'new',
  estimated_value numeric(12,2),
  won_value       numeric(12,2),
  language        language_code not null default 'en',
  -- attribution
  source          text,
  source_page     text,
  landing_page    text,
  referrer        text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  first_touch     jsonb,
  country         text,
  city            text,
  device          text,
  is_archived     boolean not null default false,
  assigned_to     uuid references public.admin_users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists leads_status_idx  on public.leads(status, created_at desc);
create index if not exists leads_created_idx on public.leads(created_at desc);
create index if not exists leads_email_idx   on public.leads(lower(email));

create table if not exists public.lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  author_id   uuid references public.admin_users(id) on delete set null,
  author_name text,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.lead_activity (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  actor_id   uuid references public.admin_users(id) on delete set null,
  actor_name text,
  action     text not null,
  from_value text,
  to_value   text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index if not exists lead_activity_lead_idx on public.lead_activity(lead_id, created_at desc);

-- ============================================================================
-- Testimonials / FAQs
-- ============================================================================
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  client_name text not null,
  position    text,
  company     text,
  country     text,
  photo_url   text,
  logo_url    text,
  rating      smallint check (rating between 1 and 5),
  quote_en    text not null,
  quote_sq    text,
  project_id  uuid references public.projects(id) on delete set null,
  featured    boolean not null default false,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  category    text not null default 'general',
  question_en text not null,
  answer_en   text not null,
  question_sq text,
  answer_sq   text,
  service_id  uuid references public.services(id) on delete cascade,
  industry_id uuid references public.industries(id) on delete cascade,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists faqs_category_idx on public.faqs(category, sort_order) where is_active;

-- ============================================================================
-- Pages (structured section CMS) & SEO landing pages
-- ============================================================================
create table if not exists public.pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,           -- 'home' | 'about' | 'web-development-albania'
  kind          text not null default 'system', -- 'system' | 'landing'
  status        content_status not null default 'published',
  is_indexable  boolean not null default true,
  canonical_url text,
  og_image      text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.page_translations (
  id              uuid primary key default gen_random_uuid(),
  page_id         uuid not null references public.pages(id) on delete cascade,
  language        language_code not null,
  title           text not null,
  sections        jsonb not null default '[]'::jsonb,  -- ordered predefined section blocks
  seo_title       text,
  seo_description text,
  og_title        text,
  og_description  text,
  is_complete     boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (page_id, language)
);

-- ============================================================================
-- Media library
-- ============================================================================
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,
  url         text not null,
  kind        media_kind not null default 'image',
  mime_type   text not null,
  file_name   text not null,
  size_bytes  bigint not null default 0,
  width       int,
  height      int,
  alt_en      text,
  alt_sq      text,
  folder      text not null default 'general',
  uploaded_by uuid references public.admin_users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists media_folder_idx on public.media(folder, created_at desc);

-- ============================================================================
-- Newsletter
-- ============================================================================
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  language      language_code not null default 'en',
  source        text,
  status        subscriber_status not null default 'pending',
  confirm_token text,
  confirmed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================================
-- SEO, redirects, settings, integrations
-- ============================================================================
create table if not exists public.seo_settings (
  id              uuid primary key default gen_random_uuid(),
  path            text not null,
  language        language_code not null default 'en',
  seo_title       text,
  seo_description text,
  og_title        text,
  og_description  text,
  og_image        text,
  canonical_url   text,
  is_indexable    boolean not null default true,
  updated_at      timestamptz not null default now(),
  unique (path, language)
);

create table if not exists public.redirects (
  id          uuid primary key default gen_random_uuid(),
  source      text not null unique,
  destination text not null,
  status_code smallint not null default 301 check (status_code in (301,302,307,308)),
  is_active   boolean not null default true,
  hit_count   int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(id) on delete set null
);

create table if not exists public.integrations (
  key             text primary key,   -- 'ga4' | 'gsc' | 'google_ads' | 'meta_pixel' | 'clarity' | 'resend' | 'turnstile' | 'calendly'
  label           text not null,
  is_enabled      boolean not null default false,
  config          jsonb not null default '{}'::jsonb,   -- non-secret config only
  last_status     text,
  last_checked_at timestamptz,
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- Activity log & notifications
-- ============================================================================
create table if not exists public.activity_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.admin_users(id) on delete set null,
  actor_email  text,
  action       text not null,          -- 'created' | 'updated' | 'deleted' | 'published' | 'login'
  entity_type  text not null,          -- 'project' | 'blog_post' | 'lead' | …
  entity_id    text,
  entity_label text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

create table if not exists public.admin_notifications (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,            -- 'lead' | 'subscriber' | 'blog' | 'integration' | 'security'
  title      text not null,
  body       text,
  href       text,
  severity   text not null default 'info',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists admin_notifications_unread_idx on public.admin_notifications(is_read, created_at desc);

-- ============================================================================
-- First-party content engagement events (privacy preserving — no IP stored)
-- ============================================================================
create table if not exists public.page_events (
  id          uuid primary key default gen_random_uuid(),
  event_name  text not null,
  entity_type text,
  entity_id   uuid,
  path        text,
  language    language_code default 'en',
  device      text,
  country     text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists page_events_name_idx   on public.page_events(event_name, created_at desc);
create index if not exists page_events_entity_idx on public.page_events(entity_type, entity_id);

-- ─── Rate limiting (hashed identifiers only, short lived) ───────────────────
create table if not exists public.rate_limits (
  id              bigserial primary key,
  bucket          text not null,
  identifier_hash text not null,      -- sha256(ip + rotating salt); never the raw IP
  created_at      timestamptz not null default now()
);
create index if not exists rate_limits_lookup_idx on public.rate_limits(bucket, identifier_hash, created_at desc);

create or replace function public.prune_rate_limits()
returns void language sql as $fn$
  delete from public.rate_limits where created_at < now() - interval '24 hours';
$fn$;

-- ─── Deferred FKs (circular references) ─────────────────────────────────────
do $fk$ begin
  alter table public.projects
    add constraint projects_testimonial_fk
    foreign key (testimonial_id) references public.testimonials(id) on delete set null;
exception when duplicate_object then null; end $fk$;

do $fk$ begin
  alter table public.project_media
    add constraint project_media_media_fk
    foreign key (media_id) references public.media(id) on delete set null;
exception when duplicate_object then null; end $fk$;

-- ─── updated_at triggers on every mutable table ─────────────────────────────
do $trg$
declare t text;
begin
  foreach t in array array[
    'admin_users','industries','industry_translations','services','service_translations',
    'projects','project_translations','blog_posts','blog_translations','leads','testimonials',
    'faqs','pages','page_translations','media','newsletter_subscribers','seo_settings',
    'redirects','site_settings','integrations'
  ] loop
    -- One statement per EXECUTE: PL/pgSQL's EXECUTE is documented for a single
    -- command, so batching two is a portability risk not worth taking.
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t);
  end loop;
end $trg$;
