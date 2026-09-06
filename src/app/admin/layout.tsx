import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin — drh.al', template: '%s · drh.al Admin' },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin root.
 *
 * Intentionally thin: the signed-in shell lives in (dashboard)/layout.tsx and
 * the login screen in (auth)/, so the two do not share chrome.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
