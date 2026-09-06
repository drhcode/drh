import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { RouteProgress } from '@/components/route-progress';
import { localeLabels, isAppLocale } from '@/i18n/routing';
import { publicEnv } from '@/lib/env';
import { getCompanySettings } from '@/lib/data';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-stack',
  weight: ['400', '500'],
});

export async function generateMetadata(): Promise<Metadata> {
  // Branding is editable from /admin/settings, so this has to be resolved per
  // render rather than declared as a static object.
  const settings = await getCompanySettings();

  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: {
      default: 'Web Development Albania | Websites, Apps & SEO | drh.al',
      template: '%s | drh.al',
    },
    description:
      'drh.al is a web development agency in Albania building high-performance websites, web apps and mobile apps with SEO and digital marketing for businesses worldwide.',
    applicationName: settings.companyName,
    authors: [{ name: settings.companyName, url: publicEnv.siteUrl }],
    creator: settings.companyName,
    publisher: settings.companyName,
    formatDetection: { telephone: true, email: true, address: false },
    icons: settings.favicon
      ? { icon: settings.favicon, apple: settings.favicon }
      : {
          icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico', sizes: '32x32' },
          ],
          apple: '/apple-touch-icon.png',
        },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf8' },
    { media: '(prefers-color-scheme: dark)', color: '#161514' },
  ],
};

/**
 * Applies the stored theme before first paint so there is no flash of the wrong
 * colour scheme. Kept inline and tiny on purpose.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('drh-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const lang = isAppLocale(locale) ? localeLabels[locale].htmlLang : 'en';

  return (
    <html lang={lang} suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {/* Shared by the public site and the admin — mounted once, at the root. */}
        <RouteProgress />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
