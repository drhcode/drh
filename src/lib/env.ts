/**
 * Environment access.
 *
 * Anything not prefixed NEXT_PUBLIC_ is read only from modules that run on the
 * server. Never import `serverEnv` from a Client Component — Next would fail
 * the build, which is the intended guard rail.
 */

const optional = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Safe to reach the browser. */
export const publicEnv = {
  siteUrl: optional(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000',
  supabaseUrl: optional(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: optional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  turnstileSiteKey: optional(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  ga4MeasurementId: optional(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
  googleAdsId: optional(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
  googleAdsConversionLabel: optional(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL),
  metaPixelId: optional(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  clarityProjectId: optional(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID),
  calendlyUrl: optional(process.env.NEXT_PUBLIC_CALENDLY_URL),
} as const;

/** Server-only. Contains secrets. */
export const serverEnv = {
  supabaseServiceRoleKey: optional(process.env.SUPABASE_SERVICE_ROLE_KEY),
  resendApiKey: optional(process.env.RESEND_API_KEY),
  emailFrom: optional(process.env.EMAIL_FROM) ?? 'drh.al <noreply@drh.al>',
  emailAdminTo: optional(process.env.EMAIL_ADMIN_TO) ?? 'info@drh.al',
  turnstileSecretKey: optional(process.env.TURNSTILE_SECRET_KEY),
  googleServiceAccountEmail: optional(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
  googlePrivateKey: optional(process.env.GOOGLE_PRIVATE_KEY)?.replace(/\\n/g, '\n') ?? null,
  ga4PropertyId: optional(process.env.GA4_PROPERTY_ID),
  gscSiteUrl: optional(process.env.GSC_SITE_URL),
  /*
   * Search Console / Bing ownership tokens. Server-only on purpose: they are
   * public once rendered, but there is no reason to also ship them in the
   * client bundle. Comma-separate to verify several Google properties at once.
   */
  googleSiteVerification: optional(process.env.GOOGLE_SITE_VERIFICATION),
  bingSiteVerification: optional(process.env.BING_SITE_VERIFICATION),
} as const;

/** True when a real Supabase project is configured for read/write. */
export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

/** True when server actions can bypass RLS for privileged writes. */
export const hasServiceRole = Boolean(
  isSupabaseConfigured && serverEnv.supabaseServiceRoleKey,
);

export const isGa4ReportingConfigured = Boolean(
  serverEnv.ga4PropertyId &&
    serverEnv.googleServiceAccountEmail &&
    serverEnv.googlePrivateKey,
);

export const isGscConfigured = Boolean(
  serverEnv.gscSiteUrl &&
    serverEnv.googleServiceAccountEmail &&
    serverEnv.googlePrivateKey,
);

export const isResendConfigured = Boolean(serverEnv.resendApiKey);
export const isTurnstileConfigured = Boolean(
  publicEnv.turnstileSiteKey && serverEnv.turnstileSecretKey,
);
