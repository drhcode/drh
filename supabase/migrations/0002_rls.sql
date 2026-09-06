-- ============================================================================
-- drh.al — Row Level Security
--
-- Model:
--   * anon / authenticated visitors  -> read PUBLISHED content only
--   * admin_users                    -> role-scoped write access
--   * service_role (server actions)  -> bypasses RLS entirely; every server
--                                       action still re-checks the role in
--                                       application code (src/lib/auth/guard.ts)
--
-- Nothing writes to `leads`, `newsletter_subscribers`, `rate_limits` or
-- `page_events` from the browser: those go through server actions using the
-- service role, so no anon INSERT policy exists for them.
-- ============================================================================

-- ─── Helpers ────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so that policies on admin_users itself do not recurse.
create or replace function public.admin_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $fn$
  select u.role
  from public.admin_users u
  where u.id = auth.uid() and u.is_active
$fn$;

create or replace function public.has_role(allowed user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(public.admin_role() = any(allowed), false)
$fn$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select public.admin_role() is not null
$fn$;

grant execute on function public.admin_role()  to anon, authenticated;
grant execute on function public.has_role(user_role[]) to anon, authenticated;
grant execute on function public.is_admin()    to anon, authenticated;

-- ─── Enable RLS everywhere ──────────────────────────────────────────────────
do $rls$
declare t text;
begin
  foreach t in array array[
    'admin_users','technologies','industries','industry_translations','services',
    'service_translations','service_technologies','projects','project_translations',
    'project_media','project_results','project_technologies','project_services',
    'blog_categories','blog_tags','blog_posts','blog_translations','blog_post_tags',
    'leads','lead_notes','lead_activity','testimonials','faqs','pages','page_translations',
    'media','newsletter_subscribers','seo_settings','redirects','site_settings',
    'integrations','activity_logs','admin_notifications','page_events','rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $rls$;

-- ============================================================================
-- Public read policies — published content only
-- ============================================================================

-- Simple reference tables: readable by everyone.
drop policy if exists tech_public_read on public.technologies;
create policy tech_public_read on public.technologies
  for select using (is_active or public.is_admin());

drop policy if exists blog_categories_public_read on public.blog_categories;
create policy blog_categories_public_read on public.blog_categories for select using (true);

drop policy if exists blog_tags_public_read on public.blog_tags;
create policy blog_tags_public_read on public.blog_tags for select using (true);

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);

-- Status-gated content.
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select using (status = 'published' or public.is_admin());

drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
  for select using (status = 'published' or public.is_admin());

drop policy if exists industries_public_read on public.industries;
create policy industries_public_read on public.industries
  for select using (status = 'published' or public.is_admin());

drop policy if exists pages_public_read on public.pages;
create policy pages_public_read on public.pages
  for select using (status = 'published' or public.is_admin());

drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
  for select using (
    (status = 'published' and (published_at is null or published_at <= now()))
    or public.is_admin()
  );

drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select using (is_active or public.is_admin());

drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read on public.faqs
  for select using (is_active or public.is_admin());

drop policy if exists redirects_public_read on public.redirects;
create policy redirects_public_read on public.redirects
  for select using (is_active or public.is_admin());

drop policy if exists seo_public_read on public.seo_settings;
create policy seo_public_read on public.seo_settings for select using (true);

drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (true);

-- Child tables inherit the visibility of their parent.
drop policy if exists project_tr_public_read on public.project_translations;
create policy project_tr_public_read on public.project_translations for select using (
  exists (select 1 from public.projects p where p.id = project_id
          and (p.status = 'published' or public.is_admin())));

drop policy if exists project_media_public_read on public.project_media;
create policy project_media_public_read on public.project_media for select using (
  exists (select 1 from public.projects p where p.id = project_id
          and (p.status = 'published' or public.is_admin())));

drop policy if exists project_results_public_read on public.project_results;
create policy project_results_public_read on public.project_results for select using (
  exists (select 1 from public.projects p where p.id = project_id
          and (p.status = 'published' or public.is_admin())));

drop policy if exists project_tech_public_read on public.project_technologies;
create policy project_tech_public_read on public.project_technologies for select using (
  exists (select 1 from public.projects p where p.id = project_id
          and (p.status = 'published' or public.is_admin())));

drop policy if exists project_services_public_read on public.project_services;
create policy project_services_public_read on public.project_services for select using (
  exists (select 1 from public.projects p where p.id = project_id
          and (p.status = 'published' or public.is_admin())));

drop policy if exists service_tr_public_read on public.service_translations;
create policy service_tr_public_read on public.service_translations for select using (
  exists (select 1 from public.services s where s.id = service_id
          and (s.status = 'published' or public.is_admin())));

drop policy if exists service_tech_public_read on public.service_technologies;
create policy service_tech_public_read on public.service_technologies for select using (
  exists (select 1 from public.services s where s.id = service_id
          and (s.status = 'published' or public.is_admin())));

drop policy if exists industry_tr_public_read on public.industry_translations;
create policy industry_tr_public_read on public.industry_translations for select using (
  exists (select 1 from public.industries i where i.id = industry_id
          and (i.status = 'published' or public.is_admin())));

drop policy if exists page_tr_public_read on public.page_translations;
create policy page_tr_public_read on public.page_translations for select using (
  exists (select 1 from public.pages pg where pg.id = page_id
          and (pg.status = 'published' or public.is_admin())));

drop policy if exists blog_tr_public_read on public.blog_translations;
create policy blog_tr_public_read on public.blog_translations for select using (
  exists (select 1 from public.blog_posts b where b.id = post_id
          and ((b.status = 'published' and (b.published_at is null or b.published_at <= now()))
               or public.is_admin())));

drop policy if exists blog_post_tags_public_read on public.blog_post_tags;
create policy blog_post_tags_public_read on public.blog_post_tags for select using (
  exists (select 1 from public.blog_posts b where b.id = post_id
          and ((b.status = 'published' and (b.published_at is null or b.published_at <= now()))
               or public.is_admin())));

-- ============================================================================
-- Admin write policies
-- ============================================================================

-- Content editable by: super_admin, admin, editor
do $pol$
declare t text;
begin
  foreach t in array array[
    'projects','project_translations','project_media','project_results',
    'project_technologies','project_services','blog_posts','blog_translations',
    'blog_post_tags','blog_categories','blog_tags','pages','page_translations','media'
  ] loop
    -- The policy name is passed as its own identifier rather than glued onto
    -- %I, which would break the moment a table name needed quoting.
    execute format('drop policy if exists %I on public.%I;', t || '_editor_write', t);
    execute format($p$
      create policy %I on public.%I
        for all
        using (public.has_role(array['super_admin','admin','editor']::user_role[]))
        with check (public.has_role(array['super_admin','admin','editor']::user_role[]));
    $p$, t || '_editor_write', t);
  end loop;
end $pol$;

-- Structural content editable by: super_admin, admin
do $pol$
declare t text;
begin
  foreach t in array array[
    'services','service_translations','service_technologies','industries',
    'industry_translations','technologies','testimonials','faqs'
  ] loop
    -- The policy name is passed as its own identifier rather than glued onto
    -- %I, which would break the moment a table name needed quoting.
    execute format('drop policy if exists %I on public.%I;', t || '_admin_write', t);
    execute format($p$
      create policy %I on public.%I
        for all
        using (public.has_role(array['super_admin','admin']::user_role[]))
        with check (public.has_role(array['super_admin','admin']::user_role[]));
    $p$, t || '_admin_write', t);
  end loop;
end $pol$;

-- Growth surface editable by: super_admin, admin, marketing
do $pol$
declare t text;
begin
  foreach t in array array[
    'leads','lead_notes','lead_activity','newsletter_subscribers',
    'seo_settings','redirects','integrations'
  ] loop
    -- The policy name is passed as its own identifier rather than glued onto
    -- %I, which would break the moment a table name needed quoting.
    execute format('drop policy if exists %I on public.%I;', t || '_marketing_write', t);
    execute format($p$
      create policy %I on public.%I
        for all
        using (public.has_role(array['super_admin','admin','marketing']::user_role[]))
        with check (public.has_role(array['super_admin','admin','marketing']::user_role[]));
    $p$, t || '_marketing_write', t);
  end loop;
end $pol$;

-- Site settings: super_admin + admin
drop policy if exists site_settings_write on public.site_settings;
create policy site_settings_write on public.site_settings
  for all
  using (public.has_role(array['super_admin','admin']::user_role[]))
  with check (public.has_role(array['super_admin','admin']::user_role[]));

-- ─── admin_users ────────────────────────────────────────────────────────────
drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists admin_users_self_update on public.admin_users;
create policy admin_users_self_update on public.admin_users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Only a super admin manages the team.
drop policy if exists admin_users_super_write on public.admin_users;
create policy admin_users_super_write on public.admin_users
  for all
  using (public.has_role(array['super_admin']::user_role[]))
  with check (public.has_role(array['super_admin']::user_role[]));

-- ─── Logs & notifications: readable by any admin, written server-side ───────
drop policy if exists activity_logs_read on public.activity_logs;
create policy activity_logs_read on public.activity_logs
  for select using (public.is_admin());

drop policy if exists notifications_read on public.admin_notifications;
create policy notifications_read on public.admin_notifications
  for select using (public.is_admin());

drop policy if exists notifications_update on public.admin_notifications;
create policy notifications_update on public.admin_notifications
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists page_events_read on public.page_events;
create policy page_events_read on public.page_events
  for select using (public.is_admin());

-- `rate_limits` has RLS on and no policies at all: unreachable except via the
-- service role. That is deliberate.

-- ============================================================================
-- Storage buckets
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Private bucket: lead attachments are never publicly readable.
insert into storage.buckets (id, name, public)
values ('lead-attachments', 'lead-attachments', false)
on conflict (id) do nothing;

drop policy if exists media_public_select on storage.objects;
create policy media_public_select on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects
  for all
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists lead_attachments_admin_read on storage.objects;
create policy lead_attachments_admin_read on storage.objects
  for select using (
    bucket_id = 'lead-attachments'
    and public.has_role(array['super_admin','admin','marketing']::user_role[])
  );

-- ============================================================================
-- Auth hook: mirror new auth users into admin_users (inactive by default)
-- A super admin then activates and assigns the role from /admin/users.
-- ============================================================================
create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.admin_users (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'editor'),
    coalesce((new.raw_user_meta_data->>'is_active')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end $fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();
