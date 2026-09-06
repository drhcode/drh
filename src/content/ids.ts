/**
 * Deterministic seed identifiers.
 *
 * Seed rows need stable UUIDs so the SQL seed can be re-run idempotently
 * (`on conflict (id) do update`) and so the offline preview dataset lines up
 * with a real database row-for-row.
 */
export const NS = {
  industry: 1,
  service: 2,
  project: 3,
  technology: 4,
  blogPost: 5,
  faq: 6,
  page: 7,
  blogCategory: 8,
  projectMedia: 9,
  blogTag: 10,
} as const;

export function seedId(namespace: number, index: number): string {
  const a = namespace.toString(16).padStart(8, '0');
  const b = index.toString(16).padStart(12, '0');
  return `${a}-0000-4000-8000-${b}`;
}
