import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { RedirectManager } from '@/components/admin/redirects/redirect-manager';
import type { RedirectRow } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminRedirectsPage() {
  const admin = await requireCapability('redirects');

  const supabase = getSupabaseAdminClient();
  const { data } = supabase
    ? await supabase.from('redirects').select('*').order('created_at', { ascending: false })
    : { data: [] };

  return (
    <>
      <AdminPageHeader
        title="Redirects"
        description="Applied in middleware on every request, with a one-minute cache. Loops are blocked before they can be saved."
      />
      <RedirectManager
        redirects={(data as RedirectRow[] | null) ?? []}
        canManage={can(admin.role, 'redirects', 'manage')}
      />
    </>
  );
}
