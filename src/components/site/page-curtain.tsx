'use client';

import { usePathname } from '@/i18n/navigation';

/**
 * Lime page-enter curtain with "drh.al" sweeping up. Keyed on the pathname, so
 * it plays on first load (straight from the server HTML, no JavaScript needed)
 * and again on every client-side route change. Purely decorative: it ignores
 * pointer events, is hidden from assistive technology and disappears entirely
 * under prefers-reduced-motion.
 */
export function PageCurtain() {
  const pathname = usePathname();
  return (
    <div key={pathname} className="curtain" aria-hidden="true">
      <span>drh.al</span>
    </div>
  );
}
