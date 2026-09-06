import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { RouteProgress } from '@/components/route-progress';
import { localeLabels, isAppLocale } from '@/i18n/routing';
import { publicEnv, serverEnv } from '@/lib/env';
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

  // Search-engine ownership tokens. Next renders these as
  // <meta name="google-site-verification"> / <meta name="msvalidate.01">.
  const google = serverEnv.googleSiteVerification
    ?.split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(publicEnv.siteUrl),
    ...((google?.length || serverEnv.bingSiteVerification) && {
      verification: {
        ...(google?.length && { google }),
        ...(serverEnv.bingSiteVerification && { other: { 'msvalidate.01': serverEnv.bingSiteVerification } }),
      },
    }),
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

/**
 * Google Consent Mode v2 bootstrap.
 *
 * Server-rendered into <head> rather than injected by next/script, for two
 * reasons: the consent defaults must be queued before the first hit rather than
 * after hydration, and a tag that only appears after JavaScript runs is missed
 * by crawlers and by Google's own "Test your website" check.
 *
 * The loader is appended by this script rather than written as its own
 * `<script async src>` tag, because React hoists resource scripts to the top of
 * <head> — which would put gtag.js ahead of the consent defaults. Injecting it
 * here makes the ordering unconditional instead of a race the network usually
 * happens to win.
 *
 * Everything is denied here. `AnalyticsScripts` pushes a `consent update` once
 * the visitor's stored choice is known, so no cookie is written before then —
 * this is advanced consent mode, not an ungated tag.
 */
function googleTagScript(tagId: string, ga4: string | null, ads: string | null): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
gtag('js',new Date());
${ga4 ? `gtag('config','${ga4}',{anonymize_ip:true});` : ''}
${ads ? `gtag('config','${ads}');` : ''}
(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${tagId}';document.head.appendChild(s);})();`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const lang = isAppLocale(locale) ? localeLabels[locale].htmlLang : 'en';
  // One Google tag per page, even when both GA4 and Ads are configured.
  const googleTagId = publicEnv.ga4MeasurementId ?? publicEnv.googleAdsId;

  return (
    <html lang={lang} suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {googleTagId && (
          <script
            dangerouslySetInnerHTML={{
              __html: googleTagScript(
                googleTagId,
                publicEnv.ga4MeasurementId,
                publicEnv.googleAdsId,
              ),
            }}
          />
        )}
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
