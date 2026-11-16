import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/brand/icons';
import { ServiceIcon } from '@/components/brand/service-icon';
import type { ServiceView } from '@/lib/data';

/** Home / landing-page service grid: drawn icon, number, title, summary, stack. */
export function ServiceCards({ services }: { services: ServiceView[] }) {
  return (
    <div className="mt-14 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
      {services.map((service, index) => (
        <Link
          key={service.slug}
          href={`/services/${service.slug}`}
          className="card reveal flex min-h-80 flex-col gap-5 rounded-3xl border border-ln bg-s1 p-8 text-fg max-sm:p-6"
        >
          <div className="flex items-start justify-between">
            <span className="flex flex-col gap-[18px]">
              <ServiceIcon slug={service.slug} />
              <span className="mono text-[13px] text-t3">{String(index + 1).padStart(2, '0')}</span>
            </span>
            <span className="arrow-dot size-11 border border-ln2 text-fg">
              <ArrowRight />
            </span>
          </div>
          <div className="mt-auto">
            <h3 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">{service.title}</h3>
            {service.shortDescription && (
              <p className="mt-2.5 text-[15px] leading-[1.55] text-t3">{service.shortDescription}</p>
            )}
            {service.technologies.length > 0 && (
              <p className="mono mt-5 text-xs uppercase text-t2">
                {service.technologies
                  .slice(0, 3)
                  .map((tech) => tech.name)
                  .join(' · ')}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
