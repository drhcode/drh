'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import type { IndustryRow, IndustryTranslationRow } from '@/types/database';
import { saveIndustry } from '@/app/admin/actions/content';
import {
  BilingualTabs,
  FormSection,
  RepeatableFields,
  SelectField,
  SlugField,
  SwitchField,
  TextAreaField,
  TextField,
} from '@/components/admin/form-kit';
import { MediaPicker } from '@/components/admin/media/media-picker';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';

export function IndustryForm({
  industry,
  translations = [],
}: {
  industry?: IndustryRow;
  translations?: IndustryTranslationRow[];
}) {
  const [error, setError] = React.useState<string | null>(null);
  const en = translations.find((translation) => translation.language === 'en');
  const sq = translations.find((translation) => translation.language === 'sq');

  async function action(formData: FormData) {
    setError(null);
    const result = await saveIndustry(formData);
    if (result && !result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
    }
  }

  return (
    <form action={action} className="space-y-6">
      {industry && <input type="hidden" name="id" value={industry.id} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Basics">
            <SlugField
              titleName="title_en"
              slugName="slug"
              titleLabel="Name (English)"
              defaultTitle={en?.title ?? ''}
              defaultSlug={industry?.slug ?? ''}
              prefix="/industries/"
            />
          </FormSection>

          <FormSection title="Content">
            <BilingualTabs
              englishComplete={Boolean(en?.title)}
              albanianComplete={Boolean(sq?.title)}
              english={<IndustryFields language="en" translation={en} showTitle={false} />}
              albanian={<IndustryFields language="sq" translation={sq} showTitle />}
            />
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Visibility">
            <SelectField
              label="Status"
              name="status"
              defaultValue={industry?.status ?? 'published'}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            <SwitchField
              name="featured"
              label="Featured"
              defaultChecked={industry?.featured ?? false}
            />
            <TextField
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue={String(industry?.sort_order ?? 0)}
            />
            <TextField
              label="Icon key"
              name="icon_key"
              defaultValue={industry?.icon_key ?? ''}
              placeholder="hard-hat"
            />
            <MediaPicker
              name="cover_image"
              label="Cover / OG image"
              defaultValue={industry?.cover_image ?? ''}
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

function IndustryFields({
  language,
  translation,
  showTitle,
}: {
  language: 'en' | 'sq';
  translation?: IndustryTranslationRow;
  showTitle: boolean;
}) {
  const suffix = `_${language}`;

  return (
    <>
      {showTitle && (
        <TextField
          label="Name"
          name={`title${suffix}`}
          defaultValue={translation?.title ?? ''}
          hint="Leave empty if this language is not translated yet."
        />
      )}

      <TextField
        label="Hero title"
        name={`hero_title${suffix}`}
        defaultValue={translation?.hero_title ?? ''}
      />
      <TextField
        label="Hero subtitle"
        name={`hero_subtitle${suffix}`}
        defaultValue={translation?.hero_subtitle ?? ''}
      />
      <TextAreaField
        label="Description"
        name={`description${suffix}`}
        defaultValue={translation?.description ?? ''}
        rows={4}
      />

      <RepeatableFields
        name={`problems${suffix}`}
        label="Industry challenges"
        addLabel="Add challenge"
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'body', label: 'Body', multiline: true },
        ]}
        defaultValue={(translation?.problems ?? []).map((item) => ({
          title: item.title,
          body: item.body,
        }))}
      />

      <RepeatableFields
        name={`solutions${suffix}`}
        label="How we solve them"
        addLabel="Add solution"
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'body', label: 'Body', multiline: true },
        ]}
        defaultValue={(translation?.solutions ?? []).map((item) => ({
          title: item.title,
          body: item.body,
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
      {pending ? 'Saving…' : 'Save industry'}
    </Button>
  );
}
