import { ImageResponse } from 'next/og';
import { DRH_LOGO_HEIGHT, DRH_LOGO_PATH, DRH_LOGO_VIEWBOX, DRH_LOGO_WIDTH } from '@/components/brand/drh-logo';

export const OG_SIZE = { width: 1200, height: 630 };

const LOGO_H = 56;
const LOGO_W = Math.round((LOGO_H * DRH_LOGO_WIDTH) / DRH_LOGO_HEIGHT);

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
        <svg width={LOGO_W} height={LOGO_H} viewBox={DRH_LOGO_VIEWBOX}>
          <path d={DRH_LOGO_PATH} fillRule="evenodd" fill="#F2F4F0" />
        </svg>
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
