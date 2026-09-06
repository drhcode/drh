'use client';

import * as React from 'react';
import Script from 'next/script';
import { publicEnv } from '@/lib/env';
import { useConsent } from './consent-provider';

/**
 * Analytics and advertising tags (spec §77).
 *
 * Every id here is a NEXT_PUBLIC_ value — public by design; nothing secret is
 * exposed. Two different consent strategies are in use, deliberately:
 *
 *   Google (gtag) uses **Consent Mode v2 in advanced mode**. The tag itself is
 *   server-rendered in `src/app/layout.tsx` with every storage type defaulted to
 *   `denied`, so it sets no cookie and stores nothing until the visitor accepts.
 *   This component owns the other half: pushing the `consent update` that
 *   actually grants storage. Keeping the pre-consent state cookieless rather
 *   than withholding the script is Google's recommended pattern for the EEA, and
 *   it lets Google's own tag detector confirm the installation.
 *
 *   Meta Pixel and Clarity have no equivalent consent signal — for them the
 *   only way to honour a refusal is not to load them at all, so they stay
 *   behind a hard gate.
 */

/** Google's consent signals, all denied until the visitor says otherwise. */
function consentPayload(analytics: boolean, marketing: boolean) {
  return {
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied',
  } as const;
}

export function AnalyticsScripts() {
  const { consent } = useConsent();

  const ga4 = publicEnv.ga4MeasurementId;
  const ads = publicEnv.googleAdsId;
  const pixel = publicEnv.metaPixelId;
  const clarity = publicEnv.clarityProjectId;

  const loadGoogle = Boolean(ga4 || ads);

  /*
   * Push a consent update whenever the choice changes — including on first
   * render, when the provider has just rehydrated a stored "accepted" from
   * localStorage. The bootstrap in the root layout always writes `denied`
   * defaults, so this is what re-grants storage for a returning visitor.
   *
   * Order is safe regardless of when gtag.js finishes loading: the bootstrap
   * has already defined `gtag` as a dataLayer push, and the queue is replayed
   * in order once the real library arrives.
   */
  React.useEffect(() => {
    if (!loadGoogle) return;
    window.gtag?.('consent', 'update', consentPayload(consent.analytics, consent.marketing));
  }, [loadGoogle, consent.analytics, consent.marketing]);

  return (
    <>
      {consent.marketing && pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {consent.analytics && clarity && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarity}");
          `}
        </Script>
      )}
    </>
  );
}
