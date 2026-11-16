import { cn } from '@/lib/utils';

/**
 * The DRH logo, traced from the master artwork into one path of lines and
 * cubic curves: D, R and H, with the D's counter cut out by the even-odd rule.
 * Kept as data so the same outline drives the header, the footer outline, the
 * social cards and the files in public/brand/ (regenerate those with
 * `npm run brand:assets`).
 */
export const DRH_LOGO_WIDTH = 753.8;
export const DRH_LOGO_HEIGHT = 235;
export const DRH_LOGO_VIEWBOX = `0 0 ${DRH_LOGO_WIDTH} ${DRH_LOGO_HEIGHT}`;
export const DRH_LOGO_PATH =
  'M0 235L0 0L120.5 0C131.9 0.5 144.1 3.4 154.6 7.5C246.9 42.5 249.4 189.5 157.5 226.5C147 230.7 134.9 234.3 123.5 235L90.6 235ZM449.4 150.5L495.4 235L403.9 235L362.2 147C360.3 143.1 361.5 119.8 361.3 113.9C370.4 113.9 383.8 115.7 392 111C402.3 105.1 401.8 89.2 391.6 83.5C382.6 78.5 365.4 80.9 355.3 80.7L355.3 235L268.1 235L268.1 0L381.5 0L397 2.1C425.1 5.7 454.4 15.6 471.9 39.1C496.2 71.6 492.6 133.1 449.4 150.5ZM617 0L617 78.7L666.6 78.7L666.6 0L753.8 0L753.8 235L666.6 235L666.6 156.5L617 156.5L617 235L529.9 235L529.9 0ZM87.2 90.7C97.1 90.7 114.9 88.6 123.6 93.5C138.3 101.7 139.2 130.1 125.3 139.3C115.4 145.7 98.4 143.2 87.2 143.2Z';

/**
 * Inline SVG logo in `currentColor`, so it follows the theme like text does.
 * Size it by height (`h-6`); the width follows the artwork's aspect ratio and
 * the width/height attributes reserve the space before CSS loads.
 *
 * Pass `title` when the logo is the only content of a link or heading — it
 * becomes the accessible name. Without it the logo is decorative and hidden
 * from assistive technology.
 */
export function DrhLogo({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={DRH_LOGO_VIEWBOX}
      width={DRH_LOGO_WIDTH}
      height={DRH_LOGO_HEIGHT}
      fill="currentColor"
      className={cn('block h-6 w-auto flex-none', className)}
      focusable="false"
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <path d={DRH_LOGO_PATH} fillRule="evenodd" />
    </svg>
  );
}
