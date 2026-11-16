'use client';

import { usePathname } from '@/i18n/navigation';
import { DrhLogo } from '@/components/brand/drh-logo';

/**
 * Lime page-enter curtain with the DRH logo sweeping up. Keyed on the pathname, so
 * it plays on first load (straight from the server HTML, no JavaScript needed)
 * and again on every client-side route change. Purely decorative: it ignores
 * pointer events, is hidden from assistive technology and disappears entirely
 * under prefers-reduced-motion.
 */
export function PageCurtain() {
  const pathname = usePathname();
  return (
    <div key={pathname} className="curtain" aria-hidden="true">
      <span>
        <DrhLogo className="h-10" />
      </span>
    </div>
  );
}
