'use client';

import * as React from 'react';
import { Link } from '@/i18n/navigation';
import { Accent } from '@/components/brand/accent';
import { ArrowRight } from '@/components/brand/icons';
import { PROJECT_PALETTES, ProjectCard, type ProjectCardData } from '@/components/blocks/project-cards';

/** Work grid filtered by industry, plus the "your project here" card. */
export function WorkGrid({
  projects,
  labels,
}: {
  projects: ProjectCardData[];
  labels: {
    filter: string;
    all: string;
    count: string;
    live: string;
    nextKicker: string;
    nextTitle: string;
    nextBody: string;
    nextCta: string;
  };
}) {
  const [industry, setIndustry] = React.useState<string>('all');

  const industries = React.useMemo(() => {
    const seen = new Map<string, string>();
    for (const project of projects) {
      if (project.industry && !seen.has(project.industry.slug)) seen.set(project.industry.slug, project.industry.title);
    }
    return [...seen.entries()];
  }, [projects]);

  const visible = industry === 'all' ? projects : projects.filter((p) => p.industry?.slug === industry);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
          <button type="button" className="pill-tab" aria-pressed={industry === 'all'} onClick={() => setIndustry('all')}>
            {labels.all}
          </button>
          {industries.map(([slug, title]) => (
            <button key={slug} type="button" className="pill-tab" aria-pressed={industry === slug} onClick={() => setIndustry(slug)}>
              {title}
            </button>
          ))}
        </div>
        <span className="mono text-[13px] text-t3" aria-live="polite">
          {labels.count.replace('{count}', String(visible.length).padStart(2, '0'))}
        </span>
      </div>

      <div className="mt-10 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr))]">
        {visible.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            palette={PROJECT_PALETTES[index % PROJECT_PALETTES.length]}
            labels={{ live: labels.live }}
            tall
          />
        ))}
        <Link
          href="/contact"
          className="card flex min-h-[560px] flex-col justify-between rounded-[32px] border border-dashed border-ln2 p-10 text-fg max-sm:min-h-[380px] max-sm:p-7"
        >
          <span className="mono text-xs tracking-[.1em] text-t3">{labels.nextKicker}</span>
          <div>
            <div className="whitespace-pre-line text-[clamp(40px,4.4vw,64px)] font-semibold leading-[.95] tracking-[-0.045em]">
              <Accent text={labels.nextTitle} />
            </div>
            <p className="mt-4 text-[17px] text-t2">{labels.nextBody}</p>
          </div>
          <span className="inline-flex items-center gap-3 font-semibold text-acct">
            {labels.nextCta}
            <span className="arrow-dot size-[52px] bg-lime text-ink">
              <ArrowRight size={20} />
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
