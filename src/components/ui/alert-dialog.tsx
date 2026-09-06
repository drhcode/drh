'use client';

import * as React from 'react';
import * as Primitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

export const AlertDialog = Primitive.Root;
export const AlertDialogTrigger = Primitive.Trigger;

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
    <Primitive.Content
      ref={ref}
      className={cn(
        'anim-dialog fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-surface p-6 shadow-lg',
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
AlertDialogContent.displayName = Primitive.Content.displayName;

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof Primitive.Title>,
  React.ComponentPropsWithoutRef<typeof Primitive.Title>
>(({ className, ...props }, ref) => (
  <Primitive.Title ref={ref} className={cn('text-lg font-medium text-foreground', className)} {...props} />
));
AlertDialogTitle.displayName = Primitive.Title.displayName;

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof Primitive.Description>,
  React.ComponentPropsWithoutRef<typeof Primitive.Description>
>(({ className, ...props }, ref) => (
  <Primitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
AlertDialogDescription.displayName = Primitive.Description.displayName;

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

export const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof Primitive.Action>,
  React.ComponentPropsWithoutRef<typeof Primitive.Action> & { destructive?: boolean }
>(({ className, destructive, ...props }, ref) => (
  <Primitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: destructive ? 'danger' : 'primary', size: 'sm' }), className)}
    {...props}
  />
));
AlertDialogAction.displayName = Primitive.Action.displayName;

export const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof Primitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof Primitive.Cancel>
>(({ className, ...props }, ref) => (
  <Primitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = Primitive.Cancel.displayName;
