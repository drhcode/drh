import './globals.css';

/**
 * Root layout — a pass-through.
 *
 * The <html> element is rendered by src/app/[locale]/layout.tsx (public site,
 * with `lang` from the route) and src/app/admin/layout.tsx, both through
 * <Document> in src/components/document.tsx. Rendering it here would mean
 * reading the request to find the locale, which made every public page
 * dynamic.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
