import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Branded 1200×630 social card for code-owned pages (pricing, book, audit).
 * Rendered at build time — no runtime cost — in the site's lime-on-ink style.
 */
export function brandedOgImage({ kicker, title, accent }: { kicker: string; title: string; accent?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0b0d0c',
          color: '#F2F4F0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#D4FF3A',
              color: '#0b0d0c',
              fontSize: 26,
            }}
          >
            drh
          </div>
          <div style={{ display: 'flex' }}>
            drh<span style={{ color: '#D4FF3A' }}>.</span>al
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: '#D4FF3A' }}>{kicker.toUpperCase()}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 24, fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>
            {title}
            {accent && <span style={{ color: '#D4FF3A', marginLeft: 20 }}>{accent}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', height: 12, borderRadius: 12, background: '#1d2120' }}>
          <div style={{ width: '64%', borderRadius: 12, background: '#D4FF3A' }} />
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
