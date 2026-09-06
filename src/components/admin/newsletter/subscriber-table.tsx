'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Download, Mail, Search, Trash2 } from 'lucide-react';
import type { NewsletterSubscriberRow } from '@/types/database';
import { deleteSubscriber, updateSubscriberStatus } from '@/app/admin/actions/system';
import { AdminPanel, EmptyState } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from '@/components/ui/toaster';

const STATUS_VARIANT = {
  subscribed: 'success',
  pending: 'warning',
  unsubscribed: 'default',
} as const;

/** Newsletter subscribers (spec §76) with search, filter and CSV export. */
export function SubscriberTable({
  subscribers,
  canManage,
}: {
  subscribers: NewsletterSubscriberRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [pending, startTransition] = React.useTransition();

  const filtered = subscribers.filter((subscriber) => {
    const matchesQuery =
      !query || subscriber.email.toLowerCase().includes(query.toLowerCase().trim());
    const matchesStatus = status === 'all' || subscriber.status === status;
    return matchesQuery && matchesStatus;
  });

  function exportCsv() {
    const header = 'Email,Status,Language,Source,Subscribed,Confirmed';
    const rows = filtered.map((subscriber) =>
      [
        subscriber.email,
        subscriber.status,
        subscriber.language,
        subscriber.source ?? '',
        subscriber.created_at,
        subscriber.confirmed_at ?? '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    );

    const blob = new Blob([`﻿${[header, ...rows].join('\r\n')}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drh-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function run(work: () => Promise<{ ok: boolean; error?: string }>, message: string) {
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        toast.error(result.error ?? 'That did not work.');
        return;
      }
      toast.success(message);
      router.refresh();
    });
  }

  const counts = {
    subscribed: subscribers.filter((s) => s.status === 'subscribed').length,
    pending: subscribers.filter((s) => s.status === 'pending').length,
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <label htmlFor="subscriber-search" className="sr-only">
            Search subscribers
          </label>
          <Input
            id="subscriber-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email…"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <label className="inline-flex items-center">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="subscribed">Subscribed ({counts.subscribed})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </label>

        <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<Mail className="size-5" />}
            title={subscribers.length === 0 ? 'No subscribers yet' : 'Nothing matches that filter'}
            description={
              subscribers.length === 0
                ? 'The footer signup form uses double opt-in — an address only becomes “subscribed” after the confirmation link is clicked.'
                : undefined
            }
          />
        </AdminPanel>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Signed up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="text-sm text-foreground">{subscriber.email}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[subscriber.status] ?? 'default'}>
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm uppercase text-muted-foreground">
                    {subscriber.language}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {subscriber.source ?? '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(subscriber.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <span className="inline-flex items-center gap-1">
                        {subscriber.status !== 'unsubscribed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-xs"
                            disabled={pending}
                            onClick={() =>
                              run(
                                () => updateSubscriberStatus(subscriber.id, 'unsubscribed'),
                                'Unsubscribed.',
                              )
                            }
                          >
                            Unsubscribe
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${subscriber.email}`}
                          disabled={pending}
                          onClick={() =>
                            run(() => deleteSubscriber(subscriber.id), 'Subscriber deleted.')
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </span>
                    )}
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
