import type { TechnologyRow } from '@/types/database';
import { NS, seedId } from '../ids';

/** Technology strip + project/service tagging (spec §13). */
export const technologies: TechnologyRow[] = [
  { slug: 'react', name: 'React', icon_key: 'react', color: '#61DAFB' },
  { slug: 'nextjs', name: 'Next.js', icon_key: 'nextjs', color: '#000000' },
  { slug: 'nodejs', name: 'Node.js', icon_key: 'nodejs', color: '#5FA04E' },
  { slug: 'typescript', name: 'TypeScript', icon_key: 'typescript', color: '#3178C6' },
  { slug: 'javascript', name: 'JavaScript', icon_key: 'javascript', color: '#F7DF1E' },
  { slug: 'wordpress', name: 'WordPress', icon_key: 'wordpress', color: '#21759B' },
  { slug: 'woocommerce', name: 'WooCommerce', icon_key: 'woocommerce', color: '#96588A' },
  { slug: 'php', name: 'PHP', icon_key: 'php', color: '#777BB4' },
  { slug: 'supabase', name: 'Supabase', icon_key: 'supabase', color: '#3ECF8E' },
  { slug: 'react-native', name: 'React Native', icon_key: 'react', color: '#61DAFB' },
  { slug: 'postgresql', name: 'PostgreSQL', icon_key: 'postgresql', color: '#4169E1' },
  { slug: 'tailwind', name: 'Tailwind CSS', icon_key: 'tailwind', color: '#06B6D4' },
].map((t, i) => ({
  id: seedId(NS.technology, i + 1),
  slug: t.slug,
  name: t.name,
  icon_key: t.icon_key,
  color: t.color,
  sort_order: i,
  is_active: true,
}));

export const techBySlug = (slug: string) =>
  technologies.find((t) => t.slug === slug)!;
