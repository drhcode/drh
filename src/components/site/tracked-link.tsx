'use client';

import type { ReactNode } from 'react';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';

const EVENTS = {
  whatsapp: () => track(ANALYTICS_EVENTS.whatsappClicked),
  phone: () => track(ANALYTICS_EVENTS.phoneClicked),
  email: () => track(ANALYTICS_EVENTS.contactClicked, { channel: 'email' }),
  outbound: () => track(ANALYTICS_EVENTS.outboundProjectClicked),
} as const;

/**
 * A plain anchor that records the same first-party events the old contact
 * links did (WhatsApp, phone, email), so admin reporting keeps working.
 */
export function TrackedLink({
  href,
  event,
  external = false,
  className,
  children,
  ...rest
}: {
  href: string;
  event: keyof typeof EVENTS;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>) {
  return (
    <a
      href={href}
      className={className}
      onClick={EVENTS[event]}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
