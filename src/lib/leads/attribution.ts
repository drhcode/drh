'use client';

import type { AttributionInput } from './schema';

/**
 * Lead attribution capture (spec §39).
 *
 * First touch is recorded once per browser and kept; latest touch is refreshed
 * whenever a visit arrives with campaign parameters or an external referrer.
 * Nothing here identifies a person — no IP, no fingerprint, no cross-site id.
 */

const FIRST_TOUCH_KEY = 'drh-first-touch';
const LAST_TOUCH_KEY = 'drh-last-touch';
const LANDING_KEY = 'drh-landing-page';

interface TouchRecord {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
  at?: string;
}

function readTouch(key: string): TouchRecord | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as TouchRecord) : undefined;
  } catch {
    return undefined;
  }
}

function writeTouch(key: string, value: TouchRecord): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing — attribution degrades to the current page only.
  }
}

function currentTouch(): TouchRecord {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer && !document.referrer.includes(window.location.host)
    ? document.referrer
    : undefined;

  const touch: TouchRecord = {
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
    utmContent: params.get('utm_content') ?? undefined,
    utmTerm: params.get('utm_term') ?? undefined,
    referrer,
    landingPage: window.location.pathname + window.location.search,
    at: new Date().toISOString(),
  };

  return Object.fromEntries(
    Object.entries(touch).filter(([, value]) => Boolean(value)),
  ) as TouchRecord;
}

/** Call once per page load, from the layout or the form. */
export function recordVisit(): void {
  if (typeof window === 'undefined') return;

  const touch = currentTouch();
  const isMeaningful = Boolean(
    touch.utmSource || touch.utmMedium || touch.utmCampaign || touch.referrer,
  );

  if (!readTouch(FIRST_TOUCH_KEY)) writeTouch(FIRST_TOUCH_KEY, touch);
  if (isMeaningful) writeTouch(LAST_TOUCH_KEY, touch);

  try {
    if (!window.sessionStorage.getItem(LANDING_KEY)) {
      window.sessionStorage.setItem(LANDING_KEY, touch.landingPage ?? window.location.pathname);
    }
  } catch {
    // Ignore — landing page falls back to the submission page.
  }
}

/** Builds the attribution payload sent with a lead. */
export function collectAttribution(): AttributionInput {
  if (typeof window === 'undefined') return {};

  const latest = readTouch(LAST_TOUCH_KEY) ?? currentTouch();
  const first = readTouch(FIRST_TOUCH_KEY);

  let landingPage: string | undefined;
  try {
    landingPage = window.sessionStorage.getItem(LANDING_KEY) ?? latest.landingPage;
  } catch {
    landingPage = latest.landingPage;
  }

  const firstTouch = first
    ? (Object.fromEntries(
        Object.entries(first).filter(([, value]) => typeof value === 'string'),
      ) as Record<string, string>)
    : undefined;

  return {
    landingPage,
    sourcePage: window.location.pathname,
    referrer: latest.referrer,
    utmSource: latest.utmSource,
    utmMedium: latest.utmMedium,
    utmCampaign: latest.utmCampaign,
    utmContent: latest.utmContent,
    utmTerm: latest.utmTerm,
    firstTouch,
  };
}
