import { requireCapability } from '@/lib/auth/guard';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { IndustryForm } from '@/components/admin/industries/industry-form';

export const dynamic = 'force-dynamic';

export default async function NewIndustryPage() {
  await requireCapability('industries', 'manage');

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Industries', href: '/admin/industries' }, { label: 'New' }]}
        title="Add industry"
      />
      <IndustryForm />
    </>
  );
}
