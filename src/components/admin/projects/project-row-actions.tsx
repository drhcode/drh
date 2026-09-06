'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
  Star,
  StarOff,
  Trash2,
  Undo2,
} from 'lucide-react';
import {
  deleteProject,
  duplicateProject,
  setProjectStatus,
  toggleProjectFeatured,
} from '@/app/admin/actions/projects';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toaster';

/** Row actions for the project table (spec §54). */
export function ProjectRowActions({
  id,
  slug,
  status,
  featured,
  canManage,
}: {
  id: string;
  slug: string;
  status: string;
  featured: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function run(work: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await work();
      if (result && !result.ok) {
        toast.error(result.error ?? 'That did not work.');
        return;
      }
      toast.success(success);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Project actions" disabled={pending}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/projects/${id}`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a href={`/work/${slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="size-4" />
              Preview
            </a>
          </DropdownMenuItem>

          {canManage && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() =>
                  run(
                    () => toggleProjectFeatured(id, !featured),
                    featured ? 'Removed from featured.' : 'Marked as featured.',
                  )
                }
              >
                {featured ? <StarOff className="size-4" /> : <Star className="size-4" />}
                {featured ? 'Unfeature' : 'Feature'}
              </DropdownMenuItem>

              {status !== 'published' ? (
                <DropdownMenuItem
                  onSelect={() => run(() => setProjectStatus(id, 'published'), 'Published.')}
                >
                  <Send className="size-4" />
                  Publish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => run(() => setProjectStatus(id, 'draft'), 'Moved to draft.')}
                >
                  <Undo2 className="size-4" />
                  Move to draft
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onSelect={() => startTransition(() => void duplicateProject(id))}>
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>

              {status !== 'archived' && (
                <DropdownMenuItem
                  onSelect={() => run(() => setProjectStatus(id, 'archived'), 'Archived.')}
                >
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            The case study, its translations, gallery and metrics are removed permanently.
            Archiving keeps everything but takes it off the site.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              destructive
              onClick={() => startTransition(() => void deleteProject(id))}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
