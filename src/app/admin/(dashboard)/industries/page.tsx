import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listAdminIndustries } from '@/lib/admin/content';
import {
  AdminPageHeader,
  ContentStatusBadge,
  TranslationStatus,
} from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
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

export default async function AdminIndustriesPage() {
  const admin = await requireCapability('industries');
  const industries = await listAdminIndustries();
  const canManage = can(admin.role, 'industries', 'manage');

  return (
    <>
      <AdminPageHeader
        title="Industries"
        description="Sector pages that connect a visitor's world to the services that fix it."
        actions={
          canManage && (
            <Button asChild size="sm">
              <Link href="/admin/industries/new">
                <Plus className="size-4" />
                Add industry
              </Link>
            </Button>
          )
        }
      />

      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Industry</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {industries.map((industry) => {
              const title =
                industry.translations.find((t) => t.language === 'en')?.title ?? industry.slug;

              return (
                <TableRow key={industry.id}>
                  <TableCell>
                    <Link
                      href={`/admin/industries/${industry.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {title}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    /industries/{industry.slug}
                  </TableCell>
                  <TableCell>
                    <TranslationStatus
                      translations={{
                        en: industry.translations.some((t) => t.language === 'en'),
                        sq: industry.translations.some((t) => t.language === 'sq'),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ContentStatusBadge status={industry.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {industry.sort_order}
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
