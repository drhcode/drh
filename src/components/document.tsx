import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { RouteProgress } from '@/components/route-progress';
import { fontVariables } from '@/app/fonts';
import { publicEnv, serverEnv } from '@/lib/env';
import { getCompanySettings } from '@/lib/data';
import { themeScript } from '@/lib/theme';

/*
 * The <html> document, shared by the localized public layout and the admin
 * layout. It used to live in src/app/layout.tsx, which had to read the request
 * to learn the locale — and that one dynamic read opted every page out of
 * static generation. The locale layout now passes `lang` straight from the
 * route, so public pages prerender again.
 */

/** Site-wide defaults, shared by the public and admin document layouts. */
export async function rootMetadata(): Promise<Metadata> {
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
    { media: '(prefers-color-scheme: light)', color: '#F7F7F3' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d0c' },
  ],
};

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
 * The loader itself is injected after the window `load` event. The consent
 * defaults and config above are queued in `dataLayer` immediately, so nothing
 * is lost — gtag.js replays the queue when it arrives — but its ~180 KB no
 * longer competes with the page's own content for the first paint.
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
(function(){function l(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${tagId}';document.head.appendChild(s);}if(document.readyState==='complete'){setTimeout(l,0);}else{window.addEventListener('load',function(){setTimeout(l,0);},{once:true});}})();`;
}

export function Document({ lang, children }: { lang: string; children: React.ReactNode }) {
  // One Google tag per page, even when both GA4 and Ads are configured.
  const googleTagId = publicEnv.ga4MeasurementId ?? publicEnv.googleAdsId;

  return (
    <html lang={lang} suppressHydrationWarning className={`dark t-dark ${fontVariables}`}>
      {/* Rendered only by the [locale] and admin layouts, where App Router allows <head>. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Applies the visitor's theme before first paint — see src/lib/theme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {googleTagId && (
          <script
            dangerouslySetInnerHTML={{
              __html: googleTagScript(googleTagId, publicEnv.ga4MeasurementId, publicEnv.googleAdsId),
            }}
          />
        )}
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {/* Shared by the public site and the admin. */}
        <RouteProgress />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
