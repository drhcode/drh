'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import type {
  IndustryRow,
  ProjectMediaRow,
  ProjectResultRow,
  ProjectRow,
  ProjectTranslationRow,
  ServiceRow,
  TechnologyRow,
  TestimonialRow,
} from '@/types/database';
import { saveProject } from '@/app/admin/actions/projects';
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
import { MediaPicker } from '@/components/admin/media/media-picker';
import { GalleryEditor } from './gallery-editor';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';

interface Props {
  project?: ProjectRow;
  translations?: ProjectTranslationRow[];
  media?: ProjectMediaRow[];
  results?: ProjectResultRow[];
  technologySlugs?: string[];
  serviceSlugs?: string[];
  references: {
    technologies: TechnologyRow[];
    services: (ServiceRow & { title: string })[];
    industries: (IndustryRow & { title: string })[];
    testimonials: TestimonialRow[];
  };
}

/**
 * Project editor (spec §55).
 *
 * A single form posting to one server action, so the project and everything
 * attached to it are saved together. Both languages are edited side by side and
 * the translation status is visible on the tabs.
 */
export function ProjectForm({
  project,
  translations = [],
  media = [],
  results = [],
  technologySlugs = [],
  serviceSlugs = [],
  references,
}: Props) {
  const [error, setError] = React.useState<string | null>(null);
  const en = translations.find((translation) => translation.language === 'en');
  const sq = translations.find((translation) => translation.language === 'sq');

  async function action(formData: FormData) {
    setError(null);
    const result = await saveProject(formData);
    // A successful save redirects, so reaching here means it failed.
    if (result && !result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
    }
  }

  return (
    <form action={action} className="space-y-6">
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Basic information">
            <SlugField
              titleName="client_name"
              slugName="slug"
              titleLabel="Client"
              slugLabel="Slug"
              defaultTitle={project?.client_name ?? ''}
              defaultSlug={project?.slug ?? ''}
              prefix="/work/"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Industry"
                name="industry_id"
                defaultValue={project?.industry_id ?? ''}
                options={[
                  { value: '', label: 'No industry' },
                  ...references.industries.map((industry) => ({
                    value: industry.id,
                    label: industry.title,
                  })),
                ]}
              />
              <TextField
                label="Country"
                name="country"
                defaultValue={project?.country ?? ''}
                placeholder="Albania"
              />
              <TextField
                label="Project date"
                name="project_date"
                type="date"
                defaultValue={project?.project_date ?? ''}
              />
              <TextField
                label="Website URL"
                name="website_url"
                type="url"
                defaultValue={project?.website_url ?? ''}
                placeholder="https://"
              />
            </div>
          </FormSection>

          <FormSection
            title="Case study"
            description="Written per language. Leave the Albanian title empty if it is not translated yet."
          >
            <BilingualTabs
              englishComplete={Boolean(en?.title)}
              albanianComplete={Boolean(sq?.title)}
              english={<CaseStudyFields language="en" translation={en} />}
              albanian={<CaseStudyFields language="sq" translation={sq} />}
            />
          </FormSection>

          <FormSection title="Imagery">
            <MediaPicker
              name="cover_image"
              label="Cover image"
              description="Used on the work grid, the project hero and social cards."
              defaultValue={project?.cover_image ?? ''}
            />
            <MediaPicker
              name="cover_image_mobile"
              label="Mobile cover (optional)"
              description="Only needed when the desktop crop does not work on a phone."
              defaultValue={project?.cover_image_mobile ?? ''}
              aspect="aspect-[4/5]"
            />
            <GalleryEditor name="gallery" defaultValue={media} />
          </FormSection>

          <FormSection
            title="Result metrics"
            description="Optional. Only add figures drh.al has actually verified — the section is hidden when empty."
          >
            <RepeatableFields
              name="results"
              label="Metrics"
              addLabel="Add metric"
              fields={[
                { key: 'value', label: 'Value', placeholder: '70%' },
                { key: 'label_en', label: 'Label (EN)', placeholder: 'Faster load time' },
                { key: 'label_sq', label: 'Label (SQ)', placeholder: 'Ngarkim më i shpejtë' },
              ]}
              defaultValue={results.map((result) => ({
                value: result.value,
                label_en: result.label_en,
                label_sq: result.label_sq ?? '',
              }))}
            />
          </FormSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <FormSection title="Visibility">
            <SelectField
              label="Status"
              name="status"
              defaultValue={project?.status ?? 'draft'}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
              hint="Drafts and archived projects are excluded from the site and the sitemap."
            />
            <SwitchField
              name="featured"
              label="Featured"
              description="Featured projects appear on the homepage."
              defaultChecked={project?.featured ?? false}
            />
            <TextField
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue={String(project?.sort_order ?? 0)}
              hint="Lower numbers appear first."
            />
          </FormSection>

          <FormSection title="Services & technology">
            <ChipMultiSelect
              name="services"
              label="Services"
              description="Also drives the filters on /work."
              options={references.services.map((service) => ({
                value: service.slug,
                label: service.title,
              }))}
              defaultValue={serviceSlugs}
            />
            <ChipMultiSelect
              name="technologies"
              label="Technologies"
              options={references.technologies.map((technology) => ({
                value: technology.slug,
                label: technology.name,
              }))}
              defaultValue={technologySlugs}
            />
          </FormSection>

          <FormSection title="Testimonial">
            <SelectField
              label="Attached testimonial"
              name="testimonial_id"
              defaultValue={project?.testimonial_id ?? ''}
              options={[
                { value: '', label: 'None' },
                ...references.testimonials.map((testimonial) => ({
                  value: testimonial.id,
                  label: `${testimonial.client_name}${testimonial.company ? ` — ${testimonial.company}` : ''}`,
                })),
              ]}
              hint="Only real testimonials added in the Testimonials section."
            />
          </FormSection>

          <FormSection title="SEO">
            <MediaPicker
              name="og_image"
              label="OG image"
              description="Falls back to the cover image."
              defaultValue={project?.og_image ?? ''}
            />
            <TextField
              label="Canonical URL"
              name="canonical_url"
              type="url"
              defaultValue={project?.canonical_url ?? ''}
              placeholder="Leave empty for the default"
            />
            <SwitchField
              name="is_indexable"
              label="Allow indexing"
              description="Turn off to add noindex and drop it from the sitemap."
              defaultChecked={project?.is_indexable ?? true}
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

function CaseStudyFields({
  language,
  translation,
}: {
  language: 'en' | 'sq';
  translation?: ProjectTranslationRow;
}) {
  const suffix = `_${language}`;

  return (
    <>
      <TextField
        label="Project title"
        name={`title${suffix}`}
        defaultValue={translation?.title ?? ''}
        placeholder={language === 'en' ? 'A corporate website for…' : 'Një website korporativ për…'}
      />
      <TextAreaField
        label="Short description"
        name={`short_description${suffix}`}
        defaultValue={translation?.short_description ?? ''}
        rows={2}
        hint="Shown on the work grid and used as the meta description fallback."
      />
      <TextAreaField
        label="Overview"
        name={`overview${suffix}`}
        defaultValue={translation?.overview ?? ''}
        rows={5}
      />
      <TextAreaField
        label="Challenge"
        name={`challenge${suffix}`}
        defaultValue={translation?.challenge ?? ''}
        rows={5}
      />
      <TextAreaField
        label="Solution"
        name={`solution${suffix}`}
        defaultValue={translation?.solution ?? ''}
        rows={5}
      />
      <TextAreaField
        label="Development"
        name={`development${suffix}`}
        defaultValue={translation?.development ?? ''}
        rows={5}
      />
      <TextAreaField
        label="Results (narrative)"
        name={`results_text${suffix}`}
        defaultValue={translation?.results_text ?? ''}
        rows={3}
        hint="Optional prose to accompany the metrics above."
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
        hint="Around 150–160 characters works best."
      />
    </>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? 'Saving…' : 'Save project'}
    </Button>
  );
}
