'use client';

import * as React from 'react';

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'drh-consent';
const DEFAULT_CONSENT: ConsentState = { necessary: true, analytics: false, marketing: false };

interface ConsentContextValue {
  consent: ConsentState;
  /** Null until the visitor has made a choice — the banner uses this. */
  decided: boolean;
  save: (next: Omit<ConsentState, 'necessary'>) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  reopen: () => void;
  /** Incremented when the visitor asks to change preferences from the footer. */
  reopenSignal: number;
}

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

/**
 * GDPR-friendly consent state (spec §77).
 *
 * Nothing analytics- or marketing-related loads until the visitor opts in, and
 * the choice can be changed at any time from the footer. State lives in
 * localStorage only — no consent record is sent to a server.
 */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = React.useState<ConsentState>(DEFAULT_CONSENT);
  const [decided, setDecided] = React.useState(true); // assume decided until read
  const [reopenSignal, setReopenSignal] = React.useState(0);

  React.useEffect(() => {
    /*
     * localStorage is a browser-only external store with no server equivalent,
     * so the stored choice can only be read after mount. Until it is read we
     * assume "decided", which keeps the banner from flashing for a returning
     * visitor who already made a choice.
     */
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setDecided(false);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<ConsentState>;
      setConsent({
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      });
    } catch {
      setDecided(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = React.useCallback((next: ConsentState) => {
    setConsent(next);
    setDecided(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing — the choice simply is not remembered.
    }
    window.dispatchEvent(new CustomEvent('drh:consent', { detail: next }));
  }, []);

  const value = React.useMemo<ConsentContextValue>(
    () => ({
      consent,
      decided,
      save: (next) => persist({ necessary: true, ...next }),
      acceptAll: () => persist({ necessary: true, analytics: true, marketing: true }),
      rejectOptional: () => persist({ necessary: true, analytics: false, marketing: false }),
      reopen: () => setReopenSignal((n) => n + 1),
      reopenSignal,
    }),
    [consent, decided, persist, reopenSignal],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const context = React.useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used inside ConsentProvider');
  return context;
}
