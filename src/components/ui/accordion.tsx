'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = Primitive.Root;

/** Each item is its own card, filled in while open. */
export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      'rounded-2xl border border-border transition-colors duration-300 hover:border-border-strong data-[state=open]:border-border-strong data-[state=open]:bg-surface',
      className,
    )}
    {...props}
  />
));
AccordionItem.displayName = Primitive.Item.displayName;

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <Primitive.Header className="flex">
    <Primitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center gap-4 rounded-2xl px-5 py-5 text-left text-base font-medium text-foreground md:gap-5 md:px-6 md:py-6 md:text-[1.0625rem]',
        className,
      )}
      {...props}
    >
      {children}
      <span className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-foreground transition-all duration-300 group-hover:border-accent group-data-[state=open]:rotate-45 group-data-[state=open]:border-accent group-data-[state=open]:bg-accent group-data-[state=open]:text-accent-foreground">
        <Plus className="size-4" />
      </span>
    </Primitive.Trigger>
  </Primitive.Header>
));
AccordionTrigger.displayName = Primitive.Trigger.displayName;

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, ...props }, ref) => (
  <Primitive.Content
    ref={ref}
    className="anim-accordion overflow-hidden text-[0.9375rem] leading-relaxed text-muted-foreground"
    {...props}
  >
    <div className={cn('px-5 pb-6 pr-16 md:px-6', className)}>{children}</div>
  </Primitive.Content>
));
AccordionContent.displayName = Primitive.Content.displayName;
