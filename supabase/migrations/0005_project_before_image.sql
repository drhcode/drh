-- ============================================================================
-- 0005 — Before screenshot for case studies
--
-- Optional screenshot of a client's previous site. When present, the case
-- study renders a before/after drag slider against the cover image; when
-- absent, the slider is not shown at all. Public read access follows the
-- existing projects policies — no new policy is needed for a new column.
--
-- Additive and safe to run more than once.
-- ============================================================================

alter table public.projects add column if not exists before_image text;
