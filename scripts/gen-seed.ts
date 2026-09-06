/**
 * Generates supabase/seed.sql from the typed seed content in src/content/seed.
 *
 *   npm run seed:sql
 *
 * The output is idempotent: every statement uses ON CONFLICT DO UPDATE, so it
 * can be re-run after editing the content modules without duplicating rows.
 * It never touches leads, users or anything the team creates in the admin.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  technologies,
  industries,
  industryTranslations,
  services,
  serviceTranslations,
  serviceTechnologies,
  projects,
  projectTranslations,
  projectMedia,
  projectTechnologies,
  projectServices,
  blogCategories,
  blogPosts,
  blogTranslations,
  faqs,
  pages,
  pageTranslations,
  siteSettings,
  integrations,
} from '../src/content/seed';
import { techBySlug } from '../src/content/seed/technologies';
import { serviceIdBySlug } from '../src/content/seed/services';

type Value = string | number | boolean | null | undefined | object;

const q = (v: Value): string => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return `${lit(JSON.stringify(v))}::jsonb`;
  return lit(v);
};

const lit = (s: string) => `'${s.replace(/'/g, "''")}'`;

function insert(
  table: string,
  rows: Record<string, Value>[],
  conflict: string,
  updateColumns?: string[],
): string {
  if (rows.length === 0) return `-- ${table}: no seed rows\n`;
  const cols = Object.keys(rows[0]);
  const values = rows
    .map((r) => `  (${cols.map((c) => q(r[c])).join(', ')})`)
    .join(',\n');
  const updates = (updateColumns ?? cols.filter((c) => !conflict.includes(c)))
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');
  const action = updates ? `do update set ${updates}` : 'do nothing';
  return [
    `insert into public.${table} (${cols.join(', ')}) values`,
    values,
    `on conflict (${conflict}) ${action};`,
    '',
  ].join('\n');
}

const parts: string[] = [
  '-- ============================================================================',
  '-- drh.al — seed data',
  '-- GENERATED FILE. Edit src/content/seed/*.ts and run `npm run seed:sql`.',
  '-- Safe to re-run: every statement upserts.',
  '-- ============================================================================',
  '',
  'begin;',
  '',
];

parts.push(insert('technologies', technologies as unknown as Record<string, Value>[], 'id'));

parts.push(insert('industries', industries as unknown as Record<string, Value>[], 'id'));
parts.push(
  insert(
    'industry_translations',
    industryTranslations as unknown as Record<string, Value>[],
    'industry_id, language',
  ),
);

parts.push(insert('services', services as unknown as Record<string, Value>[], 'id'));
parts.push(
  insert(
    'service_translations',
    serviceTranslations as unknown as Record<string, Value>[],
    'service_id, language',
  ),
);
parts.push(
  insert(
    'service_technologies',
    serviceTechnologies.map((r) => ({
      service_id: r.service_id,
      technology_id: techBySlug(r.technology_slug).id,
    })),
    'service_id, technology_id',
  ),
);

parts.push(insert('projects', projects as unknown as Record<string, Value>[], 'id'));
parts.push(
  insert(
    'project_translations',
    projectTranslations as unknown as Record<string, Value>[],
    'project_id, language',
  ),
);
parts.push(insert('project_media', projectMedia as unknown as Record<string, Value>[], 'id'));
parts.push(
  insert(
    'project_technologies',
    projectTechnologies.map((r) => ({
      project_id: r.project_id,
      technology_id: techBySlug(r.technology_slug).id,
    })),
    'project_id, technology_id',
  ),
);
parts.push(
  insert(
    'project_services',
    projectServices.map((r) => ({
      project_id: r.project_id,
      service_id: serviceIdBySlug.get(r.service_slug)!,
    })),
    'project_id, service_id',
  ),
);

parts.push(insert('blog_categories', blogCategories as unknown as Record<string, Value>[], 'id'));
parts.push(insert('blog_posts', blogPosts as unknown as Record<string, Value>[], 'id'));
parts.push(
  insert(
    'blog_translations',
    blogTranslations as unknown as Record<string, Value>[],
    'post_id, language',
  ),
);

parts.push(insert('faqs', faqs as unknown as Record<string, Value>[], 'id'));

parts.push(insert('pages', pages as unknown as Record<string, Value>[], 'id'));
parts.push(
  insert(
    'page_translations',
    pageTranslations as unknown as Record<string, Value>[],
    'page_id, language',
  ),
);

parts.push(
  insert(
    'site_settings',
    siteSettings.map((s) => ({ key: s.key, value: s.value })),
    'key',
    ['value'],
  ),
);
parts.push(
  insert(
    'integrations',
    integrations.map((i) => ({ key: i.key, label: i.label, config: i.config })),
    'key',
    ['label', 'config'],
  ),
);

parts.push('commit;', '');

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'supabase', 'seed.sql');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, parts.join('\n'), 'utf8');

const rows =
  technologies.length +
  industries.length +
  industryTranslations.length +
  services.length +
  serviceTranslations.length +
  projects.length +
  projectTranslations.length +
  projectMedia.length +
  blogCategories.length +
  blogPosts.length +
  blogTranslations.length +
  faqs.length +
  pages.length +
  pageTranslations.length;

console.log(`Wrote ${out} (${rows} content rows).`);
