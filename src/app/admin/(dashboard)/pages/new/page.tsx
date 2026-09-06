import { requireCapability } from '@/lib/auth/guard';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { PageForm } from '@/components/admin/pages/page-form';

export const dynamic = 'force-dynamic';

export default async function NewPagePage() {
  await requireCapability('pages', 'manage');

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Pages', href: '/admin/pages' }, { label: 'New' }]}
        title="New landing page"
        description="Landing pages live at the site root. Give each one genuinely unique content — near-duplicate city pages hurt rankings rather than helping them."
      />
      <PageForm />
    </>
  );
}
