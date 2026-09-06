import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ProjectView } from '@/lib/data/types';
import { cn } from '@/lib/utils';

/**
 * Portfolio card.
 *
 * The image is the hero: a restrained hover (slight scale on the cover, arrow
 * shift) rather than an overlay that hides the work.
 */
export function ProjectCard({
  project,
  priority = false,
  className,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
}: {
  project: ProjectView;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const meta = [project.industry?.title, project.country].filter(Boolean).join(' · ');

  return (
    <article className={cn('group', className)}>
      <Link href={`/work/${project.slug}`} className="block focus-visible:outline-none">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-sunken">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={`${project.clientName} — ${project.title}`}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-subtle-foreground">
              {project.clientName}
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-accent">
              {project.clientName}
            </h3>
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-subtle-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>

          {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}

          {project.technologies.length > 0 && (
            <p className="mt-3 text-xs text-subtle-foreground">
              {project.technologies.map((tech) => tech.name).join(' · ')}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
