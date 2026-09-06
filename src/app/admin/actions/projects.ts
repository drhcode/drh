'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity } from '@/lib/admin/audit';
import { slugify } from '@/lib/utils';

/**
 * Project CMS mutations (spec §54, §55).
 *
 * The whole project — row, both translations, gallery, results and the two join
 * tables — is written in one action so an editor never ends up with a project
 * whose translations belong to a different revision.
 */

export interface SaveResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const jsonArray = <T>(raw: FormDataEntryValue | null, fallback: T[]): T[] => {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
};

const bool = (raw: FormDataEntryValue | null): boolean => raw === 'true' || raw === 'on';
const text = (raw: FormDataEntryValue | null): string | null => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value === '' ? null : value;
};

const projectSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  client_name: z.string().trim().min(1).max(160),
  status: z.enum(['draft', 'published', 'archived']),
});

interface GalleryItem {
  url: string;
  alt_en?: string;
  alt_sq?: string;
}

interface ResultItem {
  value: string;
  label_en: string;
  label_sq?: string;
}

function translationPayload(formData: FormData, language: 'en' | 'sq') {
  const suffix = `_${language}`;
  const title = text(formData.get(`title${suffix}`));

  // A translation exists only when it has a title; otherwise the language is
  // genuinely missing and must be reported as such (spec §10).
  if (!title) return null;

  return {
    language,
    title,
    short_description: text(formData.get(`short_description${suffix}`)),
    overview: text(formData.get(`overview${suffix}`)),
    challenge: text(formData.get(`challenge${suffix}`)),
    solution: text(formData.get(`solution${suffix}`)),
    development: text(formData.get(`development${suffix}`)),
    results_text: text(formData.get(`results_text${suffix}`)),
    seo_title: text(formData.get(`seo_title${suffix}`)),
    seo_description: text(formData.get(`seo_description${suffix}`)),
    og_title: null,
    og_description: null,
    is_complete: true,
  };
}

export async function saveProject(formData: FormData): Promise<SaveResult> {
  let projectId = text(formData.get('id'));

  try {
    const admin = await assertCapability('projects');

    const parsed = projectSchema.safeParse({
      slug: slugify(String(formData.get('slug') ?? '')),
      client_name: formData.get('client_name'),
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return { ok: false, error: 'Client name, slug and status are required.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const isNew = !projectId;

    const row = {
      slug: parsed.data.slug,
      client_name: parsed.data.client_name,
      client_logo: text(formData.get('client_logo')),
      industry_id: text(formData.get('industry_id')),
      country: text(formData.get('country')),
      project_date: text(formData.get('project_date')),
      cover_image: text(formData.get('cover_image')),
      cover_image_mobile: text(formData.get('cover_image_mobile')),
      og_image: text(formData.get('og_image')),
      canonical_url: text(formData.get('canonical_url')),
      website_url: text(formData.get('website_url')),
      testimonial_id: text(formData.get('testimonial_id')),
      featured: bool(formData.get('featured')),
      status: parsed.data.status,
      is_indexable: bool(formData.get('is_indexable')),
      sort_order: Number(formData.get('sort_order') ?? 0) || 0,
      published_at:
        parsed.data.status === 'published' ? (text(formData.get('published_at')) ?? new Date().toISOString()) : null,
    };

    if (isNew) {
      const { data, error } = await supabase.from('projects').insert(row).select('id').single();
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
      projectId = data.id as string;
    } else {
      const { error } = await supabase.from('projects').update(row).eq('id', projectId!);
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
    }

    // ── Translations ────────────────────────────────────────────────────────
    for (const language of ['en', 'sq'] as const) {
      const payload = translationPayload(formData, language);

      if (!payload) {
        await supabase
          .from('project_translations')
          .delete()
          .eq('project_id', projectId!)
          .eq('language', language);
        continue;
      }

      await supabase
        .from('project_translations')
        .upsert(
          { ...payload, project_id: projectId! },
          { onConflict: 'project_id,language' },
        );
    }

    // ── Gallery (replace wholesale, order preserved) ────────────────────────
    const gallery = jsonArray<GalleryItem>(formData.get('gallery'), []);
    await supabase.from('project_media').delete().eq('project_id', projectId!);
    if (gallery.length > 0) {
      await supabase.from('project_media').insert(
        gallery
          .filter((item) => item.url)
          .map((item, index) => ({
            project_id: projectId!,
            url: item.url,
            alt_en: item.alt_en || null,
            alt_sq: item.alt_sq || null,
            sort_order: index,
          })),
      );
    }

    // ── Result metrics (optional — never required, spec §55) ────────────────
    const results = jsonArray<ResultItem>(formData.get('results'), []);
    await supabase.from('project_results').delete().eq('project_id', projectId!);
    if (results.length > 0) {
      await supabase.from('project_results').insert(
        results
          .filter((item) => item.value && item.label_en)
          .map((item, index) => ({
            project_id: projectId!,
            value: item.value,
            label_en: item.label_en,
            label_sq: item.label_sq || null,
            sort_order: index,
          })),
      );
    }

    // ── Join tables ─────────────────────────────────────────────────────────
    await syncJoin(supabase, 'project_technologies', 'technology_id', projectId!, 'technologies', jsonArray<string>(formData.get('technologies'), []));
    await syncJoin(supabase, 'project_services', 'service_id', projectId!, 'services', jsonArray<string>(formData.get('services'), []));

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: isNew ? 'created' : parsed.data.status === 'published' ? 'published' : 'updated',
      entityType: 'project',
      entityId: projectId!,
      entityLabel: parsed.data.client_name,
      metadata: { status: parsed.data.status, slug: parsed.data.slug },
    });

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error('[projects] save failed', error);
    return { ok: false, error: 'Could not save the project. Please try again.' };
  }

  redirect(`/admin/projects/${projectId}?saved=1`);
}

/** Replaces a project's join rows, resolving slugs to ids. */
async function syncJoin(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  supabase: any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  table: string,
  column: string,
  projectId: string,
  referenceTable: string,
  slugs: string[],
): Promise<void> {
  await supabase.from(table).delete().eq('project_id', projectId);
  if (slugs.length === 0) return;

  const { data } = await supabase.from(referenceTable).select('id, slug').in('slug', slugs);
  const rows = ((data ?? []) as { id: string; slug: string }[]).map((item) => ({
    project_id: projectId,
    [column]: item.id,
  }));

  if (rows.length > 0) await supabase.from(table).insert(rows);
}

export async function setProjectStatus(
  id: string,
  status: 'draft' | 'published' | 'archived',
): Promise<SaveResult> {
  try {
    const admin = await assertCapability('projects');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase
      .from('projects')
      .update({
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'updated',
      entityType: 'project',
      entityId: id,
      metadata: { status },
    });

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error('[projects] status change failed', error);
    return { ok: false, error: 'Could not change the status.' };
  }
}

export async function toggleProjectFeatured(id: string, featured: boolean): Promise<SaveResult> {
  try {
    await assertCapability('projects');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('projects').update({ featured }).eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    return { ok: false, error: 'Could not update the project.' };
  }
}

/** Duplicates a project as a draft, including translations and gallery. */
export async function duplicateProject(id: string): Promise<SaveResult> {
  let newId: string | undefined;

  try {
    const admin = await assertCapability('projects');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { data: original } = await supabase
      .from('projects')
      .select('*, project_translations(*), project_media(*), project_results(*)')
      .eq('id', id)
      .maybeSingle();

    if (!original) return { ok: false, error: 'Project not found.' };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const source = original as any;
    const {
      id: _id,
      created_at: _created,
      updated_at: _updated,
      project_translations,
      project_media,
      project_results,
      ...rest
    } = source;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { data: copy, error } = await supabase
      .from('projects')
      .insert({
        ...rest,
        slug: `${rest.slug}-copy-${Date.now().toString(36).slice(-4)}`,
        client_name: `${rest.client_name} (copy)`,
        status: 'draft',
        featured: false,
        published_at: null,
      })
      .select('id')
      .single();

    if (error) throw error;
    newId = copy.id as string;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (project_translations?.length) {
      await supabase.from('project_translations').insert(
        (project_translations as any[]).map(({ id: _tid, project_id: _pid, ...translation }) => ({
          ...translation,
          project_id: newId,
        })),
      );
    }

    if (project_media?.length) {
      await supabase.from('project_media').insert(
        (project_media as any[]).map(({ id: _mid, project_id: _pid, ...media }) => ({
          ...media,
          project_id: newId,
        })),
      );
    }

    if (project_results?.length) {
      await supabase.from('project_results').insert(
        (project_results as any[]).map(({ id: _rid, project_id: _pid, ...result }) => ({
          ...result,
          project_id: newId,
        })),
      );
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'created',
      entityType: 'project',
      entityId: newId,
      entityLabel: `${rest.client_name} (copy)`,
    });

    revalidatePath('/admin/projects');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error('[projects] duplicate failed', error);
    return { ok: false, error: 'Could not duplicate the project.' };
  }

  redirect(`/admin/projects/${newId}`);
}

export async function deleteProject(id: string): Promise<SaveResult> {
  try {
    const admin = await assertCapability('projects');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { data } = await supabase.from('projects').select('client_name').eq('id', id).maybeSingle();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'deleted',
      entityType: 'project',
      entityId: id,
      entityLabel: (data as { client_name?: string } | null)?.client_name ?? id,
    });

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error('[projects] delete failed', error);
    return { ok: false, error: 'Could not delete the project.' };
  }

  redirect('/admin/projects');
}
