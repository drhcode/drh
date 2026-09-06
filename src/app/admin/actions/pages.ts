'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity } from '@/lib/admin/audit';
import { slugify } from '@/lib/utils';
import type { PageSection } from '@/types/database';

/** Structured page CMS (spec §63, §64). */

export interface SaveResult {
  ok: boolean;
  error?: string;
}

const text = (raw: FormDataEntryValue | null): string | null => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value === '' ? null : value;
};

const bool = (raw: FormDataEntryValue | null): boolean => raw === 'true' || raw === 'on';

/**
 * Sections arrive as JSON from the editor. Only the section types the app knows
 * how to render are kept, so a malformed payload can never reach a page.
 */
const KNOWN_SECTIONS = new Set([
  'hero',
  'metrics',
  'richText',
  'featureGrid',
  'process',
  'services',
  'projects',
  'industries',
  'technologies',
  'testimonials',
  'blog',
  'faq',
  'cta',
]);

function parseSections(raw: FormDataEntryValue | null): PageSection[] {
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (section): section is PageSection =>
        typeof section === 'object' &&
        section !== null &&
        typeof (section as { type?: unknown }).type === 'string' &&
        KNOWN_SECTIONS.has((section as { type: string }).type),
    );
  } catch {
    return [];
  }
}

export async function savePage(formData: FormData): Promise<SaveResult> {
  let pageId = text(formData.get('id'));

  try {
    const admin = await assertCapability('pages');

    const slug = slugify(String(formData.get('slug') ?? ''));
    const titleEn = text(formData.get('title_en'));

    if (!slug || !titleEn) return { ok: false, error: 'An English title and slug are required.' };

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const row = {
      slug,
      kind: String(formData.get('kind') ?? 'landing') === 'system' ? 'system' : 'landing',
      status: String(formData.get('status') ?? 'draft'),
      is_indexable: bool(formData.get('is_indexable')),
      canonical_url: text(formData.get('canonical_url')),
      og_image: text(formData.get('og_image')),
      sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    };

    if (!pageId) {
      const { data, error } = await supabase.from('pages').insert(row).select('id').single();
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
      pageId = data.id as string;
    } else {
      const { error } = await supabase.from('pages').update(row).eq('id', pageId);
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
    }

    for (const language of ['en', 'sq'] as const) {
      const title = text(formData.get(`title_${language}`));

      if (!title) {
        await supabase
          .from('page_translations')
          .delete()
          .eq('page_id', pageId)
          .eq('language', language);
        continue;
      }

      await supabase.from('page_translations').upsert(
        {
          page_id: pageId,
          language,
          title,
          sections: parseSections(formData.get(`sections_${language}`)),
          seo_title: text(formData.get(`seo_title_${language}`)),
          seo_description: text(formData.get(`seo_description_${language}`)),
          is_complete: true,
        },
        { onConflict: 'page_id,language' },
      );
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'page',
      entityId: pageId,
      entityLabel: titleEn,
      metadata: { slug },
    });

    revalidatePath('/admin/pages');
    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error('[pages] save failed', error);
    return { ok: false, error: 'Could not save the page.' };
  }

  redirect(`/admin/pages/${pageId}?saved=1`);
}

export async function deletePage(id: string): Promise<SaveResult> {
  try {
    const admin = await assertCapability('pages');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { data } = await supabase.from('pages').select('slug, kind').eq('id', id).maybeSingle();
    const page = data as { slug: string; kind: string } | null;

    // The home, about and contact pages are wired into fixed routes; deleting
    // one would 500 the site rather than merely hiding a page.
    if (page?.kind === 'system') {
      return { ok: false, error: 'System pages cannot be deleted. Unpublish it instead.' };
    }

    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'deleted',
      entityType: 'page',
      entityId: id,
      entityLabel: page?.slug ?? id,
    });

    revalidatePath('/admin/pages');
    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    return { ok: false, error: 'Could not delete the page.' };
  }

  redirect('/admin/pages');
}
