'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = Primitive.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item>
>(({ className, ...props }, ref) => (
  <Primitive.Item ref={ref} className={cn('border-b border-border', className)} {...props} />
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
        'group flex flex-1 items-start justify-between gap-6 py-5 text-left text-base font-medium text-foreground transition-colors hover:text-accent',
        className,
      )}
      {...props}
    >
      {children}
      <Plus className="mt-0.5 size-5 shrink-0 text-subtle-foreground transition-transform duration-200 group-data-[state=open]:rotate-45" />
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
    className="overflow-hidden text-[0.9375rem] leading-relaxed text-muted-foreground"
    {...props}
  >
    <div className={cn('pb-5 pr-10', className)}>{children}</div>
  </Primitive.Content>
));
AccordionContent.displayName = Primitive.Content.displayName;
