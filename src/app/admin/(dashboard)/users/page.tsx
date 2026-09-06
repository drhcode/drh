import { requireCapability } from '@/lib/auth/guard';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { UserManager } from '@/components/admin/users/user-manager';
import type { AdminUserRow } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const admin = await requireCapability('users');

  const supabase = getSupabaseAdminClient();
  const { data } = supabase
    ? await supabase.from('admin_users').select('*').order('created_at')
    : { data: [] };

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Who can sign in to the admin, and what each of them is allowed to do."
      />
      <UserManager
        users={(data as AdminUserRow[] | null) ?? []}
        currentUserId={admin.id}
        isSuperAdmin={admin.role === 'super_admin'}
      />
    </>
  );
}
