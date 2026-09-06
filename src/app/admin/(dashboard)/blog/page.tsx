import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listAdminBlogPosts } from '@/lib/admin/content';
import {
  AdminPageHeader,
  AdminPanel,
  ContentStatusBadge,
  EmptyState,
  TranslationStatus,
} from '@/components/admin/admin-ui';
import { BlogRowActions } from '@/components/admin/blog/blog-row-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const admin = await requireCapability('blog');
  const posts = await listAdminBlogPosts();
  const canManage = can(admin.role, 'blog', 'manage');

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Articles that bring search traffic and answer questions before the first call."
        actions={
          canManage && (
            <Button asChild size="sm">
              <Link href="/admin/blog/new">
                <Plus className="size-4" />
                New article
              </Link>
            </Button>
          )
        }
      />

      {posts.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<FileText className="size-5" />}
            title="No articles yet"
            description="Write the first article. Posts feed the homepage insights section and the blog index."
          />
        </AdminPanel>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const title =
                  post.translations.find((t) => t.language === 'en')?.title ?? post.slug;
                const scheduled =
                  post.status === 'published' &&
                  post.published_at &&
                  new Date(post.published_at) > new Date();

                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-medium text-foreground hover:text-accent"
                      >
                        {title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {post.reading_time} min read
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.categorySlug ?? '—'}
                    </TableCell>
                    <TableCell>
                      <TranslationStatus
                        translations={{
                          en: post.translations.some((t) => t.language === 'en'),
                          sq: post.translations.some((t) => t.language === 'sq'),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <ContentStatusBadge status={post.status} />
                        {scheduled && <Badge variant="warning">Scheduled</Badge>}
                        {post.featured && <Badge variant="accent">Featured</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <BlogRowActions
                        id={post.id}
                        slug={post.slug}
                        status={post.status}
                        canManage={canManage}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrapper>
      )}
    </>
  );
}
