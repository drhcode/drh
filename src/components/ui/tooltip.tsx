'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'anim-pop z-50 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-foreground shadow-md',
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
TooltipContent.displayName = Primitive.Content.displayName;
