'use client';

import Script from 'next/script';
import { publicEnv } from '@/lib/env';
import { useConsent } from './consent-provider';

/**
 * Analytics and advertising tags (spec §77).
 *
 * Nothing here renders until the visitor has granted the matching consent
 * category, so no third-party cookie is set before that point. Every id is a
 * NEXT_PUBLIC_ value — these are public by design; nothing secret is exposed.
 */
export function AnalyticsScripts() {
  const { consent } = useConsent();

  const ga4 = publicEnv.ga4MeasurementId;
  const ads = publicEnv.googleAdsId;
  const pixel = publicEnv.metaPixelId;
  const clarity = publicEnv.clarityProjectId;

  const loadGoogle = consent.analytics && (ga4 || (consent.marketing && ads));

  return (
    <>
      {loadGoogle && (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4 ?? ads}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                ad_storage: '${consent.marketing ? 'granted' : 'denied'}',
                ad_user_data: '${consent.marketing ? 'granted' : 'denied'}',
                ad_personalization: '${consent.marketing ? 'granted' : 'denied'}',
                analytics_storage: '${consent.analytics ? 'granted' : 'denied'}'
              });
              ${ga4 ? `gtag('config', '${ga4}', { anonymize_ip: true });` : ''}
              ${consent.marketing && ads ? `gtag('config', '${ads}');` : ''}
            `}
          </Script>
        </>
      )}

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
