import { requireCapability } from '@/lib/auth/guard';
import { getEditorReferences } from '@/lib/admin/content';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { BlogForm } from '@/components/admin/blog/blog-form';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  await requireCapability('blog', 'manage');
  const references = await getEditorReferences();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Blog', href: '/admin/blog' }, { label: 'New' }]}
        title="New article"
        description="Drafts are invisible to visitors and excluded from the sitemap."
      />
      <BlogForm categories={references.categories} services={references.services} />
    </>
  );
}
