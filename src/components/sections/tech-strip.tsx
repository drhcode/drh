import type { TechnologyView } from '@/lib/data/types';
import { TechIcon } from '@/components/site/tech-icon';

/** Technology strip (spec §13). */
export function TechStrip({
  title,
  technologies,
}: {
  title?: string;
  technologies: TechnologyView[];
}) {
  if (technologies.length === 0) return null;

  return (
    <section className="border-b border-border py-10">
      <div className="container-page">
        {title && (
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
            {title}
          </p>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12">
          {technologies.map((tech) => (
            <li
              key={tech.slug}
              className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <TechIcon
                slug={tech.slug}
                className="size-5 opacity-70 transition-opacity group-hover:opacity-100"
              />
              <span className="text-sm font-medium">{tech.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
