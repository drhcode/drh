'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2, Pencil, Plus, Quote, Star, Trash2 } from 'lucide-react';
import type { ProjectRow, TestimonialRow } from '@/types/database';
import { deleteTestimonial, saveTestimonial } from '@/app/admin/actions/content';
import { AdminPanel, EmptyState } from '@/components/admin/admin-ui';
import { MediaPicker } from '@/components/admin/media/media-picker';
import { SelectField, SwitchField, TextAreaField, TextField } from '@/components/admin/form-kit';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toaster';
import { initials } from '@/lib/utils';

/**
 * Testimonials (spec §61).
 *
 * The public section hides itself when this list is empty — drh.al ships no
 * placeholder reviews, so an empty state here is the correct production state
 * until real quotes are collected.
 */
export function TestimonialManager({
  testimonials,
  projects,
  canManage,
}: {
  testimonials: TestimonialRow[];
  projects: Pick<ProjectRow, 'id' | 'client_name'>[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<TestimonialRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const open = creating || editing !== null;

  return (
    <>
      <div className="mb-6 flex justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Add testimonial
          </Button>
        )}
      </div>

      {testimonials.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<Quote className="size-5" />}
            title="No testimonials yet"
            description="Add real client quotes as you collect them. Until then the testimonial section is hidden on the public site rather than filled with placeholders."
            action={
              canManage && (
                <Button size="sm" onClick={() => setCreating(true)}>
                  <Plus className="size-4" />
                  Add the first one
                </Button>
              )
            }
          />
        </AdminPanel>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id}>
              <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {testimonial.photo_url ? (
                      <Image
                        src={testimonial.photo_url}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent">
                        {initials(testimonial.client_name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {testimonial.client_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[testimonial.position, testimonial.company].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${testimonial.client_name}`}
                        onClick={() => setEditing(testimonial)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${testimonial.client_name}`}
                        onClick={() => setConfirmId(testimonial.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {testimonial.rating != null && (
                  <div className="mt-3 flex gap-0.5" aria-label={`${testimonial.rating} of 5`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={
                          index < (testimonial.rating ?? 0)
                            ? 'size-3.5 fill-accent text-accent'
                            : 'size-3.5 text-border-strong'
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}

                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote_en}&rdquo;
                </blockquote>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {testimonial.featured && <Badge variant="accent">Featured</Badge>}
                  <Badge variant={testimonial.is_active ? 'success' : 'default'}>
                    {testimonial.is_active ? 'Active' : 'Hidden'}
                  </Badge>
                  <Badge variant={testimonial.quote_sq ? 'success' : 'outline'}>
                    {testimonial.quote_sq ? '🇦🇱 SQ ✓' : '🇦🇱 SQ —'}
                  </Badge>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit testimonial' : 'Add testimonial'}</DialogTitle>
            <DialogDescription>
              Only publish quotes a client has actually given and approved.
            </DialogDescription>
          </DialogHeader>

          <TestimonialForm
            testimonial={editing ?? undefined}
            projects={projects}
            onDone={() => {
              setCreating(false);
              setEditing(null);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmId !== null} onOpenChange={(next) => !next && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
          <AlertDialogDescription>
            It is removed from the site immediately. Setting it to hidden keeps the record.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              destructive
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirmId) return;
                  const result = await deleteTestimonial(confirmId);
                  setConfirmId(null);
                  if (!result.ok) {
                    toast.error(result.error ?? 'Could not delete.');
                    return;
                  }
                  toast.success('Testimonial deleted.');
                  router.refresh();
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TestimonialForm({
  testimonial,
  projects,
  onDone,
}: {
  testimonial?: TestimonialRow;
  projects: Pick<ProjectRow, 'id' | 'client_name'>[];
  onDone: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await saveTestimonial(formData);
    if (result && !result.ok) {
      setError(result.error ?? 'Could not save.');
      return;
    }
    onDone();
  }

  return (
    <form action={action} className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Client name"
          name="client_name"
          required
          defaultValue={testimonial?.client_name ?? ''}
        />
        <TextField label="Position" name="position" defaultValue={testimonial?.position ?? ''} />
        <TextField label="Company" name="company" defaultValue={testimonial?.company ?? ''} />
        <TextField label="Country" name="country" defaultValue={testimonial?.country ?? ''} />
      </div>

      <TextAreaField
        label="Quote (English)"
        name="quote_en"
        required
        rows={4}
        defaultValue={testimonial?.quote_en ?? ''}
      />
      <TextAreaField
        label="Quote (Albanian)"
        name="quote_sq"
        rows={4}
        defaultValue={testimonial?.quote_sq ?? ''}
        hint="Optional. The English quote is used when this is empty."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Rating"
          name="rating"
          defaultValue={testimonial?.rating ? String(testimonial.rating) : ''}
          options={[
            { value: '', label: 'No rating' },
            { value: '5', label: '5 stars' },
            { value: '4', label: '4 stars' },
            { value: '3', label: '3 stars' },
            { value: '2', label: '2 stars' },
            { value: '1', label: '1 star' },
          ]}
        />
        <SelectField
          label="Related project"
          name="project_id"
          defaultValue={testimonial?.project_id ?? ''}
          options={[
            { value: '', label: 'None' },
            ...projects.map((project) => ({ value: project.id, label: project.client_name })),
          ]}
        />
      </div>

      <MediaPicker
        name="photo_url"
        label="Photo"
        defaultValue={testimonial?.photo_url ?? ''}
        aspect="aspect-square"
      />
      <MediaPicker
        name="logo_url"
        label="Company logo"
        defaultValue={testimonial?.logo_url ?? ''}
        aspect="aspect-[3/1]"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={String(testimonial?.sort_order ?? 0)}
        />
      </div>

      <SwitchField
        name="featured"
        label="Featured"
        description="Featured testimonials appear on the homepage."
        defaultChecked={testimonial?.featured ?? false}
      />
      <SwitchField
        name="is_active"
        label="Active"
        description="Inactive testimonials are hidden everywhere on the site."
        defaultChecked={testimonial?.is_active ?? true}
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
      Save testimonial
    </Button>
  );
}
