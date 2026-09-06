import * as React from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-lg border border-border bg-surface text-foreground shadow-xs transition-colors placeholder:text-subtle-foreground hover:border-border-strong focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(fieldBase, 'h-11 px-3.5 py-2 text-[0.9375rem]', className)}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, 'min-h-32 resize-y px-3.5 py-2.5 text-[0.9375rem]', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { fieldBase };
