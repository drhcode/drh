import Image from 'next/image';
import { Star } from 'lucide-react';
import type { TestimonialView } from '@/lib/data/types';
import { initials } from '@/lib/utils';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';
import { GlowGrid } from '@/components/ui/glow';

/**
 * Testimonials (spec §19).
 *
 * Renders nothing when the CMS has no active testimonials — drh.al does not
 * ship placeholder or invented reviews (spec §100).
 */
export function TestimonialsSection({
  title,
  subtitle,
  testimonials,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  testimonials: TestimonialView[];
  bordered?: boolean;
}) {
  if (testimonials.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading title={title} subtitle={subtitle} />}

      <GlowGrid as="ul" className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal as="li" key={testimonial.id} delay={index * 0.06}>
            <figure
              data-glow
              className="glow-card flex h-full flex-col rounded-xl border border-border bg-surface p-7"
            >
              {testimonial.rating != null && (
                <div className="mb-4 flex gap-0.5" aria-label={`${testimonial.rating} / 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={
                        i < (testimonial.rating ?? 0)
                          ? 'size-3.5 fill-accent text-accent'
                          : 'size-3.5 text-border-strong'
                      }
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}

              <blockquote className="flex-1 text-[0.9375rem] leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                {testimonial.photoUrl ? (
                  <Image
                    src={testimonial.photoUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent">
                    {initials(testimonial.clientName)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {testimonial.clientName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[testimonial.position, testimonial.company, testimonial.country]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </GlowGrid>
    </Section>
  );
}
