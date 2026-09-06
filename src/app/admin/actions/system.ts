'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertCapability, getAdminDb, AuthorizationError } from '@/lib/auth/guard';
import { logActivity } from '@/lib/admin/audit';
import { defaultCompanySettings, type CompanySettings } from '@/content/seed/settings';
import type { UserRole } from '@/types/database';

/**
 * Settings, redirects, users and newsletter mutations
 * (spec §66, §73, §76, §80).
 */

export interface SystemResult {
  ok: boolean;
  error?: string;
}

const text = (raw: FormDataEntryValue | null): string => (typeof raw === 'string' ? raw.trim() : '');

function handle(error: unknown, message: string): SystemResult {
  if (error instanceof AuthorizationError) return { ok: false, error: error.message };
  console.error(`[system] ${message}`, error);
  return { ok: false, error: message };
}

// ─────────────────────────────────────────────────────────────────────────────
// Site settings (spec §73)
// ─────────────────────────────────────────────────────────────────────────────
export async function saveCompanySettings(formData: FormData): Promise<SystemResult> {
  try {
    const admin = await assertCapability('settings');

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const value: CompanySettings = {
      ...defaultCompanySettings,
      companyName: text(formData.get('companyName')) || defaultCompanySettings.companyName,
      tagline: text(formData.get('tagline')),
      email: text(formData.get('email')) || defaultCompanySettings.email,
      phone: text(formData.get('phone')),
      phoneDisplay: text(formData.get('phoneDisplay')),
      whatsapp: text(formData.get('whatsapp')).replace(/[^\d]/g, ''),
      address: text(formData.get('address')),
      mapsUrl: text(formData.get('mapsUrl')),
      location: text(formData.get('location')),
      serviceArea: text(formData.get('serviceArea')),
      businessHours: text(formData.get('businessHours')),
      footerText: text(formData.get('footerText')),
      copyright: text(formData.get('copyright')) || defaultCompanySettings.copyright,
      logo: text(formData.get('logo')),
      logoDark: text(formData.get('logoDark')),
      favicon: text(formData.get('favicon')),
      defaultOgImage: text(formData.get('defaultOgImage')),
      social: {
        instagram: text(formData.get('instagram')),
        linkedin: text(formData.get('linkedin')),
        facebook: text(formData.get('facebook')),
        github: text(formData.get('github')),
      },
    };

    const { error } = await supabase.from('site_settings').upsert(
      {
        key: 'company',
        value: value as unknown as Record<string, unknown>,
        updated_by: admin.id,
      },
      { onConflict: 'key' },
    );

    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'settings',
      entityId: 'company',
      entityLabel: 'Company settings',
    });

    revalidatePath('/admin/settings');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not save the settings.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Redirects (spec §66)
// ─────────────────────────────────────────────────────────────────────────────
const redirectSchema = z.object({
  source: z
    .string()
    .trim()
    .min(1)
    .max(400)
    .refine((value) => value.startsWith('/'), 'Source must start with /'),
  destination: z.string().trim().min(1).max(400),
  status_code: z.coerce.number().refine((value) => [301, 302, 307, 308].includes(value)),
  is_active: z.boolean(),
});

export async function saveRedirect(formData: FormData): Promise<SystemResult> {
  try {
    const admin = await assertCapability('redirects');

    const parsed = redirectSchema.safeParse({
      source: text(formData.get('source')),
      destination: text(formData.get('destination')),
      status_code: text(formData.get('status_code')) || 301,
      is_active: formData.get('is_active') === 'true',
    });

    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the values and retry.' };
    }

    const normalise = (path: string) =>
      path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

    // Direct self-reference (spec §66: prevent redirect loops).
    if (normalise(parsed.data.source) === normalise(parsed.data.destination)) {
      return { ok: false, error: 'A redirect cannot point at itself.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    // Two-step loop: the destination already redirects back to this source.
    const { data: existing } = await supabase
      .from('redirects')
      .select('source, destination')
      .eq('is_active', true);

    const rules = new Map(
      ((existing ?? []) as { source: string; destination: string }[]).map((rule) => [
        normalise(rule.source),
        normalise(rule.destination),
      ]),
    );
    rules.set(normalise(parsed.data.source), normalise(parsed.data.destination));

    let cursor = normalise(parsed.data.destination);
    for (let step = 0; step < 10; step += 1) {
      const next = rules.get(cursor);
      if (!next) break;
      if (next === normalise(parsed.data.source)) {
        return { ok: false, error: 'That would create a redirect loop.' };
      }
      cursor = next;
    }

    const id = text(formData.get('id'));
    const row = { ...parsed.data };

    if (id) {
      const { error } = await supabase.from('redirects').update(row).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('redirects').insert(row);
      if (error) {
        if (error.code === '23505') {
          return { ok: false, error: 'A redirect already exists for that source.' };
        }
        throw error;
      }
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: id ? 'updated' : 'created',
      entityType: 'redirect',
      entityId: id || parsed.data.source,
      entityLabel: `${parsed.data.source} → ${parsed.data.destination}`,
    });

    revalidatePath('/admin/redirects');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not save the redirect.');
  }
}

export async function deleteRedirect(id: string): Promise<SystemResult> {
  try {
    await assertCapability('redirects');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('redirects').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/redirects');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not delete the redirect.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Users (spec §80)
// ─────────────────────────────────────────────────────────────────────────────
const ROLES: UserRole[] = ['super_admin', 'admin', 'editor', 'marketing'];

export async function inviteUser(formData: FormData): Promise<SystemResult> {
  try {
    const admin = await assertCapability('users');
    if (admin.role !== 'super_admin') {
      return { ok: false, error: 'Only a super admin can invite users.' };
    }

    const email = text(formData.get('email')).toLowerCase();
    const fullName = text(formData.get('full_name'));
    const role = text(formData.get('role')) as UserRole;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return { ok: false, error: 'Enter a valid email address.' };
    }
    if (!ROLES.includes(role)) return { ok: false, error: 'Choose a valid role.' };

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    // Supabase sends the invitation email and creates the auth user; the
    // database trigger mirrors it into admin_users with this role, active.
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || email.split('@')[0], role, is_active: true },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/login`,
    });

    if (error) return { ok: false, error: error.message };

    // The trigger runs with defaults; make sure the chosen role sticks.
    if (data.user) {
      await supabase
        .from('admin_users')
        .upsert(
          {
            id: data.user.id,
            email,
            full_name: fullName || email.split('@')[0],
            role,
            is_active: true,
          },
          { onConflict: 'id' },
        );
    }

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'invited',
      entityType: 'admin_user',
      entityId: data.user?.id ?? email,
      entityLabel: email,
      metadata: { role },
    });

    revalidatePath('/admin/users');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not send the invitation.');
  }
}

export async function updateUser(input: {
  id: string;
  role?: UserRole;
  isActive?: boolean;
}): Promise<SystemResult> {
  try {
    const admin = await assertCapability('users');
    if (admin.role !== 'super_admin') {
      return { ok: false, error: 'Only a super admin can change team members.' };
    }

    if (input.id === admin.id && input.isActive === false) {
      return { ok: false, error: 'You cannot deactivate your own account.' };
    }
    if (input.id === admin.id && input.role && input.role !== 'super_admin') {
      return { ok: false, error: 'You cannot remove your own super admin role.' };
    }

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const patch: Record<string, unknown> = {};
    if (input.role) patch.role = input.role;
    if (input.isActive !== undefined) patch.is_active = input.isActive;
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase.from('admin_users').update(patch).eq('id', input.id);
    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'admin_user',
      entityId: input.id,
      metadata: patch,
    });

    revalidatePath('/admin/users');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not update the user.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Newsletter (spec §76)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateSubscriberStatus(
  id: string,
  status: 'pending' | 'subscribed' | 'unsubscribed',
): Promise<SystemResult> {
  try {
    await assertCapability('newsletter');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status,
        confirmed_at: status === 'subscribed' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/newsletter');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not update the subscriber.');
  }
}

export async function deleteSubscriber(id: string): Promise<SystemResult> {
  try {
    await assertCapability('newsletter');
    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/newsletter');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not delete the subscriber.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO overrides (spec §65)
// ─────────────────────────────────────────────────────────────────────────────
export async function saveSeoOverride(formData: FormData): Promise<SystemResult> {
  try {
    const admin = await assertCapability('seo');

    const path = text(formData.get('path'));
    if (!path.startsWith('/')) return { ok: false, error: 'Path must start with /.' };

    const supabase = getAdminDb();
    if (!supabase) return { ok: false, error: 'Database is not configured.' };

    const { error } = await supabase.from('seo_settings').upsert(
      {
        path,
        language: text(formData.get('language')) === 'sq' ? 'sq' : 'en',
        seo_title: text(formData.get('seo_title')) || null,
        seo_description: text(formData.get('seo_description')) || null,
        og_title: text(formData.get('og_title')) || null,
        og_description: text(formData.get('og_description')) || null,
        og_image: text(formData.get('og_image')) || null,
        canonical_url: text(formData.get('canonical_url')) || null,
        is_indexable: formData.get('is_indexable') === 'true',
      },
      { onConflict: 'path,language' },
    );

    if (error) throw error;

    await logActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'updated',
      entityType: 'seo_setting',
      entityId: path,
      entityLabel: path,
    });

    revalidatePath('/admin/seo');
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return handle(error, 'Could not save the SEO override.');
  }
}
