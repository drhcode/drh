import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { ServiceView } from '@/lib/data/types';
import { ServiceIcon } from '@/components/site/service-icon';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';
import { GlowGrid } from '@/components/ui/glow';

export async function ServicesSection({
  title,
  subtitle,
  services,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  services: ServiceView[];
  bordered?: boolean;
}) {
  if (services.length === 0) return null;

  const t = await getTranslations('common');

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading title={title} subtitle={subtitle} />}

      <GlowGrid as="ul" className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal as="li" key={service.slug} delay={index * 0.05} className="bg-surface">
            <Link
              href={`/services/${service.slug}`}
              data-glow
              className="glow-cell group flex h-full flex-col p-7 transition-colors hover:bg-surface-sunken md:p-8"
            >
              <span className="flex size-11 items-center justify-center rounded-lg border border-border bg-surface-sunken text-accent transition-colors group-hover:border-accent-border group-hover:bg-accent-subtle">
                <ServiceIcon iconKey={service.iconKey} className="size-5" />
              </span>

              <h3 className="mt-6 text-lg font-medium text-foreground">{service.title}</h3>

              {service.shortDescription && (
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.shortDescription}
                </p>
              )}

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                {t('learnMore')}
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </GlowGrid>
    </Section>
  );
}
