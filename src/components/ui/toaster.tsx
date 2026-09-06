'use client';

import { Toaster as Sonner } from 'sonner';

/**
 * Toast host. Styled through CSS variables so it follows the app theme
 * without a second colour system.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        },
        className: 'text-sm',
      }}
    />
  );
}

export { toast } from 'sonner';
