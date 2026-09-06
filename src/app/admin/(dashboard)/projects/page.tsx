import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, Plus } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listAdminProjects } from '@/lib/admin/content';
import {
  AdminPageHeader,
  AdminPanel,
  ContentStatusBadge,
  EmptyState,
  TranslationStatus,
} from '@/components/admin/admin-ui';
import { ProjectRowActions } from '@/components/admin/projects/project-row-actions';
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

export default async function AdminProjectsPage() {
  const admin = await requireCapability('projects');
  const projects = await listAdminProjects();
  const canManage = can(admin.role, 'projects', 'manage');

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="The portfolio. Featured projects appear on the homepage automatically."
        actions={
          canManage && (
            <Button asChild size="sm">
              <Link href="/admin/projects/new">
                <Plus className="size-4" />
                Add project
              </Link>
            </Button>
          )
        }
      />

      {projects.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<Briefcase className="size-5" />}
            title="No projects yet"
            description="Add your first case study. Projects drive the homepage, the work grid, service pages and industry pages."
            action={
              canManage && (
                <Button asChild size="sm">
                  <Link href="/admin/projects/new">
                    <Plus className="size-4" />
                    Add project
                  </Link>
                </Button>
              )
            }
          />
        </AdminPanel>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Project</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const title =
                  project.translations.find((t) => t.language === 'en')?.title ?? project.slug;

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-surface-sunken">
                          {project.cover_image && (
                            <Image
                              src={project.cover_image}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="block truncate font-medium text-foreground hover:text-accent"
                          >
                            {project.client_name}
                          </Link>
                          <span className="block truncate text-xs text-muted-foreground">
                            {title}
                          </span>
                        </div>
                        {project.featured && <Badge variant="accent">Featured</Badge>}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {project.industrySlug ?? '—'}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {project.project_date
                        ? new Date(project.project_date).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <TranslationStatus
                        translations={{
                          en: project.translations.some((t) => t.language === 'en'),
                          sq: project.translations.some((t) => t.language === 'sq'),
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <ContentStatusBadge status={project.status} />
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {project.updated_at
                        ? new Date(project.updated_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : '—'}
                    </TableCell>

                    <TableCell className="text-right">
                      <ProjectRowActions
                        id={project.id}
                        slug={project.slug}
                        status={project.status}
                        featured={project.featured}
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
