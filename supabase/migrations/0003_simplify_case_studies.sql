-- ============================================================================
-- 0003 — Simplify case studies
--
-- Projects keep a single narrative field (overview) plus their structured
-- facts, gallery and testimonial. The separate Challenge / Solution /
-- Development sections and the results metrics are removed.
--
-- This is destructive and cannot be undone by re-running an earlier migration:
-- dropping a column discards its data. The affected rows were exported to
-- backups/project-case-study-fields-*.json before this was applied.
--
-- Safe to run more than once: every statement is guarded.
-- ============================================================================

begin;

-- ── Narrative sections folded into `overview` ───────────────────────────────
alter table public.project_translations drop column if exists challenge;
alter table public.project_translations drop column if exists solution;
alter table public.project_translations drop column if exists development;
alter table public.project_translations drop column if exists results_text;

-- ── Result metrics ─────────────────────────────────────────────────────────
-- Policies and the updated_at trigger belong to the table and go with it.
drop table if exists public.project_results cascade;

commit;
