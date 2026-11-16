/**
 * Facts the design has room for but that only drh.al can supply.
 *
 * Every value here starts as `null`, and the block that shows it renders
 * nothing until a real value is filled in. Never put an estimate or a
 * placeholder here — these appear on public pages as statements of fact.
 */
export const siteConfig = {
  /**
   * Google Business Profile rating, shown as the review card on the home page.
   * Example: { rating: 4.9, count: 37, url: 'https://g.page/r/…' }
   */
  googleRating: null as null | { rating: number; count: number; url: string },

  /**
   * The person a visitor meets on the strategy call (shown on /book).
   * Example: { name: 'Dorian', role: 'Lead developer', photo: '/media/team/dorian.jpg' }
   */
  bookingHost: null as null | { name: string; role?: string; photo?: string },
} as const;
