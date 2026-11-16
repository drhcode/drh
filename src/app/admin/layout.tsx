import type { Metadata } from 'next';
import { Document, rootMetadata } from '@/components/document';

export { viewport } from '@/components/document';

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await rootMetadata()),
    title: { default: 'Admin — drh.al', template: '%s · drh.al Admin' },
    robots: { index: false, follow: false, nocache: true },
  };
}

/**
 * Admin root.
 *
 * Renders the shared <html> document (the app's root layout is a pass-through
 * so public pages can prerender). The signed-in shell lives in
 * (dashboard)/layout.tsx and the login screen in (auth)/, so the two do not
 * share chrome. The admin is English-only.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <Document lang="en">{children}</Document>;
}
