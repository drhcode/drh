import { requireCapability } from '@/lib/auth/guard';
import { getEditorReferences } from '@/lib/admin/content';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { ProjectForm } from '@/components/admin/projects/project-form';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  await requireCapability('projects', 'manage');
  const references = await getEditorReferences();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Projects', href: '/admin/projects' }, { label: 'New' }]}
        title="Add project"
        description="Save as a draft first — nothing appears on the site until it is published."
      />
      <ProjectForm references={references} />
    </>
  );
}
