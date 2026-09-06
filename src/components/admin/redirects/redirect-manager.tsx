'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2, Pencil, Plus, Shuffle, Trash2 } from 'lucide-react';
import type { RedirectRow } from '@/types/database';
import { deleteRedirect, saveRedirect } from '@/app/admin/actions/system';
import { AdminPanel, EmptyState } from '@/components/admin/admin-ui';
import { SelectField, SwitchField, TextField } from '@/components/admin/form-kit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

/** Redirect manager (spec §66). Loops are rejected server-side before saving. */
export function RedirectManager({
  redirects,
  canManage,
}: {
  redirects: RedirectRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<RedirectRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteRedirect(id);
      if (!result.ok) {
        toast.error(result.error ?? 'Could not delete.');
        return;
      }
      toast.success('Redirect deleted.');
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Add redirect
          </Button>
        )}
      </div>

      {redirects.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<Shuffle className="size-5" />}
            title="No redirects yet"
            description="Add a redirect whenever a URL changes, so existing search rankings and inbound links survive the move."
          />
        </AdminPanel>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-xs text-foreground">
                    {redirect.source}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {redirect.destination}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{redirect.status_code}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={redirect.is_active ? 'success' : 'default'}>
                      {redirect.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <span className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit redirect"
                          onClick={() => setEditing(redirect)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete redirect"
                          disabled={pending}
                          onClick={() => remove(redirect.id)}
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

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit redirect' : 'Add redirect'}</DialogTitle>
            <DialogDescription>
              301 for a permanent move, 302 for a temporary one. Loops are rejected automatically.
            </DialogDescription>
          </DialogHeader>

          <RedirectForm
            redirect={editing ?? undefined}
            onDone={() => {
              setCreating(false);
              setEditing(null);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function RedirectForm({ redirect, onDone }: { redirect?: RedirectRow; onDone: () => void }) {
  const [error, setError] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await saveRedirect(formData);
    if (!result.ok) {
      setError(result.error ?? 'Could not save.');
      return;
    }
    toast.success('Redirect saved.');
    onDone();
  }

  return (
    <form action={action} className="space-y-5">
      {redirect && <input type="hidden" name="id" value={redirect.id} />}

      <TextField
        label="Source path"
        name="source"
        required
        defaultValue={redirect?.source ?? ''}
        placeholder="/old-page"
        hint="Must start with a slash."
      />
      <TextField
        label="Destination"
        name="destination"
        required
        defaultValue={redirect?.destination ?? ''}
        placeholder="/new-page or https://…"
      />
      <SelectField
        label="Type"
        name="status_code"
        defaultValue={String(redirect?.status_code ?? 301)}
        options={[
          { value: '301', label: '301 — Permanent' },
          { value: '302', label: '302 — Temporary' },
          { value: '307', label: '307 — Temporary, method preserved' },
          { value: '308', label: '308 — Permanent, method preserved' },
        ]}
      />
      <SwitchField name="is_active" label="Active" defaultChecked={redirect?.is_active ?? true} />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Save redirect
    </Button>
  );
}
