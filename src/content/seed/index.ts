/**
 * The single source of truth for drh.al's initial content.
 *
 * Used in two places:
 *   1. `npm run seed:sql` generates supabase/seed.sql from these records.
 *   2. When Supabase is not configured, the data layer falls back to this
 *      dataset so the site renders locally. See src/lib/data/source.ts.
 */
export * from './technologies';
export * from './industries';
export * from './services';
export * from './projects';
export * from './blog';
export * from './faqs';
export * from './pages';
export * from './settings';

import type { TestimonialRow } from '@/types/database';

/**
 * Intentionally empty. drh.al does not publish invented reviews (spec §19, §100).
 * Real testimonials are added by the team from /admin/testimonials, and the
 * public testimonial section hides itself when there are none.
 */
export const testimonials: TestimonialRow[] = [];
