'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverAnchor = Primitive.Anchor;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, align = 'center', sideOffset = 8, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'anim-pop z-50 w-72 rounded-xl border border-border bg-surface-raised p-4 shadow-lg',
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
PopoverContent.displayName = Primitive.Content.displayName;
