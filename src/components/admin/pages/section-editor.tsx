'use client';

import * as React from 'react';
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { PageSection } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Structured section editor (spec §63).
 *
 * A fixed catalogue of premium, pre-designed blocks — not a free-form page
 * builder. An editor chooses sections, reorders them and fills in copy; the
 * layout, spacing and typography stay under the design system's control.
 */

type SectionType = PageSection['type'];

interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  /** Data-backed sections pull their own content and only take a heading. */
  dynamic?: boolean;
}

const CATALOGUE: SectionDefinition[] = [
  { type: 'hero', label: 'Hero', description: 'Page opener with headline, body and calls to action.' },
  { type: 'metrics', label: 'Metrics band', description: 'Four short proof points across a full-width band.' },
  { type: 'richText', label: 'Editorial text', description: 'A heading with a comfortable column of prose.' },
  { type: 'featureGrid', label: 'Feature grid', description: 'Three-column grid of titled points.' },
  { type: 'process', label: 'Process steps', description: 'Numbered stages in a four-card row.' },
  { type: 'services', label: 'Services', description: 'Pulls featured services from the CMS.', dynamic: true },
  { type: 'projects', label: 'Projects', description: 'Pulls featured projects from the CMS.', dynamic: true },
  { type: 'industries', label: 'Industries', description: 'Pulls published industries.', dynamic: true },
  { type: 'technologies', label: 'Technology strip', description: 'The technology list.', dynamic: true },
  { type: 'testimonials', label: 'Testimonials', description: 'Featured testimonials, hidden when empty.', dynamic: true },
  { type: 'blog', label: 'Latest articles', description: 'Most recent published articles.', dynamic: true },
  { type: 'faq', label: 'FAQ', description: 'Accordion of FAQs from a category.', dynamic: true },
  { type: 'cta', label: 'Closing CTA', description: 'Full-width conversion block with contact details.' },
];

const LABEL_OF = new Map(CATALOGUE.map((item) => [item.type, item.label]));

export function SectionEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: PageSection[];
}) {
  const [sections, setSections] = React.useState<PageSection[]>(defaultValue);
  const [expanded, setExpanded] = React.useState<number | null>(0);

  function add(type: SectionType) {
    setSections((current) => [...current, blankSection(type)]);
    setExpanded(sections.length);
  }

  function update(index: number, patch: Record<string, unknown>) {
    setSections((current) =>
      current.map((section, i) => (i === index ? ({ ...section, ...patch } as PageSection) : section)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setExpanded(target);
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(sections)} />

      <div className="flex items-center justify-between">
        <div>
          <Label>Sections</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sections.length} {sections.length === 1 ? 'section' : 'sections'}, rendered in this order.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="size-3.5" />
              Add section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 w-72 overflow-y-auto">
            {CATALOGUE.map((definition) => (
              <DropdownMenuItem key={definition.type} onSelect={() => add(definition.type)}>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-foreground">{definition.label}</span>
                  <span className="text-xs text-subtle-foreground">{definition.description}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sections.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-subtle-foreground">
          No sections yet. Add a hero to get started.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {sections.map((section, index) => (
            <li key={index} className="rounded-lg border border-border bg-surface-sunken">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <GripVertical className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === index ? null : index)}
                  aria-expanded={expanded === index}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="font-mono text-[10px] text-subtle-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {LABEL_OF.get(section.type) ?? section.type}
                  </span>
                  <span className="truncate text-xs text-subtle-foreground">
                    {'title' in section && section.title ? section.title : ''}
                  </span>
                  <ChevronDown
                    className={cn(
                      'ml-auto size-3.5 shrink-0 text-subtle-foreground transition-transform',
                      expanded === index && 'rotate-180',
                    )}
                  />
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                    aria-label={`Move section ${index + 1} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                    aria-label={`Move section ${index + 1} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setSections((current) => current.filter((_, i) => i !== index))}
                    className="rounded p-1 text-muted-foreground hover:text-danger"
                    aria-label={`Remove section ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {expanded === index && (
                <div className="space-y-3 border-t border-border bg-surface p-4">
                  <SectionFields
                    section={section}
                    index={index}
                    onChange={(patch) => update(index, patch)}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SectionFields({
  section,
  index,
  onChange,
}: {
  section: PageSection;
  index: number;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const definition = CATALOGUE.find((item) => item.type === section.type);
  const id = (field: string) => `section-${index}-${field}`;

  const fields: React.ReactNode[] = [];

  if ('eyebrow' in section) {
    fields.push(
      <Text key="eyebrow" id={id('eyebrow')} label="Eyebrow" value={section.eyebrow ?? ''} onChange={(value) => onChange({ eyebrow: value })} />,
    );
  }

  if ('title' in section) {
    fields.push(
      <Text key="title" id={id('title')} label="Title" value={section.title ?? ''} onChange={(value) => onChange({ title: value })} />,
    );
  }

  if ('subtitle' in section) {
    fields.push(
      <Text key="subtitle" id={id('subtitle')} label="Subtitle" value={section.subtitle ?? ''} onChange={(value) => onChange({ subtitle: value })} />,
    );
  }

  if ('body' in section) {
    fields.push(
      <Area key="body" id={id('body')} label="Body" value={section.body ?? ''} onChange={(value) => onChange({ body: value })} hint="Blank lines separate paragraphs." />,
    );
  }

  if ('primaryCta' in section) {
    fields.push(
      <Text key="primaryCta" id={id('primaryCta')} label="Primary button" value={section.primaryCta ?? ''} onChange={(value) => onChange({ primaryCta: value })} />,
    );
  }

  if ('secondaryCta' in section) {
    fields.push(
      <Text key="secondaryCta" id={id('secondaryCta')} label="Secondary button" value={section.secondaryCta ?? ''} onChange={(value) => onChange({ secondaryCta: value })} />,
    );
  }

  if ('note' in section) {
    fields.push(
      <Text key="note" id={id('note')} label="Supporting note" value={section.note ?? ''} onChange={(value) => onChange({ note: value })} />,
    );
  }

  if ('limit' in section) {
    fields.push(
      <Text key="limit" id={id('limit')} label="How many to show" type="number" value={String(section.limit ?? 3)} onChange={(value) => onChange({ limit: Number(value) || 3 })} />,
    );
  }

  if ('category' in section) {
    fields.push(
      <Text key="category" id={id('category')} label="FAQ category" value={section.category ?? 'general'} onChange={(value) => onChange({ category: value })} />,
    );
  }

  if (section.type === 'metrics') {
    fields.push(
      <PairList
        key="items"
        label="Metrics"
        addLabel="Add metric"
        keys={['value', 'label']}
        placeholders={{ value: '100+', label: 'Projects delivered' }}
        items={section.items as unknown as Record<string, string>[]}
        onChange={(items) => onChange({ items })}
      />,
    );
  }

  if (section.type === 'featureGrid') {
    fields.push(
      <PairList
        key="items"
        label="Items"
        addLabel="Add item"
        keys={['title', 'body']}
        multiline={['body']}
        items={section.items as unknown as Record<string, string>[]}
        onChange={(items) => onChange({ items })}
      />,
    );
  }

  if (section.type === 'process') {
    fields.push(
      <PairList
        key="steps"
        label="Steps"
        addLabel="Add step"
        keys={['step', 'title', 'body']}
        multiline={['body']}
        placeholders={{ step: '01' }}
        items={section.steps as unknown as Record<string, string>[]}
        onChange={(steps) => onChange({ steps })}
      />,
    );
  }

  return (
    <>
      {definition?.dynamic && (
        <p className="rounded-lg bg-surface-sunken px-3 py-2 text-xs text-muted-foreground">
          Content for this section comes from the CMS automatically — you only set the heading here.
        </p>
      )}
      {fields}
    </>
  );
}

function Text({
  id,
  label,
  value,
  onChange,
  type = 'text',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-9 text-sm"
      />
    </div>
  );
}

function Area({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-1.5 min-h-20 text-sm"
      />
      {hint && <p className="mt-1 text-xs text-subtle-foreground">{hint}</p>}
    </div>
  );
}

function PairList({
  label,
  addLabel,
  keys,
  items,
  onChange,
  multiline = [],
  placeholders = {},
}: {
  label: string;
  addLabel: string;
  keys: string[];
  items: Record<string, string>[];
  onChange: (items: Record<string, string>[]) => void;
  multiline?: string[];
  placeholders?: Record<string, string>;
}) {
  const list = items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() =>
            onChange([...list, Object.fromEntries(keys.map((key) => [key, ''])) as Record<string, string>])
          }
        >
          <Plus className="size-3" />
          {addLabel}
        </Button>
      </div>

      <ul className="mt-2 space-y-2">
        {list.map((item, index) => (
          <li key={index} className="rounded border border-border bg-surface-sunken p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] text-subtle-foreground">{index + 1}</span>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, i) => i !== index))}
                className="rounded p-0.5 text-muted-foreground hover:text-danger"
                aria-label={`Remove ${label} ${index + 1}`}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {keys.map((key) =>
                multiline.includes(key) ? (
                  <Textarea
                    key={key}
                    value={item[key] ?? ''}
                    placeholder={placeholders[key] ?? key}
                    rows={2}
                    aria-label={key}
                    onChange={(event) =>
                      onChange(
                        list.map((entry, i) =>
                          i === index ? { ...entry, [key]: event.target.value } : entry,
                        ),
                      )
                    }
                    className="min-h-14 text-xs"
                  />
                ) : (
                  <Input
                    key={key}
                    value={item[key] ?? ''}
                    placeholder={placeholders[key] ?? key}
                    aria-label={key}
                    onChange={(event) =>
                      onChange(
                        list.map((entry, i) =>
                          i === index ? { ...entry, [key]: event.target.value } : entry,
                        ),
                      )
                    }
                    className="h-8 text-xs"
                  />
                ),
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function blankSection(type: SectionType): PageSection {
  switch (type) {
    case 'hero':
      return { type: 'hero', title: '', subtitle: '', body: '', primaryCta: '', secondaryCta: '', note: '' };
    case 'metrics':
      return { type: 'metrics', items: [] };
    case 'richText':
      return { type: 'richText', title: '', body: '' };
    case 'featureGrid':
      return { type: 'featureGrid', title: '', subtitle: '', items: [] };
    case 'process':
      return { type: 'process', title: '', subtitle: '', steps: [] };
    case 'services':
      return { type: 'services', title: '', subtitle: '' };
    case 'projects':
      return { type: 'projects', title: '', subtitle: '', limit: 3 };
    case 'industries':
      return { type: 'industries', title: '', subtitle: '' };
    case 'technologies':
      return { type: 'technologies', title: '' };
    case 'testimonials':
      return { type: 'testimonials', title: '', subtitle: '' };
    case 'blog':
      return { type: 'blog', title: '', subtitle: '', limit: 3 };
    case 'faq':
      return { type: 'faq', title: '', subtitle: '', category: 'general' };
    case 'cta':
      return { type: 'cta', title: '', body: '', primaryCta: '' };
  }
}
