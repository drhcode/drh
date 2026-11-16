import type { ProjectView, TestimonialView } from './types';

const normalise = (value: string) => value.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');

/**
 * The testimonial that belongs to a project.
 *
 * A project linked explicitly in the admin (testimonial_id) wins. Otherwise the
 * quote is matched on the client name, so "BIA Empowerment" pairs with the
 * project "BIA" and "FoxBox" with "smsfoxbox.it". Names shorter than three
 * characters never match by containment, to avoid accidental pairings.
 */
export function matchTestimonial(
  project: Pick<ProjectView, 'clientName' | 'testimonial'>,
  testimonials: TestimonialView[],
): TestimonialView | null {
  if (project.testimonial) return project.testimonial;
  const client = normalise(project.clientName);
  if (client.length < 3) return null;

  for (const item of testimonials) {
    for (const name of [item.company, item.clientName]) {
      if (!name) continue;
      const candidate = normalise(name);
      if (candidate.length < 3) continue;
      if (candidate === client || candidate.includes(client) || client.includes(candidate)) return item;
    }
  }
  return null;
}
