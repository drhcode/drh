'use client';

/**
 * First-party analytics event names (spec §75).
 *
 * `track()` forwards to whichever tags the visitor has consented to and, for
 * content engagement, to our own /api/events endpoint so project and CTA
 * performance is visible in /admin even without GA4 connected.
 */
export const ANALYTICS_EVENTS = {
  projectFormStarted: 'project_form_started',
  projectFormSubmitted: 'project_form_submitted',
  contactClicked: 'contact_clicked',
  phoneClicked: 'phone_clicked',
  whatsappClicked: 'whatsapp_clicked',
  projectViewed: 'project_viewed',
  caseStudyCtaClicked: 'case_study_cta_clicked',
  serviceViewed: 'service_viewed',
  languageChanged: 'language_changed',
  newsletterSubscribed: 'newsletter_subscribed',
  calendlyOpened: 'calendly_opened',
  outboundProjectClicked: 'outbound_project_clicked',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type Params = Record<string, string | number | boolean | undefined>;

/** Events worth storing first-party so /admin can report on them. */
const FIRST_PARTY_EVENTS = new Set<string>([
  ANALYTICS_EVENTS.projectViewed,
  ANALYTICS_EVENTS.serviceViewed,
  ANALYTICS_EVENTS.caseStudyCtaClicked,
  ANALYTICS_EVENTS.outboundProjectClicked,
  ANALYTICS_EVENTS.whatsappClicked,
  ANALYTICS_EVENTS.phoneClicked,
  ANALYTICS_EVENTS.contactClicked,
  ANALYTICS_EVENTS.projectFormSubmitted,
]);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;

  window.gtag?.('event', event, params);

  if (event === ANALYTICS_EVENTS.projectFormSubmitted) {
    window.fbq?.('track', 'Lead', params);
  }

  if (FIRST_PARTY_EVENTS.has(event)) {
    const body = JSON.stringify({ event, path: window.location.pathname, ...params });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
      } else {
        void fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      }
    } catch {
      // Analytics must never break a page interaction.
    }
  }
}

/** Google Ads conversion, fired only after a real lead is stored. */
export function trackAdsConversion(): void {
  if (typeof window === 'undefined') return;
  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (!sendTo) return;
  window.gtag?.('event', 'conversion', { send_to: sendTo });
}
