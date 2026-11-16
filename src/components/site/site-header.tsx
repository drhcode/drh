'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { DrhLogo } from '@/components/brand/drh-logo';
import { Close, Menu } from '@/components/brand/icons';
import { ThemeSwitch } from './theme-switch';
import { LocaleSwitch } from './locale-switch';
import { cn } from '@/lib/utils';

const LINKS = [
  { key: 'services', href: '/services' },
  { key: 'work', href: '/work' },
  { key: 'industries', href: '/industries' },
  { key: 'about', href: '/about' },
  { key: 'journal', href: '/blog' },
  { key: 'pricing', href: '/pricing' },
] as const;

export const HEADER_HEIGHT = 88;

/** ⌘K palette (cmdk + dialog) loads after hydration, off the critical path. */
const SiteSearch = dynamic(() => import('./site-search').then((m) => m.SiteSearch), { ssr: false });

/**
 * Fixed, frosted header. Hides while scrolling down past 240px and returns on
 * any upward scroll; gains a hairline and shadow once the page has moved.
 * Below 861px the links collapse into a full-screen menu.
 */
export function SiteHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setHidden(y > last && y > 240);
        setScrolled(y > 8);
        last = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Close the menu on navigation.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Full-screen menu: lock page scroll, close on Escape, keep focus inside.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !menuRef.current) return;
      const items = [toggleRef.current, ...menuRef.current.querySelectorAll<HTMLElement>('a, button')].filter(
        Boolean,
      ) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div aria-hidden="true" style={{ height: HEADER_HEIGHT }} />
      <header
        className="navbar fixed inset-x-0 top-0 z-50 border-b border-transparent text-fg"
        data-hidden={hidden && !open}
        data-scrolled={scrolled || open}
      >
        <div className="wrap flex items-center gap-6" style={{ height: HEADER_HEIGHT }}>
          <Link href="/" aria-label={t('home')} className="-m-2 rounded-lg p-2 transition-colors hover:text-acct">
            <DrhLogo className="h-[22px] sm:h-6" />
          </Link>

          <nav aria-label={t('mainNavigation')} className="hide-sm ml-auto flex gap-0.5">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="nl"
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="hide-sm flex items-center gap-2.5">
            <LocaleSwitch />
            <ThemeSwitch />
            <Link href="/contact" className="btn btn-p h-[46px] px-[22px] text-[15px]">
              {t('startProject')}
            </Link>
          </div>

          <div className="show-sm ml-auto flex items-center gap-2">
            <ThemeSwitch />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t('closeMenu') : t('openMenu')}
              className="grid size-12 cursor-pointer place-items-center rounded-full border border-ln2 bg-transparent text-fg"
            >
              {open ? <Close size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <SiteSearch showTrigger={false} />
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="slide-down show-sm fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto border-t border-ln bg-bg px-5 pb-8 pt-2"
          style={{ top: HEADER_HEIGHT }}
        >
          <nav aria-label={t('mainNavigation')} className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'border-b border-ln py-4 text-[30px] font-semibold tracking-[-0.03em]',
                  isActive(link.href) ? 'text-acct' : 'text-fg',
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <LocaleSwitch size="lg" className="mt-5" />
          <Link href="/contact" className="btn btn-p mt-4 h-14 w-full text-base">
            {t('startProject')}
          </Link>
        </div>
      )}
    </>
  );
}
