'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity, notifyAdmins } from '@/lib/admin/audit';
import { estimateReadingTime } from '@/lib/content/html';
import { slugify } from '@/lib/utils';

/** Blog CMS mutations (spec §57). */

export interface SaveResult {
  ok: boolean;
  error?: string;
}

const text = (raw: FormDataEntryValue | null): string | null => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value === '' ? null : value;
};

const bool = (raw: FormDataEntryValue | null): boolean => raw === 'true' || raw === 'on';

export async function saveBlogPost(formData: FormData): Promise<SaveResult> {
  let postId = text(formData.get('id'));

  try {
    const admin = await assertCapability('blog');

    const slug = slugify(String(formData.get('slug') ?? ''));
    const titleEn = text(formData.get('title_en'));
    const status = String(formData.get('status') ?? 'draft') as 'draft' | 'published' | 'archived';

    if (!slug || !titleEn) {
      return { ok: false, error: 'An English title and a slug are required.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const isNew = !postId;
    const contentEn = text(formData.get('content_en')) ?? '';

    // A scheduled post keeps status 'published' with a future date; the public
    // query filters on published_at <= now, so it appears on its own.
    const scheduledAt = text(formData.get('published_at'));

    const row = {
      slug,
      category_id: text(formData.get('category_id')),
      author_name: text(formData.get('author_name')) ?? 'drh.al',
      featured_image: text(formData.get('featured_image')),
      og_image: text(formData.get('og_image')),
      related_service_id: text(formData.get('related_service_id')),
      status,
      featured: bool(formData.get('featured')),
      is_indexable: bool(formData.get('is_indexable')),
      reading_time: estimateReadingTime(contentEn),
      published_at:
        status === 'published' ? (scheduledAt ?? new Date().toISOString()) : scheduledAt,
    };

    if (isNew) {
      const { data, error } = await supabase.from('blog_posts').insert(row).select('id').single();
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
      postId = data.id as string;
    } else {
      const { error } = await supabase.from('blog_posts').update(row).eq('id', postId!);
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
    }

    for (const language of ['en', 'sq'] as const) {
      const title = text(formData.get(`title_${language}`));

      if (!title) {
        await supabase
          .from('blog_translations')
          .delete()
          .eq('post_id', postId!)
          .eq('language', language);
        continue;
      }

      await supabase.from('blog_translations').upsert(
        {
          post_id: postId!,
          language,
          title,
          excerpt: text(formData.get(`excerpt_${language}`)),
          content_html: text(formData.get(`content_${language}`)),
          seo_title: text(formData.get(`seo_title_${language}`)),
          seo_description: text(formData.get(`seo_description_${language}`)),
          is_complete: true,
        },
        { onConflict: 'post_id,language' },
      );
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: isNew ? 'created' : status === 'published' ? 'published' : 'updated',
      entityType: 'blog_post',
      entityId: postId!,
      entityLabel: titleEn,
      metadata: { status, slug },
    });

    if (status === 'published' && isNew) {
      await notifyAdmins({
        kind: 'blog',
        title: 'Article published',
        body: titleEn,
        href: `/admin/blog/${postId}`,
        severity: 'success',
      });
    }

    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error('[blog] save failed', error);
    return { ok: false, error: 'Could not save the article.' };
  }

  redirect(`/admin/blog/${postId}?saved=1`);
}

export async function setBlogPostStatus(
  id: string,
  status: 'draft' | 'published' | 'archived',
): Promise<SaveResult> {
  try {
    const admin = await assertCapability('blog');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase
      .from('blog_posts')
      .update({
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: status === 'published' ? 'published' : 'updated',
      entityType: 'blog_post',
      entityId: id,
      metadata: { status },
    });

    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    return { ok: false, error: 'Could not change the status.' };
  }
}

export async function deleteBlogPost(id: string): Promise<SaveResult> {
  try {
    const admin = await assertCapability('blog');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'deleted',
      entityType: 'blog_post',
      entityId: id,
    });

    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    return { ok: false, error: 'Could not delete the article.' };
  }

  redirect('/admin/blog');
}
