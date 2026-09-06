'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2, UserPlus } from 'lucide-react';
import type { AdminUserRow, UserRole } from '@/types/database';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/auth/permissions';
import { inviteUser, updateUser } from '@/app/admin/actions/system';
import { AdminPanel } from '@/components/admin/admin-ui';
import { SelectField, TextField } from '@/components/admin/form-kit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { initials } from '@/lib/utils';

const ROLES: UserRole[] = ['super_admin', 'admin', 'editor', 'marketing'];

/**
 * Team management (spec §80).
 *
 * Only a super admin can invite, disable or change roles — enforced server-side
 * in the action, not just by hiding these controls.
 */
export function UserManager({
  users,
  currentUserId,
  isSuperAdmin,
}: {
  users: AdminUserRow[];
  currentUserId: string;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function change(id: string, patch: { role?: UserRole; isActive?: boolean }) {
    startTransition(async () => {
      const result = await updateUser({ id, ...patch });
      if (!result.ok) {
        toast.error(result.error ?? 'Could not update.');
        return;
      }
      toast.success('Team member updated.');
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        {isSuperAdmin && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" />
            Invite user
          </Button>
        )}
      </div>

      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{initials(user.full_name ?? user.email)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.full_name ?? user.email}
                        {user.id === currentUserId && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {isSuperAdmin ? (
                    <label>
                      <span className="sr-only">Role for {user.email}</span>
                      <select
                        value={user.role}
                        disabled={pending}
                        onChange={(event) =>
                          change(user.id, { role: event.target.value as UserRole })
                        }
                        className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-foreground focus-visible:border-accent focus-visible:outline-none"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
                  )}
                </TableCell>

                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </TableCell>

                <TableCell className="text-right">
                  {isSuperAdmin ? (
                    <Switch
                      checked={user.is_active}
                      disabled={pending || user.id === currentUserId}
                      onCheckedChange={(checked) => change(user.id, { isActive: checked })}
                      aria-label={`Active status for ${user.email}`}
                    />
                  ) : (
                    <Badge variant={user.is_active ? 'success' : 'default'}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      <AdminPanel title="What each role can do" className="mt-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <div key={role}>
              <dt className="text-sm font-medium text-foreground">{ROLE_LABELS[role]}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {ROLE_DESCRIPTIONS[role]}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 rounded-lg bg-surface-sunken px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
          Permissions are enforced on the server for every page and every action, and again by
          row level security in PostgreSQL. Hidden buttons are a convenience, never the boundary.
        </p>
      </AdminPanel>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              They receive an email invitation and set their own password. No password is ever
              created or stored here.
            </DialogDescription>
          </DialogHeader>
          <InviteForm onDone={() => { setInviteOpen(false); router.refresh(); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await inviteUser(formData);
    if (!result.ok) {
      setError(result.error ?? 'Could not invite.');
      return;
    }
    toast.success('Invitation sent.');
    onDone();
  }

  return (
    <form action={action} className="space-y-5">
      <TextField label="Email" name="email" type="email" required placeholder="name@drh.al" />
      <TextField label="Full name" name="full_name" placeholder="Jane Doe" />
      <SelectField
        label="Role"
        name="role"
        defaultValue="editor"
        options={ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
      />

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
      Send invitation
    </Button>
  );
}
