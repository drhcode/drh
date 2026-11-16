-- ============================================================================
-- 0004 — Free website audit requests (/audit)
--
-- One row per audit request from the public form. Written only by the server
-- action through the service role (after Zod validation, honeypot, rate limit
-- and Turnstile). Anonymous visitors can neither read nor write: RLS is on and
-- there is no anon policy at all — the same model as `leads`.
--
-- Safe to run more than once: every statement is guarded.
-- ============================================================================

begin;

create table if not exists public.audit_requests (
  id            uuid primary key default gen_random_uuid(),
  url           text not null check (char_length(url) between 4 and 300),
  email         text not null check (char_length(email) between 3 and 200),
  -- The interface language of the request (en, sq or it). Plain text rather
  -- than the language_code enum, which only covers CMS content languages.
  locale        text not null default 'en' check (locale in ('en', 'sq', 'it')),
  status        text not null default 'new' check (status in ('new', 'in_progress', 'sent', 'archived')),
  notes         text,
  source_page   text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country       text,
  device        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists audit_requests_created_idx on public.audit_requests (created_at desc);
create index if not exists audit_requests_status_idx on public.audit_requests (status, created_at desc);

drop trigger if exists audit_requests_updated_at on public.audit_requests;
create trigger audit_requests_updated_at
  before update on public.audit_requests
  for each row execute function public.set_updated_at();

alter table public.audit_requests enable row level security;

-- Staff who already handle leads (super_admin, admin, marketing) can read and
-- work the queue. No policy grants anon access, so the public cannot list or
-- insert rows directly — only the server action, via the service role.
drop policy if exists audit_requests_marketing_write on public.audit_requests;
create policy audit_requests_marketing_write on public.audit_requests
  for all
  using (public.has_role(array['super_admin','admin','marketing']::user_role[]))
  with check (public.has_role(array['super_admin','admin','marketing']::user_role[]));

commit;
