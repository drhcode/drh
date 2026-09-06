import Link from 'next/link';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { requireCapability } from '@/lib/auth/guard';
import { runSeoAudit, WARNING_LABELS, WARNING_SEVERITY } from '@/lib/admin/seo-audit';
import { AdminPageHeader, AdminPanel, StatCard } from '@/components/admin/admin-ui';
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
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminSeoPage() {
  await requireCapability('seo');
  const rows = await runSeoAudit();

  const withIssues = rows.filter((row) => row.warnings.length > 0);
  const errors = rows.filter((row) =>
    row.warnings.some((warning) => WARNING_SEVERITY[warning] === 'error'),
  );
  const noindex = rows.filter((row) => !row.isIndexable);

  return (
    <>
      <AdminPageHeader
        title="SEO"
        description="Every indexable page, audited against the checks that actually move rankings."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pages audited" value={formatNumber(rows.length)} />
        <StatCard label="Pages with issues" value={formatNumber(withIssues.length)} />
        <StatCard label="Critical issues" value={formatNumber(errors.length)} />
        <StatCard label="Set to noindex" value={formatNumber(noindex.length)} />
      </div>

      {withIssues.length === 0 ? (
        <AdminPanel>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-success/12 text-success">
              <CheckCircle2 className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">No SEO issues found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Every page has a title, a description and a social image, and nothing is accidentally
              set to noindex.
            </p>
          </div>
        </AdminPanel>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Page</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.language}-${row.path}`}>
                  <TableCell>
                    <a
                      href={row.language === 'en' ? row.path : `/${row.language}${row.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-foreground hover:text-accent"
                    >
                      {row.path}
                      <ExternalLink className="size-3 text-subtle-foreground" />
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground">
                    {row.language}
                  </TableCell>
                  <TableCell className="max-w-56">
                    <span className="block truncate text-xs text-foreground" title={row.title ?? ''}>
                      {row.title ?? '—'}
                    </span>
                    {row.title && (
                      <span className="text-[10px] tabular-nums text-subtle-foreground">
                        {row.title.length} chars
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64">
                    <span
                      className="block truncate text-xs text-muted-foreground"
                      title={row.description ?? ''}
                    >
                      {row.description ?? '—'}
                    </span>
                    {row.description && (
                      <span className="text-[10px] tabular-nums text-subtle-foreground">
                        {row.description.length} chars
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.warnings.length === 0 ? (
                      <Badge variant="success">OK</Badge>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {row.warnings.map((warning) => (
                          <Badge
                            key={warning}
                            variant={
                              WARNING_SEVERITY[warning] === 'error'
                                ? 'danger'
                                : WARNING_SEVERITY[warning] === 'warning'
                                  ? 'warning'
                                  : 'outline'
                            }
                          >
                            {WARNING_LABELS[warning]}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.editHref ? (
                      <Link
                        href={row.editHref}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Edit
                      </Link>
                    ) : (
                      <span className="text-xs text-subtle-foreground">In code</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      )}

      <AdminPanel title="What is checked" className="mt-6">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {(Object.keys(WARNING_LABELS) as (keyof typeof WARNING_LABELS)[]).map((warning) => (
            <div key={warning} className="flex items-start gap-2.5">
              <Badge
                variant={
                  WARNING_SEVERITY[warning] === 'error'
                    ? 'danger'
                    : WARNING_SEVERITY[warning] === 'warning'
                      ? 'warning'
                      : 'outline'
                }
              >
                {WARNING_SEVERITY[warning]}
              </Badge>
              <span className="text-sm text-muted-foreground">{WARNING_LABELS[warning]}</span>
            </div>
          ))}
        </dl>
      </AdminPanel>
    </>
  );
}
