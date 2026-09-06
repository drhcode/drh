'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { HelpCircle, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { FaqRow, IndustryRow, ServiceRow } from '@/types/database';
import { deleteFaq, saveFaq } from '@/app/admin/actions/content';
import { AdminPanel, EmptyState } from '@/components/admin/admin-ui';
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
import { toast } from '@/components/ui/toaster';

/** FAQ management (spec §62), grouped by the category each set belongs to. */
export function FaqManager({
  faqs,
  services,
  industries,
  canManage,
}: {
  faqs: FaqRow[];
  services: (ServiceRow & { title: string })[];
  industries: (IndustryRow & { title: string })[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<FaqRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const grouped = React.useMemo(() => {
    const map = new Map<string, FaqRow[]>();
    for (const faq of faqs) {
      const list = map.get(faq.category) ?? [];
      list.push(faq);
      map.set(faq.category, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [faqs]);

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteFaq(id);
      if (!result.ok) {
        toast.error(result.error ?? 'Could not delete.');
        return;
      }
      toast.success('FAQ deleted.');
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Add FAQ
          </Button>
        )}
      </div>

      {faqs.length === 0 ? (
        <AdminPanel>
          <EmptyState
            icon={<HelpCircle className="size-5" />}
            title="No FAQs yet"
            description="FAQs answer the questions people ask before enquiring, and feed FAQPage structured data where both languages are complete."
          />
        </AdminPanel>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, items]) => (
            <AdminPanel
              key={category}
              title={category === 'general' ? 'General' : category}
              description={`${items.length} ${items.length === 1 ? 'question' : 'questions'}`}
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-border">
                {items.map((faq) => (
                  <li key={faq.id} className="flex items-start gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{faq.question_en}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {faq.answer_en}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant={faq.is_active ? 'success' : 'default'}>
                          {faq.is_active ? 'Active' : 'Hidden'}
                        </Badge>
                        <Badge variant={faq.question_sq && faq.answer_sq ? 'success' : 'outline'}>
                          {faq.question_sq && faq.answer_sq ? '🇦🇱 SQ ✓' : '🇦🇱 SQ —'}
                        </Badge>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit FAQ"
                          onClick={() => setEditing(faq)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete FAQ"
                          disabled={pending}
                          onClick={() => remove(faq.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </AdminPanel>
          ))}
        </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
            <DialogDescription>
              Only fully translated entries are included in FAQ structured data.
            </DialogDescription>
          </DialogHeader>

          <FaqForm
            faq={editing ?? undefined}
            services={services}
            industries={industries}
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

function FaqForm({
  faq,
  services,
  industries,
  onDone,
}: {
  faq?: FaqRow;
  services: (ServiceRow & { title: string })[];
  industries: (IndustryRow & { title: string })[];
  onDone: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await saveFaq(formData);
    if (!result.ok) {
      setError(result.error ?? 'Could not save.');
      return;
    }
    toast.success('FAQ saved.');
    onDone();
  }

  return (
    <form action={action} className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
      {faq && <input type="hidden" name="id" value={faq.id} />}

      <TextField
        label="Category"
        name="category"
        defaultValue={faq?.category ?? 'general'}
        hint="Use “general” for the homepage and contact FAQ sets."
      />

      <TextField
        label="Question (English)"
        name="question_en"
        required
        defaultValue={faq?.question_en ?? ''}
      />
      <TextAreaField
        label="Answer (English)"
        name="answer_en"
        required
        rows={4}
        defaultValue={faq?.answer_en ?? ''}
      />

      <TextField
        label="Question (Albanian)"
        name="question_sq"
        defaultValue={faq?.question_sq ?? ''}
      />
      <TextAreaField
        label="Answer (Albanian)"
        name="answer_sq"
        rows={4}
        defaultValue={faq?.answer_sq ?? ''}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Attach to service"
          name="service_id"
          defaultValue={faq?.service_id ?? ''}
          options={[
            { value: '', label: 'None' },
            ...services.map((service) => ({ value: service.id, label: service.title })),
          ]}
        />
        <SelectField
          label="Attach to industry"
          name="industry_id"
          defaultValue={faq?.industry_id ?? ''}
          options={[
            { value: '', label: 'None' },
            ...industries.map((industry) => ({ value: industry.id, label: industry.title })),
          ]}
        />
      </div>

      <TextField
        label="Sort order"
        name="sort_order"
        type="number"
        defaultValue={String(faq?.sort_order ?? 0)}
      />

      <SwitchField name="is_active" label="Active" defaultChecked={faq?.is_active ?? true} />

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
      Save FAQ
    </Button>
  );
}
