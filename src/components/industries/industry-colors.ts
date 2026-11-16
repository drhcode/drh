/** Panel colours from the industries artboard, keyed by industry slug. */
export const INDUSTRY_COLORS: Record<string, string> = {
  construction: '#FF8A3D',
  'real-estate': '#7FB7FF',
  'medical-dental': '#9FE3D0',
  hospitality: '#C98E5B',
  legal: '#C9CFCB',
  'fitness-wellness': '#FF7AA8',
  automotive: '#B9A4FF',
  ecommerce: '#D4FF3A',
  saas: '#6FE0FF',
  education: '#FFD66F',
};

export function industryColor(slug: string, index: number): string {
  return INDUSTRY_COLORS[slug] ?? Object.values(INDUSTRY_COLORS)[index % 10];
}
