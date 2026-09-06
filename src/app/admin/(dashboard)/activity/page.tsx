import { requireCapability } from '@/lib/auth/guard';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader, AdminPanel, EmptyState } from '@/components/admin/admin-ui';
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
import type { ActivityLogRow } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminActivityPage() {
  await requireCapability('activity');

  const supabase = getSupabaseAdminClient();
  const { data } = supabase
    ? await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
    : { data: [] };

  const entries = (data as ActivityLogRow[] | null) ?? [];

  return (
    <>
      <AdminPageHeader
        title="Activity log"
        description="Who changed what, and when. Sign-ins, content changes and deletions are all recorded."
      />

      {entries.length === 0 ? (
        <AdminPanel>
          <EmptyState title="Nothing recorded yet" description="Admin actions appear here." />
        </AdminPanel>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString('en-GB')}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {entry.actor_email ?? 'system'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.entity_type}
                    {entry.entity_label && (
                      <span className="block text-xs text-subtle-foreground">
                        {entry.entity_label}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64 truncate font-mono text-[11px] text-subtle-foreground">
                    {entry.metadata ? JSON.stringify(entry.metadata) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      )}
    </>
  );
}
