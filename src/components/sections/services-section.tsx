import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { ServiceView } from '@/lib/data/types';
import { Section, SectionHeading, type Kicker } from './section';
import { ServiceList } from './service-list';

export async function ServicesSection({
  title,
  subtitle,
  kicker,
  services,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  kicker?: Kicker;
  services: ServiceView[];
  bordered?: boolean;
}) {
  if (services.length === 0) return null;

  const t = await getTranslations('common');
  const tNav = await getTranslations('nav');

  return (
    <Section bordered={bordered}>
      {title && (
        <div className="mb-14 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading kicker={kicker} title={title} subtitle={subtitle} />
          <Link
            href="/services"
            className="group inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-foreground transition-colors hover:text-accent lg:self-end"
          >
            {tNav('viewAllServices')}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      )}

      <ServiceList
        learnMore={t('learnMore')}
        services={services.map((service) => ({
          slug: service.slug,
          title: service.title,
          shortDescription: service.shortDescription,
          coverImage: service.coverImage,
        }))}
      />
    </Section>
  );
}
