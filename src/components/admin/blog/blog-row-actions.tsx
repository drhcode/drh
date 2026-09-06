'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, MoreHorizontal, Pencil, Send, Trash2, Undo2 } from 'lucide-react';
import { deleteBlogPost, setBlogPostStatus } from '@/app/admin/actions/blog';
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

export function BlogRowActions({
  id,
  slug,
  status,
  canManage,
}: {
  id: string;
  slug: string;
  status: string;
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
          <Button variant="ghost" size="icon-sm" aria-label="Article actions" disabled={pending}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/blog/${id}`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="size-4" />
              Preview
            </a>
          </DropdownMenuItem>

          {canManage && (
            <>
              <DropdownMenuSeparator />
              {status !== 'published' ? (
                <DropdownMenuItem
                  onSelect={() => run(() => setBlogPostStatus(id, 'published'), 'Published.')}
                >
                  <Send className="size-4" />
                  Publish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => run(() => setBlogPostStatus(id, 'draft'), 'Moved to draft.')}
                >
                  <Undo2 className="size-4" />
                  Move to draft
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
          <AlertDialogTitle>Delete this article?</AlertDialogTitle>
          <AlertDialogDescription>
            The article and both translations are removed permanently. If it has search traffic,
            add a redirect afterwards so the URL does not 404.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              destructive
              onClick={() => startTransition(() => void deleteBlogPost(id))}
            >
              Delete article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
