import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guard';
import { getAdminProject, getEditorReferences } from '@/lib/admin/content';
import { AdminPageHeader, ContentStatusBadge } from '@/components/admin/admin-ui';
import { ProjectForm } from '@/components/admin/projects/project-form';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProjectPage({ params, searchParams }: Props) {
  await requireCapability('projects', 'manage');
  const { id } = await params;
  const { saved } = await searchParams;

  const [record, references] = await Promise.all([getAdminProject(id), getEditorReferences()]);
  if (!record) notFound();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Projects', href: '/admin/projects' },
          { label: record.project.client_name },
        ]}
        title={record.project.client_name}
        description={`/work/${record.project.slug}`}
        actions={
          <>
            <ContentStatusBadge status={record.project.status} />
            <Button asChild variant="outline" size="sm">
              <a href={`/work/${record.project.slug}`} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </Button>
          </>
        }
      />

      {saved && (
        <p
          role="status"
          className="mb-6 rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-success"
        >
          Project saved.
        </p>
      )}

      <ProjectForm
        project={record.project}
        translations={record.translations}
        media={record.media}
        results={record.results}
        technologySlugs={record.technologySlugs}
        serviceSlugs={record.serviceSlugs}
        references={references}
      />
    </>
  );
}
