import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/login-form';
import { Logo } from '@/components/site/logo';
import { isSupabaseConfigured } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-lines opacity-[0.4] dark:opacity-[0.2]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="text-xl" />
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to the drh.al control panel.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm md:p-7">
          {isSupabaseConfigured ? (
            <LoginForm next={next} />
          ) : (
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Supabase is not configured.</p>
              <p className="mt-2">
                Set <code className="rounded bg-surface-sunken px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
                and{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
                in <code className="rounded bg-surface-sunken px-1 py-0.5 text-xs">.env.local</code>, then run the
                migrations in <code className="rounded bg-surface-sunken px-1 py-0.5 text-xs">supabase/migrations</code>.
              </p>
              <p className="mt-3">
                The public site runs without a database using the seed content; the admin does not.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-subtle-foreground">
          Protected area. All sign-ins are recorded in the activity log.
        </p>
      </div>
    </div>
  );
}
