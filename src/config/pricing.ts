/**
 * Project estimator — every number the /pricing page and the service price
 * tiers use lives in this file.
 *
 * HOW THE ESTIMATE WORKS
 *
 *   1. The project type sets a base range (`min`–`max`). These are the ranges
 *      published in the FAQ: focused sites €2–5k, multilingual corporate sites
 *      €5–15k, and platforms / stores / apps "from €15k".
 *
 *   2. Scope moves the estimate inside that range. A "complexity" score from 0
 *      to 1 is the sum of:
 *        - pages:     (pages − 1) / (maxPages − 1) × `pagesWeight`
 *        - languages: every language after the first adds `perExtraLanguage`
 *        - features:  every selected feature adds its own `weight`
 *      and is capped at 1.
 *
 *   3. For a closed range the low end sits `lowShare` of the way to the
 *      complexity point, and the high end `highHeadroom` above it — so a
 *      bigger scope shifts and widens the range. For an open-ended type
 *      ("from €15k") only a starting price is shown: `min × (1 + complexity)`.
 *
 *   4. Fast-track multiplies everything by `fastTrackMultiplier`. Results are
 *      rounded to `roundTo` euros.
 *
 * TO TUNE: change the ranges or weights below. `npm test` checks that every
 * estimate stays inside the published ranges and moves in the right direction.
 */

export type ProjectTypeId = 'business' | 'corporate' | 'ecommerce' | 'webapp' | 'mobile';
export type FeatureId = 'cms' | 'forms' | 'pay' | 'seo' | 'integr' | 'ai' | 'copy' | 'brand';
export type BudgetBand = 'under_2k' | '2k_5k' | '5k_15k' | '15k_30k' | '30k_plus';
export type ServiceOption = 'web_design_development' | 'custom_web_application' | 'mobile_app';

export interface ProjectType {
  id: ProjectTypeId;
  /** Lowest price for the simplest version of this kind of project, in EUR. */
  min: number;
  /** Highest price, or `null` for open-ended work quoted against a spec. */
  max: number | null;
  /** The contact-form service this project type pre-selects. */
  service: ServiceOption;
  /** Icon from the design (64×64 line drawing). */
  icon: string;
}

export const PRICING = {
  currency: 'EUR',

  /** Base ranges — keep in step with the FAQ answer on pricing. */
  projectTypes: [
    { id: 'business', min: 2000, max: 5000, service: 'web_design_development', icon: 'M8 14h48v36H8zM8 22h48M18 32h20M18 40h28' },
    { id: 'corporate', min: 5000, max: 15000, service: 'web_design_development', icon: 'M32 6a26 26 0 100 52 26 26 0 000-52zM6 32h52M32 6c8 8 8 44 0 52M32 6c-8 8-8 44 0 52' },
    { id: 'ecommerce', min: 15000, max: null, service: 'web_design_development', icon: 'M6 10h8l6 30h30l6-20H18M24 50a3 3 0 106 0a3 3 0 10-6 0M42 50a3 3 0 106 0a3 3 0 10-6 0' },
    { id: 'webapp', min: 15000, max: null, service: 'custom_web_application', icon: 'M10 10h20v20H10zM34 10h20v20H34zM10 34h20v20H10zM34 44h20M44 34v20' },
    { id: 'mobile', min: 15000, max: null, service: 'mobile_app', icon: 'M20 6h24v52H20zM28 12h8M30 50h4' },
  ] satisfies readonly ProjectType[],

  /** Add-on features and how much each adds to the complexity score (0–1). */
  features: [
    { id: 'cms', weight: 0.07 },
    { id: 'forms', weight: 0.07 },
    { id: 'pay', weight: 0.07 },
    { id: 'seo', weight: 0.07 },
    { id: 'integr', weight: 0.07 },
    { id: 'ai', weight: 0.07 },
    { id: 'copy', weight: 0.07 },
    { id: 'brand', weight: 0.07 },
  ] satisfies readonly { id: FeatureId; weight: number }[],

  /** Languages offered in the estimator. The first one is free. */
  languages: ['EN', 'SQ', 'IT', 'DE', 'FR'],

  scope: {
    /** Slider range for pages / screens. The top value reads "40+". */
    minPages: 1,
    maxPages: 40,
    /** Share of the complexity score a 40-page project contributes. */
    pagesWeight: 0.5,
    /** Complexity added by each language after the first. */
    perExtraLanguage: 0.12,
    /** Where the low end sits, as a share of the complexity point. */
    lowShare: 0.6,
    /** How far above the complexity point the high end reaches. */
    highHeadroom: 0.35,
  },

  /** Fast-track timeline multiplier. */
  fastTrackMultiplier: 1.15,

  /** Estimates are rounded to this many euros. */
  roundTo: 500,

  /** The right-hand end of the visual price bar ("€30k+"). */
  scaleMax: 30000,

  /** Defaults the estimator opens with. */
  defaults: { type: 'business' as ProjectTypeId, pages: 8, languages: ['EN', 'SQ'], features: ['cms', 'forms'] as FeatureId[], fastTrack: false },
} as const;

/** The three published tiers (services page "Investment" section). */
export const PRICE_TIERS = [
  { id: 'focused', min: 2000, max: 5000, budget: '2k_5k' as BudgetBand },
  { id: 'corporate', min: 5000, max: 15000, budget: '5k_15k' as BudgetBand },
  { id: 'platforms', min: 15000, max: null, budget: '15k_30k' as BudgetBand },
] as const;

export interface EstimateInput {
  type: ProjectTypeId;
  pages: number;
  languages: string[];
  features: FeatureId[];
  fastTrack: boolean;
}

export interface Estimate {
  /** Low end of the range, in EUR. */
  low: number;
  /** High end, or null for open-ended ("from …") estimates. */
  high: number | null;
  /** Complexity score used, 0–1. */
  complexity: number;
  /** Position of the range on the 0 → scaleMax bar, in percent. */
  bar: { left: number; width: number };
  /** Contact-form budget band that best matches this estimate. */
  budget: BudgetBand;
  /** Contact-form service this project type maps to. */
  service: ServiceOption;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round = (value: number) => Math.round(value / PRICING.roundTo) * PRICING.roundTo;

export function projectType(id: ProjectTypeId): ProjectType {
  const found = PRICING.projectTypes.find((type) => type.id === id);
  if (!found) throw new Error(`Unknown project type: ${id}`);
  return found;
}

export function complexity(input: Pick<EstimateInput, 'pages' | 'languages' | 'features'>): number {
  const { minPages, maxPages, pagesWeight, perExtraLanguage } = PRICING.scope;
  const pages = clamp(input.pages, minPages, maxPages);
  const pageScore = ((pages - minPages) / (maxPages - minPages)) * pagesWeight;
  const languageScore = Math.max(0, input.languages.length - 1) * perExtraLanguage;
  const featureScore = input.features.reduce(
    (sum, id) => sum + (PRICING.features.find((feature) => feature.id === id)?.weight ?? 0),
    0,
  );
  return Math.min(1, pageScore + languageScore + featureScore);
}

/** Maps a price to the nearest contact-form budget band. */
export function budgetBand(low: number, high: number | null): BudgetBand {
  const reference = high ?? low;
  if (reference < 2000) return 'under_2k';
  if (reference <= 5000) return '2k_5k';
  if (reference <= 15000) return '5k_15k';
  if (reference <= 30000) return '15k_30k';
  return '30k_plus';
}

export function estimate(input: EstimateInput): Estimate {
  const type = projectType(input.type);
  const c = complexity(input);
  const k = input.fastTrack ? PRICING.fastTrackMultiplier : 1;
  const { lowShare, highHeadroom } = PRICING.scope;

  let low: number;
  let high: number | null;
  if (type.max !== null) {
    const span = type.max - type.min;
    low = round((type.min + span * c * lowShare) * k);
    high = Math.max(low + PRICING.roundTo, round((type.min + span * Math.min(1, c + highHeadroom)) * k));
  } else {
    low = round(type.min * (1 + c) * k);
    high = null;
  }

  const pct = (value: number) => Math.min(100, (value / PRICING.scaleMax) * 100);
  const barHigh = high ?? PRICING.scaleMax;
  return {
    low,
    high,
    complexity: c,
    bar: { left: pct(low), width: Math.max(3, pct(barHigh) - pct(low)) },
    budget: budgetBand(low, high),
    service: type.service,
  };
}

/** "€2k", "€12.5k", "€800". */
export function formatEuro(value: number): string {
  if (value < 1000) return `€${value}`;
  const thousands = Math.round(value / 100) / 10;
  return `€${String(thousands).replace(/\.0$/, '')}k`;
}
