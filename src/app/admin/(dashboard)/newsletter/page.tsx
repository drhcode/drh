import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader, StatCard } from '@/components/admin/admin-ui';
import { SubscriberTable } from '@/components/admin/newsletter/subscriber-table';
import { formatNumber } from '@/lib/utils';
import type { NewsletterSubscriberRow } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const admin = await requireCapability('newsletter');

  const supabase = getSupabaseAdminClient();
  const { data } = supabase
    ? await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)
    : { data: [] };

  const subscribers = (data as NewsletterSubscriberRow[] | null) ?? [];
  const confirmed = subscribers.filter((s) => s.status === 'subscribed').length;
  const pending = subscribers.filter((s) => s.status === 'pending').length;

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description="Double opt-in: an address is only counted once the confirmation link is clicked."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Confirmed" value={formatNumber(confirmed)} />
        <StatCard label="Awaiting confirmation" value={formatNumber(pending)} />
        <StatCard label="Total records" value={formatNumber(subscribers.length)} />
      </div>

      <SubscriberTable
        subscribers={subscribers}
        canManage={can(admin.role, 'newsletter', 'manage')}
      />
    </>
  );
}
