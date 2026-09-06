import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guard';
import { getAdminBlogPost, getEditorReferences } from '@/lib/admin/content';
import { AdminPageHeader, ContentStatusBadge } from '@/components/admin/admin-ui';
import { BlogForm } from '@/components/admin/blog/blog-form';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditBlogPostPage({ params, searchParams }: Props) {
  await requireCapability('blog', 'manage');
  const { id } = await params;
  const { saved } = await searchParams;

  const [record, references] = await Promise.all([getAdminBlogPost(id), getEditorReferences()]);
  if (!record) notFound();

  const title = record.translations.find((t) => t.language === 'en')?.title ?? record.post.slug;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Blog', href: '/admin/blog' }, { label: title }]}
        title={title}
        description={`/blog/${record.post.slug} · ${record.post.reading_time} min read`}
        actions={
          <>
            <ContentStatusBadge status={record.post.status} />
            <Button asChild variant="outline" size="sm">
              <a href={`/blog/${record.post.slug}`} target="_blank" rel="noopener noreferrer">
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
          Article saved.
        </p>
      )}

      <BlogForm
        post={record.post}
        translations={record.translations}
        categories={references.categories}
        services={references.services}
      />
    </>
  );
}
