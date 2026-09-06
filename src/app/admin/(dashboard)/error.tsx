'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Admin error boundary — keeps the shell intact so navigation still works. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[admin] render error', error);
  }, [error]);

  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-8">
      <h1 className="text-lg font-medium text-foreground">Something went wrong on this screen.</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        The rest of the admin is unaffected. If this keeps happening, check that the Supabase
        environment variables are set and that the migrations have been applied.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-subtle-foreground">Ref: {error.digest}</p>
      )}
      <Button className="mt-6" size="sm" onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
