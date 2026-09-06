import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { ProjectView } from '@/lib/data/types';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';
import { ProjectCard } from './project-card';
import { GlowGrid } from '@/components/ui/glow';

export async function ProjectsSection({
  title,
  subtitle,
  projects,
  showCta = true,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  projects: ProjectView[];
  showCta?: boolean;
  bordered?: boolean;
}) {
  if (projects.length === 0) return null;
  const t = await getTranslations('common');

  return (
    <Section bordered={bordered}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        {title && <SectionHeading title={title} subtitle={subtitle} />}
        {showCta && (
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/work">
              {t('viewAllProjects')}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <GlowGrid as="div" className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.06}>
            <ProjectCard project={project} priority={index === 0} />
          </Reveal>
        ))}
      </GlowGrid>

      {showCta && (
        <div className="mt-10 sm:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/work">
              {t('viewAllProjects')}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </Section>
  );
}
