import Link from 'next/link';
import { Document } from '@/components/document';
import { DrhLogo } from '@/components/brand/drh-logo';

/**
 * 404 for URLs outside the localized site and the admin (for example a path
 * with a file extension that the middleware does not route). Localized 404s
 * are rendered by src/app/[locale]/not-found.tsx inside the full site shell.
 */
export default function RootNotFound() {
  return (
    <Document lang="en">
      <main className="grid min-h-dvh place-items-center bg-[#0b0d0c] p-8 text-[#F2F4F0]">
        <div className="max-w-md text-center">
          <DrhLogo className="mx-auto mb-10 h-8" />
          <p className="font-mono text-sm text-[#D4FF3A]">404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page doesn’t exist.</h1>
          <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#D4FF3A] px-6 font-semibold text-[#0b0d0c]">
            drh.al
          </Link>
        </div>
      </main>
    </Document>
  );
}
