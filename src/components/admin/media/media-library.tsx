'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Check, Copy, FileText, Film, ImageIcon, Loader2, Search, Trash2, Upload } from 'lucide-react';
import type { MediaRow } from '@/types/database';
import { deleteMedia, updateMedia, uploadMedia } from '@/app/admin/actions/media';
import { AdminPanel, EmptyState } from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toaster';
import { cn, formatBytes } from '@/lib/utils';

/** Media library (spec §56). */
export function MediaLibrary({
  media,
  folders,
  canManage,
}: {
  media: MediaRow[];
  folders: string[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [folder, setFolder] = React.useState('all');
  const [editing, setEditing] = React.useState<MediaRow | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = media.filter((item) => {
    const matchesFolder = folder === 'all' || item.folder === folder;
    const matchesQuery =
      !query || item.file_name.toLowerCase().includes(query.toLowerCase().trim());
    return matchesFolder && matchesQuery;
  });

  async function handleFiles(files: FileList) {
    setUploading(true);
    let succeeded = 0;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('folder', folder === 'all' ? 'general' : folder);

      const result = await uploadMedia(formData);
      if (result.ok) succeeded += 1;
      else toast.error(`${file.name}: ${result.error}`);
    }

    setUploading(false);
    if (succeeded > 0) {
      toast.success(`${succeeded} ${succeeded === 1 ? 'file' : 'files'} uploaded.`);
      router.refresh();
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error('Could not copy the URL.');
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <label htmlFor="media-library-search" className="sr-only">
            Search media
          </label>
          <Input
            id="media-library-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file name…"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <label className="inline-flex items-center">
          <span className="sr-only">Filter by folder</span>
          <select
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none"
          >
            <option value="all">All folders</option>
            {folders.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {canManage && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf,.doc,.docx,video/mp4,video/webm"
              className="sr-only"
              onChange={(event) => {
                if (event.target.files?.length) void handleFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload
            </Button>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<ImageIcon className="size-5" />}
            title={media.length === 0 ? 'The library is empty' : 'Nothing matches that filter'}
            description={
              media.length === 0
                ? 'Upload project imagery, article headers and logos here. Images are served through Next.js in AVIF or WebP at the right size for each device.'
                : undefined
            }
          />
        </AdminPanel>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <li key={item.id}>
              <article className="group overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative aspect-[4/3] bg-surface-sunken">
                  {item.kind === 'image' ? (
                    <Image
                      src={item.url}
                      alt={item.alt_en ?? ''}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-subtle-foreground">
                      {item.kind === 'video' ? (
                        <Film className="size-6" />
                      ) : (
                        <FileText className="size-6" />
                      )}
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <p className="truncate text-xs font-medium text-foreground" title={item.file_name}>
                    {item.file_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-subtle-foreground">
                    {formatBytes(item.size_bytes)}
                    {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <Badge variant="outline">{item.folder}</Badge>
                    {!item.alt_en && item.kind === 'image' && (
                      <Badge variant="warning">No alt</Badge>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy URL"
                      onClick={() => copyUrl(item.url)}
                    >
                      {copied === item.url ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-xs"
                          onClick={() => setEditing(item)}
                        >
                          Details
                        </Button>
                        <DeleteMediaButton id={item.id} name={item.file_name} />
                      </>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(next) => !next && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File details</DialogTitle>
            <DialogDescription>
              Alt text is read aloud by screen readers and used by image search.
            </DialogDescription>
          </DialogHeader>
          {editing && <MediaDetailsForm media={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MediaDetailsForm({ media, onDone }: { media: MediaRow; onDone: () => void }) {
  const router = useRouter();
  const [fileName, setFileName] = React.useState(media.file_name);
  const [altEn, setAltEn] = React.useState(media.alt_en ?? '');
  const [altSq, setAltSq] = React.useState(media.alt_sq ?? '');
  const [folder, setFolder] = React.useState(media.folder);
  const [pending, startTransition] = React.useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateMedia({
        id: media.id,
        file_name: fileName,
        alt_en: altEn || null,
        alt_sq: altSq || null,
        folder,
      });

      if (!result.ok) {
        toast.error(result.error ?? 'Could not save.');
        return;
      }

      toast.success('Saved.');
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-surface-sunken">
        {media.kind === 'image' && (
          <Image src={media.url} alt={altEn} fill sizes="480px" className="object-contain" />
        )}
      </div>

      <div>
        <Label htmlFor="media-name">File name</Label>
        <Input
          id="media-name"
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="media-alt-en">Alt text (English)</Label>
        <Input
          id="media-alt-en"
          value={altEn}
          onChange={(event) => setAltEn(event.target.value)}
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="media-alt-sq">Alt text (Albanian)</Label>
        <Input
          id="media-alt-sq"
          value={altSq}
          onChange={(event) => setAltSq(event.target.value)}
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="media-folder">Folder</Label>
        <Input
          id="media-folder"
          value={folder}
          onChange={(event) => setFolder(event.target.value)}
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <p className="break-all rounded-lg bg-surface-sunken px-3 py-2 font-mono text-[11px] text-muted-foreground">
        {media.url}
      </p>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}

function DeleteMediaButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${name}`}
      disabled={pending}
      className={cn('ml-auto text-muted-foreground hover:text-danger')}
      onClick={() =>
        startTransition(async () => {
          const result = await deleteMedia(id);
          if (!result.ok) {
            toast.error(result.error ?? 'Could not delete.');
            return;
          }
          toast.success('Deleted.');
          router.refresh();
        })
      }
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Save
    </Button>
  );
}

export { SubmitButton };
