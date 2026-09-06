'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

export const Avatar = React.forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn('relative flex size-9 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = Primitive.Root.displayName;

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Primitive.Image>,
  React.ComponentPropsWithoutRef<typeof Primitive.Image>
>(({ className, ...props }, ref) => (
  <Primitive.Image ref={ref} className={cn('aspect-square size-full object-cover', className)} {...props} />
));
AvatarImage.displayName = Primitive.Image.displayName;

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Primitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof Primitive.Fallback>
>(({ className, ...props }, ref) => (
  <Primitive.Fallback
    ref={ref}
    className={cn(
      'flex size-full items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = Primitive.Fallback.displayName;
