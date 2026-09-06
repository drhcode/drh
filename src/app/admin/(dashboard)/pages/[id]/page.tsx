import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guard';
import { getAdminPage } from '@/lib/admin/content';
import { AdminPageHeader, ContentStatusBadge } from '@/components/admin/admin-ui';
import { PageForm } from '@/components/admin/pages/page-form';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditPagePage({ params, searchParams }: Props) {
  await requireCapability('pages', 'manage');
  const { id } = await params;
  const { saved } = await searchParams;

  const page = await getAdminPage(id);
  if (!page) notFound();

  const title = page.translations.find((t) => t.language === 'en')?.title ?? page.slug;
  const path = page.slug === 'home' ? '/' : `/${page.slug}`;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Pages', href: '/admin/pages' }, { label: title }]}
        title={title}
        description={path}
        actions={
          <>
            <ContentStatusBadge status={page.status} />
            <Button asChild variant="outline" size="sm">
              <a href={path} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </Button>
          </>
        }
      />

      {saved && (
        <p role="status" className="mb-6 rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
          Page saved.
        </p>
      )}

      <PageForm page={page} translations={page.translations} />
    </>
  );
}
