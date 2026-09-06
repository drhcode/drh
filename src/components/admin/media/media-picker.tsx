'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2, Search, Trash2, Upload, X } from 'lucide-react';
import type { MediaRow } from '@/types/database';
import { listMedia, uploadMedia } from '@/app/admin/actions/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toaster';
import { cn, formatBytes } from '@/lib/utils';

/**
 * Media picker.
 *
 * Wraps the library so any editor can choose an existing asset or upload a new
 * one without leaving the form. Values are plain URLs, which is what the CMS
 * stores, so an image can also be pasted in by hand.
 */
export function MediaPicker({
  name,
  label,
  description,
  defaultValue = '',
  aspect = 'aspect-[16/10]',
}: {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string;
  aspect?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Label htmlFor={`${name}-url`}>{label}</Label>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}

      <input type="hidden" name={name} value={value} />

      <div className="mt-2.5 flex items-start gap-4">
        <div
          className={cn(
            'relative w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-sunken',
            aspect,
          )}
        >
          {value ? (
            <Image src={value} alt="" fill sizes="160px" className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle-foreground">
              <ImageIcon className="size-5" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Input
            id={`${name}-url`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="/media/… or https://…"
            className="h-9 text-sm"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              Choose from library
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setValue('')}>
                <X className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <MediaLibraryDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(media) => {
          setValue(media.url);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaRow) => void;
}) {
  // null means "not loaded yet" — this avoids a separate loading flag that
  // would have to be set synchronously inside an effect.
  const [items, setItems] = React.useState<MediaRow[] | null>(null);
  const [query, setQuery] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch on open and whenever the debounced search term changes.
  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void listMedia({ kind: 'image', query: query || undefined, limit: 60 })
        .then((media) => {
          if (!cancelled) setItems(media);
        })
        .catch(() => {
          if (!cancelled) setItems([]);
        });
    }, query ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const loading = items === null;

  async function upload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    formData.set('folder', 'general');

    const result = await uploadMedia(formData);
    setUploading(false);

    if (!result.ok || !result.media) {
      toast.error(result.error ?? 'Upload failed.');
      return;
    }

    toast.success('Uploaded.');
    setItems((current) => [result.media!, ...(current ?? [])]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Choose an image or upload a new one.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden="true"
            />
            <label htmlFor="media-search" className="sr-only">
              Search media
            </label>
            <Input
              id="media-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by file name…"
              className="h-9 pl-9 text-sm"
            />
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload
          </Button>
        </div>

        <div className="scrollbar-thin max-h-96 overflow-y-auto">
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (items ?? []).length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No images yet. Upload one to get started.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(items ?? []).map((media) => (
                <li key={media.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(media)}
                    className="group w-full overflow-hidden rounded-lg border border-border bg-surface text-left transition-colors hover:border-accent"
                  >
                    <span className="relative block aspect-[4/3] bg-surface-sunken">
                      <Image
                        src={media.url}
                        alt={media.alt_en ?? ''}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </span>
                    <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">
                      {media.file_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small inline preview + remove control used by the gallery editor. */
export function MediaThumb({
  url,
  alt,
  onRemove,
  size = 'md',
}: {
  url: string;
  alt?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-border bg-surface-sunken',
          size === 'sm' ? 'size-16' : 'aspect-[4/3] w-full',
        )}
      >
        <Image src={url} alt={alt ?? ''} fill sizes="240px" className="object-cover" />
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-colors hover:text-danger"
          aria-label="Remove image"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  );
}

export { formatBytes };
