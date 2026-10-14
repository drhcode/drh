import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { getLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { RouteProgress } from '@/components/route-progress';
import { localeLabels, isAppLocale } from '@/i18n/routing';
import { publicEnv, serverEnv } from '@/lib/env';
import { getCompanySettings } from '@/lib/data';
import './globals.css';

/*
 * Fonts are self-hosted from ./fonts rather than loaded with next/font/google.
 * The Google loader downloads the files during `next build`, and the Hostinger
 * build server intermittently gets a response next/font cannot parse, which
 * fails the whole build. Committed files make the build independent of the
 * network. Each file is Google's "latin" subset (U+0000–00FF plus €, curly
 * quotes and dashes), which covers English and Albanian (ë, ç) completely.
 */

/** Body, navigation and buttons. Variable font, so every weight is one file. */
const manrope = localFont({
  src: './fonts/manrope-latin-var.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-sans-stack',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

/** Display headings. Ships in a single regular weight, plus italic for accents. */
const instrumentSerif = localFont({
  src: [
    { path: './fonts/instrument-serif-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/instrument-serif-latin-italic.woff2', weight: '400', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-serif-stack',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

/** Numbers, tags and labels. Variable font. */
const geistMono = localFont({
  src: './fonts/geist-mono-latin-var.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-mono-stack',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  adjustFontFallback: false,
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
          icon: [{ url: '/favicon.jpg', type: 'image/jpeg', sizes: '250x250' }],
          apple: '/favicon.jpg',
        },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0b0d0c' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d0c' },
  ],
};

/**
 * Applies the stored theme before first paint so there is no flash of the wrong
 * colour scheme. Kept inline and tiny on purpose. Dark is the default: the
 * palette is built around Dark Teal, and light (Soft Ivory) is an opt-in from
 * the toggle rather than something the OS setting switches on.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('drh-theme');var d=s!=='light';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

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
    <html lang={lang} suppressHydrationWarning className={`${manrope.variable} ${instrumentSerif.variable} ${geistMono.variable}`}>
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
