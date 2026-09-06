'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity } from '@/lib/admin/audit';
import { slugify } from '@/lib/utils';
import type { AdminResource } from '@/lib/auth/permissions';

/**
 * Services, industries, testimonials, FAQs and pages (spec §59–§64).
 *
 * These share one shape — a parent row plus per-language translations — so they
 * share these helpers rather than repeating the same upsert five times.
 */

export interface SaveResult {
  ok: boolean;
  error?: string;
}

const text = (raw: FormDataEntryValue | null): string | null => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value === '' ? null : value;
};

const bool = (raw: FormDataEntryValue | null): boolean => raw === 'true' || raw === 'on';

const num = (raw: FormDataEntryValue | null, fallback = 0): number => {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

function json<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Drops empty rows from a repeatable field before storing it. */
function cleanPairs(items: { title?: string; body?: string }[]) {
  return items.filter((item) => (item.title ?? '').trim() || (item.body ?? '').trim());
}

function handle(error: unknown, message: string): SaveResult {
  if (error instanceof AuthorizationError) return { ok: false, error: error.message };
  console.error(`[content] ${message}`, error);
  return { ok: false, error: message };
}

// ─────────────────────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────────────────────
export async function saveService(formData: FormData): Promise<SaveResult> {
  let serviceId = text(formData.get('id'));

  try {
    const admin = await assertCapability('services');
    const slug = slugify(String(formData.get('slug') ?? ''));
    const titleEn = text(formData.get('title_en'));

    if (!slug || !titleEn) return { ok: false, error: 'An English title and slug are required.' };

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const row = {
      slug,
      icon_key: text(formData.get('icon_key')),
      cover_image: text(formData.get('cover_image')),
      status: String(formData.get('status') ?? 'draft'),
      featured: bool(formData.get('featured')),
      sort_order: num(formData.get('sort_order')),
    };

    if (!serviceId) {
      const { data, error } = await supabase.from('services').insert(row).select('id').single();
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
      serviceId = data.id as string;
    } else {
      const { error } = await supabase.from('services').update(row).eq('id', serviceId);
      if (error) throw error;
    }

    for (const language of ['en', 'sq'] as const) {
      const title = text(formData.get(`title_${language}`));

      if (!title) {
        await supabase
          .from('service_translations')
          .delete()
          .eq('service_id', serviceId)
          .eq('language', language);
        continue;
      }

      await supabase.from('service_translations').upsert(
        {
          service_id: serviceId,
          language,
          title,
          headline: text(formData.get(`headline_${language}`)),
          short_description: text(formData.get(`short_description_${language}`)),
          full_description: text(formData.get(`full_description_${language}`)),
          benefits: cleanPairs(json(formData.get(`benefits_${language}`), [])),
          features: json<string[]>(formData.get(`features_${language}`), [])
            .map((feature) => (typeof feature === 'string' ? feature : String(feature)))
            .filter(Boolean),
          process: json(formData.get(`process_${language}`), []),
          cta_title: text(formData.get(`cta_title_${language}`)),
          cta_body: text(formData.get(`cta_body_${language}`)),
          seo_title: text(formData.get(`seo_title_${language}`)),
          seo_description: text(formData.get(`seo_description_${language}`)),
          is_complete: true,
        },
        { onConflict: 'service_id,language' },
      );
    }

    // Technologies join
    const slugs = json<string[]>(formData.get('technologies'), []);
    await supabase.from('service_technologies').delete().eq('service_id', serviceId);
    if (slugs.length > 0) {
      const { data } = await supabase.from('technologies').select('id, slug').in('slug', slugs);
      const rows = ((data ?? []) as { id: string }[]).map((technology) => ({
        service_id: serviceId!,
        technology_id: technology.id,
      }));
      if (rows.length > 0) await supabase.from('service_technologies').insert(rows);
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'service',
      entityId: serviceId,
      entityLabel: titleEn,
    });

    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
  } catch (error) {
    return handle(error, 'Could not save the service.');
  }

  redirect(`/admin/services/${serviceId}?saved=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Industries
// ─────────────────────────────────────────────────────────────────────────────
export async function saveIndustry(formData: FormData): Promise<SaveResult> {
  let industryId = text(formData.get('id'));

  try {
    const admin = await assertCapability('industries');
    const slug = slugify(String(formData.get('slug') ?? ''));
    const titleEn = text(formData.get('title_en'));

    if (!slug || !titleEn) return { ok: false, error: 'An English title and slug are required.' };

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const row = {
      slug,
      icon_key: text(formData.get('icon_key')),
      cover_image: text(formData.get('cover_image')),
      status: String(formData.get('status') ?? 'draft'),
      featured: bool(formData.get('featured')),
      sort_order: num(formData.get('sort_order')),
    };

    if (!industryId) {
      const { data, error } = await supabase.from('industries').insert(row).select('id').single();
      if (error) {
        if (error.code === '23505') return { ok: false, error: 'That slug is already in use.' };
        throw error;
      }
      industryId = data.id as string;
    } else {
      const { error } = await supabase.from('industries').update(row).eq('id', industryId);
      if (error) throw error;
    }

    for (const language of ['en', 'sq'] as const) {
      const title = text(formData.get(`title_${language}`));

      if (!title) {
        await supabase
          .from('industry_translations')
          .delete()
          .eq('industry_id', industryId)
          .eq('language', language);
        continue;
      }

      await supabase.from('industry_translations').upsert(
        {
          industry_id: industryId,
          language,
          title,
          hero_title: text(formData.get(`hero_title_${language}`)),
          hero_subtitle: text(formData.get(`hero_subtitle_${language}`)),
          description: text(formData.get(`description_${language}`)),
          problems: cleanPairs(json(formData.get(`problems_${language}`), [])),
          solutions: cleanPairs(json(formData.get(`solutions_${language}`), [])),
          cta_title: text(formData.get(`cta_title_${language}`)),
          cta_body: text(formData.get(`cta_body_${language}`)),
          seo_title: text(formData.get(`seo_title_${language}`)),
          seo_description: text(formData.get(`seo_description_${language}`)),
          is_complete: true,
        },
        { onConflict: 'industry_id,language' },
      );
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'industry',
      entityId: industryId,
      entityLabel: titleEn,
    });

    revalidatePath('/admin/industries');
    revalidatePath('/', 'layout');
  } catch (error) {
    return handle(error, 'Could not save the industry.');
  }

  redirect(`/admin/industries/${industryId}?saved=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials (spec §61)
// ─────────────────────────────────────────────────────────────────────────────
export async function saveTestimonial(formData: FormData): Promise<SaveResult> {
  let id = text(formData.get('id'));

  try {
    const admin = await assertCapability('testimonials');

    const clientName = text(formData.get('client_name'));
    const quoteEn = text(formData.get('quote_en'));
    if (!clientName || !quoteEn) {
      return { ok: false, error: 'A client name and an English quote are required.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const ratingRaw = text(formData.get('rating'));
    const row = {
      client_name: clientName,
      position: text(formData.get('position')),
      company: text(formData.get('company')),
      country: text(formData.get('country')),
      photo_url: text(formData.get('photo_url')),
      logo_url: text(formData.get('logo_url')),
      rating: ratingRaw ? Math.min(5, Math.max(1, Number(ratingRaw))) : null,
      quote_en: quoteEn,
      quote_sq: text(formData.get('quote_sq')),
      project_id: text(formData.get('project_id')),
      featured: bool(formData.get('featured')),
      is_active: bool(formData.get('is_active')),
      sort_order: num(formData.get('sort_order')),
    };

    if (!id) {
      const { data, error } = await supabase.from('testimonials').insert(row).select('id').single();
      if (error) throw error;
      id = data.id as string;
    } else {
      const { error } = await supabase.from('testimonials').update(row).eq('id', id);
      if (error) throw error;
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'testimonial',
      entityId: id,
      entityLabel: clientName,
    });

    revalidatePath('/admin/testimonials');
    revalidatePath('/', 'layout');
  } catch (error) {
    return handle(error, 'Could not save the testimonial.');
  }

  redirect('/admin/testimonials?saved=1');
}

export async function deleteTestimonial(id: string): Promise<SaveResult> {
  try {
    const admin = await assertCapability('testimonials');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'deleted',
      entityType: 'testimonial',
      entityId: id,
    });

    revalidatePath('/admin/testimonials');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not delete the testimonial.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQs (spec §62)
// ─────────────────────────────────────────────────────────────────────────────
export async function saveFaq(formData: FormData): Promise<SaveResult> {
  try {
    const admin = await assertCapability('faqs');

    const questionEn = text(formData.get('question_en'));
    const answerEn = text(formData.get('answer_en'));
    if (!questionEn || !answerEn) {
      return { ok: false, error: 'An English question and answer are required.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const id = text(formData.get('id'));
    const row = {
      category: text(formData.get('category')) ?? 'general',
      question_en: questionEn,
      answer_en: answerEn,
      question_sq: text(formData.get('question_sq')),
      answer_sq: text(formData.get('answer_sq')),
      service_id: text(formData.get('service_id')),
      industry_id: text(formData.get('industry_id')),
      sort_order: num(formData.get('sort_order')),
      is_active: bool(formData.get('is_active')),
    };

    if (!id) {
      const { error } = await supabase.from('faqs').insert(row);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('faqs').update(row).eq('id', id);
      if (error) throw error;
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: id ? 'updated' : 'created',
      entityType: 'faq',
      entityId: id,
      entityLabel: questionEn,
    });

    revalidatePath('/admin/faqs');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not save the FAQ.');
  }
}

export async function deleteFaq(id: string): Promise<SaveResult> {
  try {
    await assertCapability('faqs');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/faqs');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not delete the FAQ.');
  }
}

/** Shared status toggle for services and industries. */
export async function setContentStatus(
  resource: Extract<AdminResource, 'services' | 'industries'>,
  id: string,
  status: 'draft' | 'published' | 'archived',
): Promise<SaveResult> {
  try {
    await assertCapability(resource);
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const table = resource === 'services' ? 'services' : 'industries';
    const { error } = await supabase.from(table).update({ status }).eq('id', id);
    if (error) throw error;

    revalidatePath(`/admin/${resource}`);
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not change the status.');
  }
}
