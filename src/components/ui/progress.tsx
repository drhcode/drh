'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export const Progress = React.forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root> & { value?: number }
>(({ className, value = 0, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken', className)}
    {...props}
  >
    <Primitive.Indicator
      className="h-full rounded-full bg-accent transition-transform duration-300"
      style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
    />
  </Primitive.Root>
));
Progress.displayName = Primitive.Root.displayName;
