'use server';

import { revalidatePath } from 'next/cache';
import { assertCapability, getAdminDb } from '@/lib/auth/guard';

/** Marks every unread admin notification as read (spec §78). */
export async function markNotificationsRead(): Promise<void> {
  await assertCapability('dashboard', 'view');

  const supabase = getAdminDb();
  if (!supabase) return;

  await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  revalidatePath('/admin', 'layout');
}
