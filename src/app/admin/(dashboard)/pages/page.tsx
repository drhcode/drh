import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listAdminPages } from '@/lib/admin/content';
import {
  AdminPageHeader,
  ContentStatusBadge,
  TranslationStatus,
} from '@/components/admin/admin-ui';
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

export default async function AdminPagesPage() {
  const admin = await requireCapability('pages');
  const pages = await listAdminPages();
  const canManage = can(admin.role, 'pages', 'manage');

  return (
    <>
      <AdminPageHeader
        title="Pages"
        description="Homepage, About, Contact and the SEO landing pages — built from a fixed set of designed sections."
        actions={
          canManage && (
            <Button asChild size="sm">
              <Link href="/admin/pages/new">
                <Plus className="size-4" />
                New landing page
              </Link>
            </Button>
          )
        }
      />

      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Page</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => {
              const en = page.translations.find((t) => t.language === 'en');
              const path = page.slug === 'home' ? '/' : `/${page.slug}`;

              return (
                <TableRow key={page.id}>
                  <TableCell>
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {en?.title ?? page.slug}
                    </Link>
                    {page.kind === 'system' && (
                      <Badge variant="outline" className="ml-2">
                        System
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{path}</TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {en?.sections?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <TranslationStatus
                      translations={{
                        en: page.translations.some((t) => t.language === 'en'),
                        sq: page.translations.some((t) => t.language === 'sq'),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ContentStatusBadge status={page.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableWrapper>
    </>
  );
}
