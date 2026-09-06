'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = Primitive.Root;
export const SelectGroup = Primitive.Group;
export const SelectValue = Primitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <Primitive.Trigger
    ref={ref}
    className={cn(
      'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-[0.9375rem] text-foreground shadow-xs transition-colors',
      'hover:border-border-strong',
      'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'data-[placeholder]:text-subtle-foreground',
      'aria-[invalid=true]:border-danger',
      className,
    )}
    {...props}
  >
    {children}
    <Primitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 text-subtle-foreground" />
    </Primitive.Icon>
  </Primitive.Trigger>
));
SelectTrigger.displayName = Primitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      position={position}
      className={cn(
        'anim-pop relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg',
        position === 'popper' && 'w-[var(--radix-select-trigger-width)] translate-y-1',
        className,
      )}
      {...props}
    >
      <Primitive.Viewport className="p-1">{children}</Primitive.Viewport>
    </Primitive.Content>
  </Primitive.Portal>
));
SelectContent.displayName = Primitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, children, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2.5 text-sm text-foreground outline-none transition-colors',
      'focus:bg-surface-sunken data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex size-4 items-center justify-center">
      <Primitive.ItemIndicator>
        <Check className="size-3.5 text-accent" />
      </Primitive.ItemIndicator>
    </span>
    <Primitive.ItemText>{children}</Primitive.ItemText>
  </Primitive.Item>
));
SelectItem.displayName = Primitive.Item.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof Primitive.Label>,
  React.ComponentPropsWithoutRef<typeof Primitive.Label>
>(({ className, ...props }, ref) => (
  <Primitive.Label
    ref={ref}
    className={cn('px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider text-subtle-foreground', className)}
    {...props}
  />
));
SelectLabel.displayName = Primitive.Label.displayName;
