'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import type {
  BlogCategoryRow,
  BlogPostRow,
  BlogTranslationRow,
  ServiceRow,
} from '@/types/database';
import { saveBlogPost } from '@/app/admin/actions/blog';
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
import { RichEditor } from './rich-editor';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';

export function BlogForm({
  post,
  translations = [],
  categories,
  services,
}: {
  post?: BlogPostRow;
  translations?: BlogTranslationRow[];
  categories: BlogCategoryRow[];
  services: (ServiceRow & { title: string })[];
}) {
  const [error, setError] = React.useState<string | null>(null);
  const en = translations.find((translation) => translation.language === 'en');
  const sq = translations.find((translation) => translation.language === 'sq');

  async function action(formData: FormData) {
    setError(null);
    const result = await saveBlogPost(formData);
    if (result && !result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
    }
  }

  return (
    <form action={action} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Article">
            <SlugField
              titleName="title_en"
              slugName="slug"
              titleLabel="Title (English)"
              defaultTitle={en?.title ?? ''}
              defaultSlug={post?.slug ?? ''}
              prefix="/blog/"
            />
          </FormSection>

          <FormSection
            title="Content"
            description="Reading time is calculated from the English article when you save."
          >
            <BilingualTabs
              englishComplete={Boolean(en?.title)}
              albanianComplete={Boolean(sq?.title)}
              english={<PostFields language="en" translation={en} showTitle={false} />}
              albanian={<PostFields language="sq" translation={sq} showTitle />}
            />
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Publishing">
            <SelectField
              label="Status"
              name="status"
              defaultValue={post?.status ?? 'draft'}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            <TextField
              label="Publish date"
              name="published_at"
              type="datetime-local"
              defaultValue={
                post?.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : ''
              }
              hint="Set a future date to schedule. The article stays hidden until then."
            />
            <SwitchField
              name="featured"
              label="Featured"
              description="Shown at the top of the blog index."
              defaultChecked={post?.featured ?? false}
            />
            <TextField
              label="Author"
              name="author_name"
              defaultValue={post?.author_name ?? 'drh.al'}
            />
          </FormSection>

          <FormSection title="Taxonomy">
            <SelectField
              label="Category"
              name="category_id"
              defaultValue={post?.category_id ?? ''}
              options={[
                { value: '', label: 'No category' },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name_en,
                })),
              ]}
            />
            <SelectField
              label="Related service"
              name="related_service_id"
              defaultValue={post?.related_service_id ?? ''}
              options={[
                { value: '', label: 'None' },
                ...services.map((service) => ({ value: service.id, label: service.title })),
              ]}
              hint="Adds an internal link from the article to that service page."
            />
          </FormSection>

          <FormSection title="Imagery & SEO">
            <MediaPicker
              name="featured_image"
              label="Featured image"
              defaultValue={post?.featured_image ?? ''}
            />
            <MediaPicker
              name="og_image"
              label="OG image"
              description="Falls back to the featured image."
              defaultValue={post?.og_image ?? ''}
            />
            <SwitchField
              name="is_indexable"
              label="Allow indexing"
              defaultChecked={post?.is_indexable ?? true}
            />
          </FormSection>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <SaveButton />
      </div>
    </form>
  );
}

function PostFields({
  language,
  translation,
  showTitle,
}: {
  language: 'en' | 'sq';
  translation?: BlogTranslationRow;
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

      <TextAreaField
        label="Excerpt"
        name={`excerpt${suffix}`}
        defaultValue={translation?.excerpt ?? ''}
        rows={3}
        hint="Shown on cards and used as the meta description fallback."
      />

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Article</p>
        <RichEditor
          name={`content${suffix}`}
          defaultValue={translation?.content_html ?? ''}
          placeholder={language === 'en' ? 'Write the article…' : 'Shkruani artikullin…'}
        />
      </div>

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
      {pending ? 'Saving…' : 'Save article'}
    </Button>
  );
}
