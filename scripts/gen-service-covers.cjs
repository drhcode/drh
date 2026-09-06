/**
 * Generates a cover illustration per service.
 *
 *   node scripts/gen-service-covers.cjs
 *
 * Same visual language as the project placeholders: a dark ink frame holding a
 * light interface, so each cover reads as a product screenshot rather than
 * stock photography, and looks correct on both themes without a second asset.
 *
 * Replace any of these with real work through /admin/services → Cover image.
 */
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.resolve(__dirname, '..', 'public', 'media', 'services');

const INK = '#1a1918';
const PAPER = '#f4f2ef';
const LINE = '#dcd8d3';
const SOFT = '#eeebe7';
const ACCENT = '#2f5fe0';
const ACCENT_SOFT = '#dbe4fb';

const W = 1400;
const H = 1050;
const PAD = 56;
const BAR = 68;

const rect = (x, y, w, h, r, fill, stroke) =>
  `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(
    h,
  )}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}/>`;

const bar = (x, y, w, h = 10, fill = LINE) => rect(x, y, w, h, h / 2, fill);

const circle = (cx, cy, r, fill) =>
  `<circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="${r}" fill="${fill}"/>`;

/** Inner canvas the motif draws into. */
const INNER = {
  x: PAD,
  y: PAD + BAR,
  w: W - PAD * 2,
  h: H - PAD * 2 - BAR,
};

// ─── Motifs ──────────────────────────────────────────────────────────────────

/** Code editor: sidebar tree plus syntax-coloured lines. */
function code() {
  const { x, y, w, h } = INNER;
  const sideW = Math.round(w * 0.24);
  const out = [rect(x, y, sideW, h, 0, SOFT)];

  for (let i = 0; i < 7; i += 1) {
    out.push(bar(x + 28, y + 34 + i * 40, sideW - 70 - (i % 3) * 22, 9));
  }

  const cx = x + sideW + 40;
  const cw = w - sideW - 80;
  const widths = [0.5, 0.72, 0.38, 0.64, 0.45, 0.8, 0.3, 0.58, 0.68, 0.42, 0.55];

  widths.forEach((ratio, i) => {
    const indent = i % 4 === 0 ? 0 : i % 3 === 0 ? 56 : 28;
    out.push(bar(cx + indent, y + 40 + i * 46, (cw - indent) * ratio, 11, i % 5 === 0 ? ACCENT : LINE));
  });

  return out.join('');
}

/** Layered application panels in light perspective. */
function layers() {
  const { x, y, w, h } = INNER;
  const out = [];

  for (let i = 2; i >= 0; i -= 1) {
    const inset = i * 46;
    const fill = i === 0 ? '#ffffff' : SOFT;
    out.push(rect(x + inset, y + inset, w - inset * 2, h - inset * 2 - 20, 14, fill, LINE));
  }

  const px = x + 130;
  const py = y + 130;
  const pw = w - 260;

  out.push(bar(px, py, pw * 0.36, 16, INK));
  for (let i = 0; i < 3; i += 1) {
    out.push(rect(px + i * (pw / 3), py + 52, pw / 3 - 24, 132, 10, PAPER, LINE));
    out.push(rect(px + i * (pw / 3) + 22, py + 76, 34, 34, 8, ACCENT_SOFT));
    out.push(bar(px + i * (pw / 3) + 22, py + 128, pw / 3 - 90, 9));
  }
  out.push(rect(px, py + 210, pw, 150, 10, PAPER, LINE));

  const points = Array.from({ length: 9 }, (_, i) => {
    const px2 = px + 30 + (i * (pw - 60)) / 8;
    const py2 = py + 330 - Math.abs(Math.sin(i * 0.85)) * 105;
    return `${Math.round(px2)},${Math.round(py2)}`;
  }).join(' ');

  out.push(
    `<polyline points="${points}" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

  return out.join('');
}

/** Two phone frames side by side. */
function mobile() {
  const { x, y, w, h } = INNER;
  const phoneW = Math.round(w * 0.3);
  const phoneH = h - 40;
  const gap = 54;
  const startX = x + (w - (phoneW * 2 + gap)) / 2;
  const out = [];

  for (let p = 0; p < 2; p += 1) {
    const px = startX + p * (phoneW + gap);
    const py = y + (p === 0 ? 0 : 34);

    out.push(rect(px, py, phoneW, phoneH, 30, '#ffffff', LINE));
    out.push(rect(px + phoneW / 2 - 34, py + 16, 68, 9, 5, LINE));
    out.push(rect(px + 22, py + 44, phoneW - 44, 128, 12, p === 0 ? ACCENT : ACCENT_SOFT));

    for (let i = 0; i < 4; i += 1) {
      out.push(rect(px + 22, py + 190 + i * 60, phoneW - 44, 46, 10, PAPER, LINE));
      out.push(circle(px + 48, py + 213 + i * 60, 12, ACCENT_SOFT));
      out.push(bar(px + 74, py + 208 + i * 60, phoneW - 130, 9));
    }

    out.push(rect(px + 22, py + phoneH - 78, phoneW - 44, 44, 10, INK));
  }

  return out.join('');
}

/** Content site: hero band plus article blocks. */
function content() {
  const { x, y, w, h } = INNER;
  const out = [rect(x, y, w, Math.round(h * 0.4), 0, SOFT)];

  out.push(bar(x + 48, y + 60, w * 0.44, 20, INK));
  out.push(bar(x + 48, y + 100, w * 0.3, 12));
  out.push(bar(x + 48, y + 126, w * 0.24, 12));
  out.push(rect(x + 48, y + 168, 156, 44, 9, ACCENT));

  const gy = y + Math.round(h * 0.4) + 44;
  for (let i = 0; i < 3; i += 1) {
    const cw = (w - 96) / 3 - 20;
    const cx = x + 48 + i * ((w - 96) / 3);
    out.push(rect(cx, gy, cw, 190, 12, PAPER, LINE));
    out.push(rect(cx, gy, cw, 88, 12, ACCENT_SOFT));
    out.push(bar(cx + 20, gy + 112, cw - 60, 10));
    out.push(bar(cx + 20, gy + 136, cw - 100, 10));
  }
  return out.join('');
}

/** Storefront: product grid plus a cart summary. */
function store() {
  const { x, y, w, h } = INNER;
  const cartW = Math.round(w * 0.3);
  const gridW = w - cartW - 40;
  const out = [];

  for (let i = 0; i < 6; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cw = gridW / 3 - 20;
    const ch = h / 2 - 26;
    const cx = x + col * (gridW / 3);
    const cy = y + row * (h / 2);

    out.push(rect(cx, cy, cw, ch, 12, PAPER, LINE));
    out.push(rect(cx, cy, cw, ch * 0.62, 12, i % 2 ? ACCENT_SOFT : SOFT));
    out.push(bar(cx + 18, cy + ch * 0.72, cw - 66, 10));
    out.push(bar(cx + 18, cy + ch * 0.72 + 24, 54, 10, ACCENT));
  }

  const kx = x + gridW + 40;
  out.push(rect(kx, y, cartW, h - 20, 14, '#ffffff', LINE));
  out.push(bar(kx + 24, y + 32, cartW * 0.5, 14, INK));
  for (let i = 0; i < 3; i += 1) {
    out.push(rect(kx + 24, y + 74 + i * 68, 46, 46, 8, SOFT));
    out.push(bar(kx + 84, y + 84 + i * 68, cartW - 130, 9));
    out.push(bar(kx + 84, y + 104 + i * 68, cartW - 180, 9));
  }
  out.push(rect(kx + 24, y + h - 116, cartW - 48, 48, 10, ACCENT));
  return out.join('');
}

/** Design system: swatches, type scale and components. */
function design() {
  const { x, y, w } = INNER;
  const out = [];
  const swatches = [INK, ACCENT, '#6b8cf0', ACCENT_SOFT, SOFT];

  swatches.forEach((fill, i) => {
    out.push(rect(x + i * ((w - 40) / 5), y, (w - 40) / 5 - 18, 150, 12, fill, fill === SOFT ? LINE : null));
  });

  out.push(bar(x, y + 200, w * 0.4, 26, INK));
  out.push(bar(x, y + 244, w * 0.3, 18));
  out.push(bar(x, y + 278, w * 0.36, 12));
  out.push(bar(x, y + 302, w * 0.22, 12));

  const by = y + 360;
  out.push(rect(x, by, 168, 50, 10, ACCENT));
  out.push(rect(x + 190, by, 168, 50, 10, PAPER, LINE));
  out.push(rect(x + 380, by, 120, 50, 25, PAPER, LINE));

  out.push(rect(x + w * 0.56, y + 200, w * 0.44, 268, 14, PAPER, LINE));
  out.push(rect(x + w * 0.56 + 24, y + 224, 48, 48, 24, ACCENT_SOFT));
  out.push(bar(x + w * 0.56 + 24, y + 292, w * 0.3, 12));
  out.push(bar(x + w * 0.56 + 24, y + 320, w * 0.24, 12));
  out.push(bar(x + w * 0.56 + 24, y + 348, w * 0.28, 12));
  return out.join('');
}

/** Search results with a rising position chart. */
function search() {
  const { x, y, w } = INNER;
  const out = [rect(x, y, w * 0.62, 56, 28, PAPER, LINE)];
  out.push(circle(x + 34, y + 28, 11, LINE));
  out.push(bar(x + 58, y + 22, w * 0.3, 12));

  for (let i = 0; i < 4; i += 1) {
    const ry = y + 96 + i * 96;
    out.push(bar(x, ry, w * (i === 0 ? 0.42 : 0.34 - i * 0.03), 14, i === 0 ? ACCENT : INK));
    out.push(bar(x, ry + 30, w * 0.5, 10));
    out.push(bar(x, ry + 52, w * 0.42, 10));
    if (i === 0) out.push(rect(x - 22, ry - 12, 6, 82, 3, ACCENT));
  }

  const cx = x + w * 0.66;
  const cw = w - w * 0.66;
  out.push(rect(cx, y + 96, cw, 300, 14, PAPER, LINE));

  const pts = Array.from({ length: 8 }, (_, i) => {
    const px = cx + 26 + (i * (cw - 52)) / 7;
    const py = y + 356 - (i / 7) ** 1.3 * 210;
    return `${Math.round(px)},${Math.round(py)}`;
  }).join(' ');

  out.push(
    `<polyline points="${pts}" fill="none" stroke="${ACCENT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  return out.join('');
}

/** Campaign dashboard: KPI tiles plus a spend chart. */
function campaign() {
  const { x, y, w, h } = INNER;
  const out = [];

  for (let i = 0; i < 3; i += 1) {
    const cw = (w - 44) / 3;
    const cx = x + i * (cw + 22);
    out.push(rect(cx, y, cw - 0, 140, 14, PAPER, LINE));
    out.push(bar(cx + 22, y + 28, cw * 0.42, 10));
    out.push(bar(cx + 22, y + 58, cw * 0.5, 22, i === 0 ? ACCENT : INK));
    out.push(bar(cx + 22, y + 98, cw * 0.3, 9));
  }

  const gy = y + 176;
  const gh = h - 200;
  out.push(rect(x, gy, w, gh, 14, PAPER, LINE));

  const bars = 12;
  for (let i = 0; i < bars; i += 1) {
    const bw = (w - 100) / bars - 12;
    const bx = x + 50 + i * ((w - 100) / bars);
    const bh = 40 + Math.abs(Math.sin(i * 0.7)) * (gh - 130);
    out.push(rect(bx, gy + gh - 44 - bh, bw, bh, 6, i > 8 ? ACCENT : ACCENT_SOFT));
  }
  return out.join('');
}

const MOTIFS = { code, layers, mobile, content, store, design, search, campaign };

function cover({ motif, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect x="${PAD}" y="${PAD}" width="${W - PAD * 2}" height="${H - PAD * 2}" rx="18" fill="#ffffff"/>
  <rect x="${PAD}" y="${PAD}" width="${W - PAD * 2}" height="${BAR}" rx="18" fill="${PAPER}"/>
  <rect x="${PAD}" y="${PAD + BAR - 18}" width="${W - PAD * 2}" height="18" fill="${PAPER}"/>
  <line x1="${PAD}" y1="${PAD + BAR}" x2="${W - PAD}" y2="${PAD + BAR}" stroke="${LINE}"/>
  ${circle(PAD + 30, PAD + BAR / 2, 6, LINE)}
  ${circle(PAD + 52, PAD + BAR / 2, 6, LINE)}
  ${circle(PAD + 74, PAD + BAR / 2, 6, LINE)}
  ${rect(PAD + 104, PAD + BAR / 2 - 11, W * 0.34, 22, 11, '#ffffff', LINE)}
  <svg x="0" y="0" width="${W}" height="${H}" overflow="hidden">${MOTIFS[motif]()}</svg>
  <text x="${W - PAD - 22}" y="${H - PAD - 22}" text-anchor="end" font-family="ui-sans-serif, system-ui, sans-serif" font-size="34" font-weight="600" fill="${INK}" opacity="0.28">${label}</text>
</svg>
`;
}

const SERVICES = [
  { slug: 'web-development', motif: 'code', label: 'Web Development' },
  { slug: 'web-app-development', motif: 'layers', label: 'Web Applications' },
  { slug: 'mobile-app-development', motif: 'mobile', label: 'Mobile Apps' },
  { slug: 'wordpress-development', motif: 'content', label: 'WordPress' },
  { slug: 'ecommerce-development', motif: 'store', label: 'E-commerce' },
  { slug: 'ui-ux-design', motif: 'design', label: 'UI/UX Design' },
  { slug: 'seo', motif: 'search', label: 'SEO' },
  { slug: 'google-ads', motif: 'campaign', label: 'Google Ads' },
];

fs.mkdirSync(OUT, { recursive: true });

for (const service of SERVICES) {
  fs.writeFileSync(path.join(OUT, `${service.slug}.svg`), cover(service));
}

console.log(`Wrote ${SERVICES.length} service covers to public/media/services.`);
