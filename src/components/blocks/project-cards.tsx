import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/brand/icons';
import type { ProjectView } from '@/lib/data';

/** The fields a card needs — small enough to pass to client components. */
export type ProjectCardData = Pick<
  ProjectView,
  'slug' | 'clientName' | 'coverImage' | 'industry' | 'country' | 'technologies' | 'shortDescription'
>;

export function toCardData(project: ProjectView): ProjectCardData {
  return {
    slug: project.slug,
    clientName: project.clientName,
    coverImage: project.coverImage,
    industry: project.industry,
    country: project.country,
    technologies: project.technologies,
    shortDescription: project.shortDescription,
  };
}
import { cn } from '@/lib/utils';

/**
 * Card palettes from the design (coffee, slate, blush). Projects carry no
 * brand colours in the CMS, so cards cycle through these in order.
 */
export const PROJECT_PALETTES = [
  { bg: '#2A1D15', fg: '#F5E9DA', muted: '#D9C2A7', line: '#5A4334', panel: '#3A2A20' },
  { bg: '#1C252D', fg: '#F2F4F0', muted: '#A9B6C0', line: '#3A4855', panel: '#26323C' },
  { bg: '#F0DED6', fg: '#2B1B1E', muted: '#6B4C52', line: '#D6A99A', panel: '#FBF4F1' },
] as const;

export type ProjectPalette = (typeof PROJECT_PALETTES)[number];

export function projectKicker(project: ProjectCardData): string {
  return [project.industry?.title, project.country].filter(Boolean).join(' · ').toUpperCase();
}

export function projectStack(project: ProjectCardData, limit = 4): string[] {
  return project.technologies.slice(0, limit).map((tech) => tech.name);
}

/** The cover screenshot in a browser-like frame, with the "live preview" chip. */
export function ProjectFrame({
  project,
  palette,
  label,
  sizes,
  priority = false,
  className,
}: {
  project: ProjectCardData;
  palette: ProjectPalette;
  label: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="zoom absolute inset-[40px_40px_0] overflow-hidden rounded-t-[18px] max-sm:inset-[24px_24px_0]"
        style={{ background: palette.panel }}
      >
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
        )}
      </div>
      <span
        className="mono absolute left-14 top-[54px] inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] tracking-[.1em] max-sm:left-9 max-sm:top-9"
        style={{ background: palette.bg, color: palette.fg }}
      >
        <span className="glow size-[7px] rounded-full bg-[#FF5A4E]" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

/** Large split card for the lead project. */
export function FeaturedProjectCard({
  project,
  palette = PROJECT_PALETTES[0],
  labels,
}: {
  project: ProjectCardData;
  palette?: ProjectPalette;
  labels: { live: string; read: string };
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="card reveal mt-14 flex flex-wrap overflow-hidden rounded-[32px] border border-transparent"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <ProjectFrame
        project={project}
        palette={palette}
        label={labels.live}
        sizes="(max-width: 860px) 100vw, 720px"
        className="min-h-[480px] flex-[1_1_520px] max-sm:min-h-[300px]"
      />
      <div className="flex flex-[1_1_360px] flex-col gap-4 p-12 max-sm:p-7">
        <span className="mono text-xs tracking-[.1em]" style={{ color: palette.muted }}>
          {projectKicker(project)}
        </span>
        <h3 className="m-0 text-[clamp(36px,3.6vw,52px)] font-semibold leading-none tracking-[-0.035em]">
          {project.clientName}
        </h3>
        {project.shortDescription && (
          <p className="m-0 text-[17px] leading-relaxed" style={{ color: palette.muted }}>
            {project.shortDescription}
          </p>
        )}
        <ul className="mt-auto flex flex-wrap gap-2">
          {projectStack(project).map((tech) => (
            <li key={tech} className="rounded-full border px-3 py-1.5 text-[13px]" style={{ borderColor: palette.line }}>
              {tech}
            </li>
          ))}
        </ul>
        <span className="inline-flex items-center gap-2.5 font-semibold">
          {labels.read}
          <span className="arrow-dot size-10" style={{ background: palette.fg, color: palette.bg }}>
            <ArrowRight size={16} />
          </span>
        </span>
      </div>
    </Link>
  );
}

/** Compact card: cover frame on top, client, sector and stack below. */
export function ProjectCard({
  project,
  palette,
  labels,
  tall = false,
  className,
}: {
  project: ProjectCardData;
  palette: ProjectPalette;
  labels: { live: string };
  tall?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn('card reveal flex flex-col overflow-hidden rounded-[32px] border border-transparent', className)}
      style={{ background: palette.bg, color: palette.fg }}
    >
      <ProjectFrame
        project={project}
        palette={palette}
        label={labels.live}
        sizes="(max-width: 860px) 100vw, 640px"
        className={tall ? 'h-[420px] max-sm:h-[300px]' : 'h-[340px] max-sm:h-[260px]'}
      />
      <div className="flex flex-wrap items-end justify-between gap-4 p-8 max-sm:p-6">
        <div>
          <span className="mono text-xs tracking-[.1em]" style={{ color: palette.muted }}>
            {projectKicker(project)}
          </span>
          <h3 className="m-0 mt-2.5 text-[32px] font-semibold tracking-[-0.03em]">{project.clientName}</h3>
          {project.technologies.length > 0 && (
            <p className="mt-1.5 text-[15px]" style={{ color: palette.muted }}>
              {projectStack(project, 3).join(' · ')}
            </p>
          )}
        </div>
        <span className="arrow-dot size-[52px]" style={{ background: palette.fg, color: palette.bg }}>
          <ArrowRight size={20} />
        </span>
      </div>
    </Link>
  );
}
