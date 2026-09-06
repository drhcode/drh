'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { signIn, requestPasswordReset, type AuthActionState } from '@/app/admin/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(signIn, {});
  const [mode, setMode] = React.useState<'signin' | 'reset'>('signin');

  if (mode === 'reset') return <ResetForm onBack={() => setMode('signin')} />;

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@drh.al"
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            onClick={() => setMode('reset')}
            className="text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            Forgot?
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="mt-2"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/8 px-3 py-2.5 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <SubmitButton label="Sign in" pendingLabel="Signing in…" />
    </form>
  );
}

function ResetForm({ onBack }: { onBack: () => void }) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(requestPasswordReset, {});
  const [sent, setSent] = React.useState(false);

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        setSent(true);
      }}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@drh.al"
          className="mt-2"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          We will email a reset link if an account exists for that address.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      {sent && !state.error && (
        <p role="status" className="text-sm text-success">
          Check your inbox for the reset link.
        </p>
      )}

      <SubmitButton label="Send reset link" pendingLabel="Sending…" />

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-accent"
      >
        Back to sign in
      </button>
    </form>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? pendingLabel : label}
    </Button>
  );
}
