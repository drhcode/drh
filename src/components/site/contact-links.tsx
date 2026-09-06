'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function EmailLink({ email, className }: { email: string; className?: string }) {
  return (
    <a
      href={`mailto:${email}`}
      onClick={() => track(ANALYTICS_EVENTS.contactClicked, { channel: 'email' })}
      className={cn('inline-flex items-center gap-2 transition-colors hover:text-accent', className)}
    >
      <Mail className="size-4 shrink-0" aria-hidden="true" />
      {email}
    </a>
  );
}

export function PhoneLink({
  phone,
  display,
  className,
}: {
  phone: string;
  display: string;
  className?: string;
}) {
  return (
    <a
      href={`tel:${phone}`}
      onClick={() => track(ANALYTICS_EVENTS.phoneClicked)}
      className={cn('inline-flex items-center gap-2 transition-colors hover:text-accent', className)}
    >
      <Phone className="size-4 shrink-0" aria-hidden="true" />
      {display}
    </a>
  );
}

export function WhatsAppLink({
  number,
  label,
  className,
}: {
  number: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(ANALYTICS_EVENTS.whatsappClicked)}
      className={cn('inline-flex items-center gap-2 transition-colors hover:text-accent', className)}
    >
      <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </a>
  );
}

export function WhatsAppButton({
  number,
  label,
  className,
}: {
  number: string;
  label: string;
  className?: string;
}) {
  return (
    <Button asChild variant="outline" className={className}>
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(ANALYTICS_EVENTS.whatsappClicked)}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}
