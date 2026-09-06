import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listAdminServices } from '@/lib/admin/content';
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

export default async function AdminServicesPage() {
  const admin = await requireCapability('services');
  const services = await listAdminServices();
  const canManage = can(admin.role, 'services', 'manage');

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Each service has its own page, mega-menu entry and homepage card."
        actions={
          canManage && (
            <Button asChild size="sm">
              <Link href="/admin/services/new">
                <Plus className="size-4" />
                Add service
              </Link>
            </Button>
          )
        }
      />

      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Service</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => {
              const title =
                service.translations.find((t) => t.language === 'en')?.title ?? service.slug;

              return (
                <TableRow key={service.id}>
                  <TableCell>
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {title}
                    </Link>
                    {service.featured && (
                      <Badge variant="accent" className="ml-2">
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    /services/{service.slug}
                  </TableCell>
                  <TableCell>
                    <TranslationStatus
                      translations={{
                        en: service.translations.some((t) => t.language === 'en'),
                        sq: service.translations.some((t) => t.language === 'sq'),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ContentStatusBadge status={service.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {service.sort_order}
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
