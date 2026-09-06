'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, Trash2 } from 'lucide-react';
import type { MediaRow } from '@/types/database';
import { MediaLibraryDialog } from '@/components/admin/media/media-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface GalleryEntry {
  id: string;
  url: string;
  alt_en: string;
  alt_sq: string;
}

/**
 * Project gallery editor (spec §55).
 *
 * Supports multiple uploads, drag-and-drop reordering, per-image alt text in
 * both languages, replacement and removal. Order is the array order, written
 * back as `sort_order` when the project is saved.
 */
export function GalleryEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: { url: string; alt_en: string | null; alt_sq: string | null }[];
}) {
  const [items, setItems] = React.useState<GalleryEntry[]>(() =>
    defaultValue.map((item, index) => ({
      id: `${index}-${item.url}`,
      url: item.url,
      alt_en: item.alt_en ?? '',
      alt_sq: item.alt_sq ?? '',
    })),
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const from = current.findIndex((item) => item.id === active.id);
      const to = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, from, to);
    });
  }

  function add(media: MediaRow) {
    setItems((current) => [
      ...current,
      {
        id: `${Date.now()}-${media.id}`,
        url: media.url,
        alt_en: media.alt_en ?? '',
        alt_sq: media.alt_sq ?? '',
      },
    ]);
  }

  function update(id: string, patch: Partial<GalleryEntry>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label>Gallery</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Drag to reorder. Alt text is per language and used by screen readers and search.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <ImagePlus className="size-3.5" />
          Add images
        </Button>
      </div>

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          items.map(({ url, alt_en, alt_sq }) => ({ url, alt_en, alt_sq })),
        )}
      />

      {items.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-subtle-foreground">
          No gallery images yet.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item, index) => (
                <SortableImage
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={() => setItems((current) => current.filter((i) => i.id !== item.id))}
                  onChange={(patch) => update(item.id, patch)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <MediaLibraryDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          add(media);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function SortableImage({
  item,
  index,
  onRemove,
  onChange,
}: {
  item: GalleryEntry;
  index: number;
  onRemove: () => void;
  onChange: (patch: Partial<GalleryEntry>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border border-border bg-surface-sunken p-3',
        isDragging && 'z-10 opacity-80 shadow-lg',
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          className="inline-flex cursor-grab touch-none items-center gap-1.5 rounded px-1 py-0.5 text-xs text-subtle-foreground hover:text-foreground active:cursor-grabbing"
          aria-label={`Reorder image ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
          {index + 1}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground transition-colors hover:text-danger"
          aria-label={`Remove image ${index + 1}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded border border-border bg-surface">
        <Image src={item.url} alt="" fill sizes="320px" className="object-cover" />
      </div>

      <div className="mt-2.5 space-y-2">
        <div>
          <label className="sr-only" htmlFor={`${item.id}-alt-en`}>
            Alt text (English)
          </label>
          <Input
            id={`${item.id}-alt-en`}
            value={item.alt_en}
            onChange={(event) => onChange({ alt_en: event.target.value })}
            placeholder="Alt text (EN)"
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor={`${item.id}-alt-sq`}>
            Alt text (Albanian)
          </label>
          <Input
            id={`${item.id}-alt-sq`}
            value={item.alt_sq}
            onChange={(event) => onChange({ alt_sq: event.target.value })}
            placeholder="Alt text (SQ)"
            className="h-8 text-xs"
          />
        </div>
      </div>
    </li>
  );
}
