'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import type { PageRow, PageTranslationRow } from '@/types/database';
import { savePage } from '@/app/admin/actions/pages';
import {
  BilingualTabs,
  FormSection,
  SelectField,
  SlugField,
  SwitchField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-kit';
import { MediaPicker } from '@/components/admin/media/media-picker';
import { SectionEditor } from './section-editor';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';

export function PageForm({
  page,
  translations = [],
}: {
  page?: PageRow;
  translations?: PageTranslationRow[];
}) {
  const [error, setError] = React.useState<string | null>(null);
  const en = translations.find((translation) => translation.language === 'en');
  const sq = translations.find((translation) => translation.language === 'sq');
  const isSystem = page?.kind === 'system';

  async function action(formData: FormData) {
    setError(null);
    const result = await savePage(formData);
    if (result && !result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
    }
  }

  return (
    <form action={action} className="space-y-6">
      {page && <input type="hidden" name="id" value={page.id} />}
      {isSystem && <input type="hidden" name="kind" value="system" />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Page">
            {isSystem ? (
              <>
                <TextField
                  label="Title (English)"
                  name="title_en"
                  required
                  defaultValue={en?.title ?? ''}
                />
                <input type="hidden" name="slug" value={page?.slug ?? ''} />
                <p className="rounded-lg bg-surface-sunken px-3 py-2 text-xs text-muted-foreground">
                  This is a system page wired to a fixed route
                  {page ? ` (/${page.slug === 'home' ? '' : page.slug})` : ''}. Its slug cannot be
                  changed and it cannot be deleted — unpublish it instead.
                </p>
              </>
            ) : (
              <SlugField
                titleName="title_en"
                slugName="slug"
                titleLabel="Title (English)"
                defaultTitle={en?.title ?? ''}
                defaultSlug={page?.slug ?? ''}
                prefix="/"
              />
            )}
          </FormSection>

          <FormSection
            title="Sections"
            description="A fixed set of designed blocks. Reorder or remove them; the layout stays consistent."
          >
            <BilingualTabs
              englishComplete={Boolean(en?.title)}
              albanianComplete={Boolean(sq?.title)}
              english={
                <>
                  <SectionEditor name="sections_en" defaultValue={en?.sections ?? []} />
                  <TextField
                    label="SEO title"
                    name="seo_title_en"
                    defaultValue={en?.seo_title ?? ''}
                    maxLength={70}
                  />
                  <TextAreaField
                    label="Meta description"
                    name="seo_description_en"
                    defaultValue={en?.seo_description ?? ''}
                    rows={2}
                    maxLength={180}
                  />
                </>
              }
              albanian={
                <>
                  <TextField
                    label="Title"
                    name="title_sq"
                    defaultValue={sq?.title ?? ''}
                    hint="Leave empty if this page is not translated yet."
                  />
                  <SectionEditor name="sections_sq" defaultValue={sq?.sections ?? []} />
                  <TextField
                    label="SEO title"
                    name="seo_title_sq"
                    defaultValue={sq?.seo_title ?? ''}
                    maxLength={70}
                  />
                  <TextAreaField
                    label="Meta description"
                    name="seo_description_sq"
                    defaultValue={sq?.seo_description ?? ''}
                    rows={2}
                    maxLength={180}
                  />
                </>
              }
            />
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Visibility">
            <SelectField
              label="Status"
              name="status"
              defaultValue={page?.status ?? 'draft'}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            {!isSystem && (
              <SelectField
                label="Kind"
                name="kind"
                defaultValue={page?.kind ?? 'landing'}
                options={[{ value: 'landing', label: 'SEO landing page' }]}
                hint="Landing pages live at the site root, e.g. /seo-albania."
              />
            )}
            <TextField
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue={String(page?.sort_order ?? 0)}
            />
          </FormSection>

          <FormSection title="SEO">
            <MediaPicker
              name="og_image"
              label="OG image"
              defaultValue={page?.og_image ?? ''}
            />
            <TextField
              label="Canonical URL"
              name="canonical_url"
              type="url"
              defaultValue={page?.canonical_url ?? ''}
            />
            <SwitchField
              name="is_indexable"
              label="Allow indexing"
              defaultChecked={page?.is_indexable ?? true}
            />
          </FormSection>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-border bg-background/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? 'Saving…' : 'Save page'}
    </Button>
  );
}
