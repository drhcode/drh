import { requireAdmin } from '@/lib/auth/guard';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminShell } from '@/components/admin/admin-shell';
import type { AdminNotification } from '@/components/admin/notification-center';
import { signOut } from '@/app/admin/actions/auth';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware confirms a session exists; this confirms the account is an
  // active admin and loads the role every page below relies on.
  const admin = await requireAdmin();

  const supabase = getSupabaseAdminClient();
  let notifications: AdminNotification[] = [];
  let unreadCount = 0;

  if (supabase) {
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15),
      supabase
        .from('admin_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false),
    ]);

    notifications = (data as AdminNotification[] | null) ?? [];
    unreadCount = count ?? 0;
  }

  return (
    <AdminShell
      admin={admin}
      notifications={notifications}
      unreadCount={unreadCount}
      signOutAction={signOut}
    >
      {children}
    </AdminShell>
  );
}
