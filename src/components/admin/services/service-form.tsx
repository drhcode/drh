'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import type { ServiceRow, ServiceTranslationRow, TechnologyRow } from '@/types/database';
import { saveService } from '@/app/admin/actions/content';
import {
  BilingualTabs,
  ChipMultiSelect,
  FormSection,
  RepeatableFields,
  SelectField,
  SlugField,
  SwitchField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-kit';
import { StringListField } from '@/components/admin/string-list-field';
import { MediaPicker } from '@/components/admin/media/media-picker';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';

const ICON_OPTIONS = [
  { value: 'code', label: 'Code' },
  { value: 'layers', label: 'Layers' },
  { value: 'smartphone', label: 'Mobile' },
  { value: 'wordpress', label: 'Globe' },
  { value: 'shopping-cart', label: 'Cart' },
  { value: 'palette', label: 'Palette' },
  { value: 'search', label: 'Search' },
  { value: 'target', label: 'Target' },
];

export function ServiceForm({
  service,
  translations = [],
  technologies,
  technologySlugs = [],
}: {
  service?: ServiceRow;
  translations?: ServiceTranslationRow[];
  technologies: TechnologyRow[];
  technologySlugs?: string[];
}) {
  const [error, setError] = React.useState<string | null>(null);
  const en = translations.find((translation) => translation.language === 'en');
  const sq = translations.find((translation) => translation.language === 'sq');

  async function action(formData: FormData) {
    setError(null);
    const result = await saveService(formData);
    if (result && !result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
    }
  }

  return (
    <form action={action} className="space-y-6">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Basics">
            <SlugField
              titleName="title_en"
              slugName="slug"
              titleLabel="Title (English)"
              defaultTitle={en?.title ?? ''}
              defaultSlug={service?.slug ?? ''}
              prefix="/services/"
            />
          </FormSection>

          <FormSection title="Content">
            <BilingualTabs
              englishComplete={Boolean(en?.title)}
              albanianComplete={Boolean(sq?.title)}
              english={<ServiceFields language="en" translation={en} showTitle={false} />}
              albanian={<ServiceFields language="sq" translation={sq} showTitle />}
            />
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Visibility">
            <SelectField
              label="Status"
              name="status"
              defaultValue={service?.status ?? 'published'}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            <SwitchField
              name="featured"
              label="Featured"
              description="Featured services appear on the homepage and in the mega menu."
              defaultChecked={service?.featured ?? false}
            />
            <TextField
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue={String(service?.sort_order ?? 0)}
            />
          </FormSection>

          <FormSection title="Presentation">
            <SelectField
              label="Icon"
              name="icon_key"
              defaultValue={service?.icon_key ?? 'code'}
              options={ICON_OPTIONS}
            />
            <MediaPicker
              name="cover_image"
              label="Cover / OG image"
              defaultValue={service?.cover_image ?? ''}
            />
            <ChipMultiSelect
              name="technologies"
              label="Technologies"
              options={technologies.map((technology) => ({
                value: technology.slug,
                label: technology.name,
              }))}
              defaultValue={technologySlugs}
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

function ServiceFields({
  language,
  translation,
  showTitle,
}: {
  language: 'en' | 'sq';
  translation?: ServiceTranslationRow;
  showTitle: boolean;
}) {
  const suffix = `_${language}`;

  return (
    <>
      {showTitle && (
        <TextField
          label="Title"
          name={`title${suffix}`}
          defaultValue={translation?.title ?? ''}
          hint="Leave empty if this language is not translated yet."
        />
      )}

      <TextField
        label="Headline (page H1)"
        name={`headline${suffix}`}
        defaultValue={translation?.headline ?? ''}
      />
      <TextAreaField
        label="Short description"
        name={`short_description${suffix}`}
        defaultValue={translation?.short_description ?? ''}
        rows={2}
        hint="Used on service cards and in the mega menu."
      />
      <TextAreaField
        label="Full description"
        name={`full_description${suffix}`}
        defaultValue={translation?.full_description ?? ''}
        rows={6}
      />

      <RepeatableFields
        name={`benefits${suffix}`}
        label="Benefits"
        addLabel="Add benefit"
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'body', label: 'Body', multiline: true },
        ]}
        defaultValue={(translation?.benefits ?? []).map((benefit) => ({
          title: benefit.title,
          body: benefit.body,
        }))}
      />

      <StringListField
        name={`features${suffix}`}
        label="What's included"
        description="One item per line — rendered as the checklist on the service page."
        defaultValue={translation?.features ?? []}
      />

      <RepeatableFields
        name={`process${suffix}`}
        label="Process steps"
        addLabel="Add step"
        fields={[
          { key: 'step', label: 'Step', placeholder: '01' },
          { key: 'title', label: 'Title' },
          { key: 'body', label: 'Body', multiline: true },
        ]}
        defaultValue={(translation?.process ?? []).map((step) => ({
          step: step.step,
          title: step.title,
          body: step.body,
        }))}
      />

      <TextField
        label="CTA title"
        name={`cta_title${suffix}`}
        defaultValue={translation?.cta_title ?? ''}
      />
      <TextAreaField
        label="CTA body"
        name={`cta_body${suffix}`}
        defaultValue={translation?.cta_body ?? ''}
        rows={2}
      />
      <TextField
        label="SEO title"
        name={`seo_title${suffix}`}
        defaultValue={translation?.seo_title ?? ''}
        maxLength={70}
      />
      <TextAreaField
        label="Meta description"
        name={`seo_description${suffix}`}
        defaultValue={translation?.seo_description ?? ''}
        rows={2}
        maxLength={180}
      />
    </>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? 'Saving…' : 'Save service'}
    </Button>
  );
}
