import { requireCapability } from '@/lib/auth/guard';
import { getEditorReferences } from '@/lib/admin/content';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { ServiceForm } from '@/components/admin/services/service-form';

export const dynamic = 'force-dynamic';

export default async function NewServicePage() {
  await requireCapability('services', 'manage');
  const references = await getEditorReferences();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Services', href: '/admin/services' }, { label: 'New' }]}
        title="Add service"
      />
      <ServiceForm technologies={references.technologies} />
    </>
  );
}
