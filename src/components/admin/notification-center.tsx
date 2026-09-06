'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Bell, CheckCheck, CircleAlert, Info, PartyPopper } from 'lucide-react';
import { markNotificationsRead } from '@/app/admin/actions/notifications';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AdminNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  severity: string;
  is_read: boolean;
  created_at: string;
}

const SEVERITY_ICON = {
  info: Info,
  success: PartyPopper,
  warning: AlertTriangle,
  error: CircleAlert,
} as const;

const SEVERITY_COLOR: Record<string, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
};

/** Notification centre (spec §78). */
export function NotificationCenter({
  notifications,
  unreadCount,
}: {
  notifications: AdminNotification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function markAllRead() {
    startTransition(async () => {
      await markNotificationsRead();
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-2 rounded-full bg-accent ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-accent disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing yet. New leads and system alerts land here.
          </p>
        ) : (
          <ul className="scrollbar-thin max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.map((notification) => {
              const Icon =
                SEVERITY_ICON[notification.severity as keyof typeof SEVERITY_ICON] ?? Info;

              const content = (
                <div className="flex gap-3 px-4 py-3">
                  <Icon
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      SEVERITY_COLOR[notification.severity] ?? 'text-info',
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        notification.is_read ? 'text-muted-foreground' : 'font-medium text-foreground',
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.body}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-subtle-foreground">
                      {new Date(notification.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );

              return (
                <li key={notification.id} className="transition-colors hover:bg-surface-sunken">
                  {notification.href ? (
                    <Link href={notification.href} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
