'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity } from '@/lib/admin/audit';
import type { MediaKind, MediaRow } from '@/types/database';

/**
 * Media library (spec §56, §82).
 *
 * Upload rules:
 *   • allow-list of MIME types AND extensions — both must match
 *   • a generated filename; the uploaded name is never used as a storage path
 *   • a hard size ceiling per kind
 *   • `contentType` is set explicitly and the bucket serves with
 *     Content-Disposition from Supabase, so nothing uploaded can execute
 */

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

const DOC_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

const MAX_BYTES: Record<MediaKind, number> = {
  image: 8 * 1024 * 1024,
  document: 20 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

export interface MediaActionResult {
  ok: boolean;
  error?: string;
  media?: MediaRow;
}

function classify(mimeType: string): { kind: MediaKind; extension: string } | null {
  if (IMAGE_TYPES[mimeType]) return { kind: 'image', extension: IMAGE_TYPES[mimeType] };
  if (DOC_TYPES[mimeType]) return { kind: 'document', extension: DOC_TYPES[mimeType] };
  if (VIDEO_TYPES[mimeType]) return { kind: 'video', extension: VIDEO_TYPES[mimeType] };
  return null;
}

function fail(error: unknown): MediaActionResult {
  if (error instanceof AuthorizationError) return { ok: false, error: error.message };
  console.error('[media] action failed', error);
  return { ok: false, error: 'Upload failed. Please try again.' };
}

export async function uploadMedia(formData: FormData): Promise<MediaActionResult> {
  try {
    const admin = await assertCapability('media');

    const file = formData.get('file');
    const folder = (formData.get('folder') as string | null)?.trim() || 'general';
    const altEn = ((formData.get('alt_en') as string | null) ?? '').trim() || null;

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: 'Choose a file to upload.' };
    }

    const classified = classify(file.type);
    if (!classified) {
      return {
        ok: false,
        error: 'Unsupported file type. Images (JPG, PNG, WebP, AVIF, SVG), PDF, DOC, DOCX, MP4 and WebM are accepted.',
      };
    }

    // The extension must agree with the declared MIME type — a .php renamed to
    // .png would fail here even if the browser reported an image type.
    const declaredExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const allowedForKind =
      classified.kind === 'image'
        ? Object.values(IMAGE_TYPES)
        : classified.kind === 'document'
          ? Object.values(DOC_TYPES)
          : Object.values(VIDEO_TYPES);

    if (!allowedForKind.includes(declaredExtension)) {
      return { ok: false, error: 'The file extension does not match its content type.' };
    }

    if (file.size > MAX_BYTES[classified.kind]) {
      const limit = Math.round(MAX_BYTES[classified.kind] / (1024 * 1024));
      return { ok: false, error: `That file is larger than the ${limit} MB limit.` };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Storage is not configured.' };

    const safeFolder = folder.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40) || 'general';
    const path = `${safeFolder}/${randomUUID()}${classified.extension}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' });

    if (uploadError) return { ok: false, error: uploadError.message };

    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(path);

    const { data, error } = await supabase
      .from('media')
      .insert({
        bucket: 'media',
        path,
        url: publicUrl,
        kind: classified.kind,
        mime_type: file.type,
        file_name: file.name.slice(0, 160),
        size_bytes: file.size,
        alt_en: altEn,
        folder: safeFolder,
        uploaded_by: admin.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'created',
      entityType: 'media',
      entityId: (data as MediaRow).id,
      entityLabel: file.name,
    });

    revalidatePath('/admin/media');
    return { ok: true, media: data as MediaRow };
  } catch (error) {
    return fail(error);
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string().trim().min(1).max(160),
  alt_en: z.string().trim().max(300).nullable(),
  alt_sq: z.string().trim().max(300).nullable(),
  folder: z.string().trim().max(40),
});

export async function updateMedia(input: {
  id: string;
  file_name: string;
  alt_en: string | null;
  alt_sq: string | null;
  folder: string;
}): Promise<MediaActionResult> {
  try {
    const admin = await assertCapability('media');
    const parsed = updateSchema.parse(input);

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Storage is not configured.' };

    const { error } = await supabase
      .from('media')
      .update({
        file_name: parsed.file_name,
        alt_en: parsed.alt_en,
        alt_sq: parsed.alt_sq,
        folder: parsed.folder.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'general',
      })
      .eq('id', parsed.id);

    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'media',
      entityId: parsed.id,
      entityLabel: parsed.file_name,
    });

    revalidatePath('/admin/media');
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMedia(id: string): Promise<MediaActionResult> {
  try {
    const admin = await assertCapability('media');

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Storage is not configured.' };

    const { data } = await supabase
      .from('media')
      .select('path, file_name')
      .eq('id', id)
      .maybeSingle();

    const record = data as { path: string; file_name: string } | null;
    if (record) {
      await supabase.storage.from('media').remove([record.path]);
    }

    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'deleted',
      entityType: 'media',
      entityId: id,
      entityLabel: record?.file_name ?? id,
    });

    revalidatePath('/admin/media');
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Media list for the library grid and the picker dialog. */
export async function listMedia(options: {
  kind?: MediaKind;
  folder?: string;
  query?: string;
  limit?: number;
} = {}): Promise<MediaRow[]> {
  await assertCapability('media', 'view');

  const supabase = getAdminDb();
  if (!supabase) return [];

  let query = supabase.from('media').select('*');

  if (options.kind) query = query.eq('kind', options.kind);
  if (options.folder && options.folder !== 'all') query = query.eq('folder', options.folder);
  if (options.query) {
    const safe = options.query.replace(/[,()%*]/g, ' ').trim();
    if (safe) query = query.ilike('file_name', `%${safe}%`);
  }

  const { data } = await query
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 120);

  return (data as MediaRow[] | null) ?? [];
}
