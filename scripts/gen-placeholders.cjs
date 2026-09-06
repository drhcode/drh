/**
 * Generates neutral SVG placeholders for seeded project and blog imagery.
 *
 *   node scripts/gen-placeholders.cjs
 *
 * These exist so the site renders complete on a fresh clone without shipping
 * stock photography. Replace them with real project imagery through
 * /admin/media — the CMS stores the URL, so no code change is needed.
 */
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.resolve(__dirname, '..', 'public', 'media');

const projects = [
  { slug: 'ersk-shpk', label: 'ERSK SHPK', kind: 'site' },
  { slug: 'bia', label: 'BIA', kind: 'app' },
  { slug: 'techcamp-polimi', label: 'TECHCAMP POLIMI', kind: 'site' },
];

const posts = [
  'how-much-does-a-website-cost-in-albania-2026',
  'local-seo-for-tirana-businesses-2026-playbook',
  'web-app-vs-mobile-app-which-should-you-build-first',
];

const INK = '#1a1918';
const PAPER = '#f4f2ef';
const LINE = '#dcd8d3';
const ACCENT = '#2f5fe0';

function frame({ w, h, label, variant }) {
  const pad = Math.round(w * 0.045);
  const barH = Math.round(h * 0.075);
  const innerY = pad + barH;
  const innerH = h - innerY - pad;
  const innerW = w - pad * 2;

  const blocks = [];
  if (variant === 'app') {
    // Sidebar + panel composition
    const sideW = Math.round(innerW * 0.22);
    blocks.push(`<rect x="${pad}" y="${innerY}" width="${sideW}" height="${innerH}" fill="${PAPER}"/>`);
    for (let i = 0; i < 5; i += 1) {
      blocks.push(
        `<rect x="${pad + 16}" y="${innerY + 22 + i * 30}" width="${sideW - 44}" height="8" rx="4" fill="${LINE}"/>`,
      );
    }
    const cx = pad + sideW + 24;
    const cw = innerW - sideW - 48;
    blocks.push(`<rect x="${cx}" y="${innerY + 24}" width="${Math.round(cw * 0.42)}" height="14" rx="7" fill="${INK}" opacity="0.75"/>`);
    for (let i = 0; i < 3; i += 1) {
      blocks.push(
        `<rect x="${cx + i * Math.round(cw / 3)}" y="${innerY + 62}" width="${Math.round(cw / 3) - 16}" height="${Math.round(innerH * 0.26)}" rx="10" fill="${PAPER}" stroke="${LINE}"/>`,
      );
    }
    blocks.push(
      `<rect x="${cx}" y="${innerY + 62 + Math.round(innerH * 0.26) + 20}" width="${cw}" height="${Math.round(innerH * 0.34)}" rx="10" fill="${PAPER}" stroke="${LINE}"/>`,
    );
    blocks.push(
      `<polyline points="${Array.from({ length: 9 }, (_, i) => {
        const px = cx + 24 + (i * (cw - 48)) / 8;
        const py = innerY + 62 + Math.round(innerH * 0.26) + 20 + Math.round(innerH * 0.28) - Math.round(Math.abs(Math.sin(i * 0.9)) * innerH * 0.2);
        return `${Math.round(px)},${Math.round(py)}`;
      }).join(' ')}" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  } else {
    // Marketing page composition
    blocks.push(`<rect x="${pad}" y="${innerY}" width="${innerW}" height="${Math.round(innerH * 0.46)}" fill="${PAPER}"/>`);
    blocks.push(`<rect x="${pad + 40}" y="${innerY + 44}" width="${Math.round(innerW * 0.46)}" height="18" rx="9" fill="${INK}" opacity="0.8"/>`);
    blocks.push(`<rect x="${pad + 40}" y="${innerY + 74}" width="${Math.round(innerW * 0.34)}" height="12" rx="6" fill="${LINE}"/>`);
    blocks.push(`<rect x="${pad + 40}" y="${innerY + 96}" width="${Math.round(innerW * 0.28)}" height="12" rx="6" fill="${LINE}"/>`);
    blocks.push(`<rect x="${pad + 40}" y="${innerY + 128}" width="132" height="34" rx="8" fill="${ACCENT}"/>`);
    const cardsY = innerY + Math.round(innerH * 0.52);
    for (let i = 0; i < 3; i += 1) {
      const cw = Math.round((innerW - 40) / 3) - 16;
      blocks.push(
        `<rect x="${pad + i * (cw + 24)}" y="${cardsY}" width="${cw}" height="${innerH - Math.round(innerH * 0.52) - 8}" rx="10" fill="${PAPER}" stroke="${LINE}"/>`,
      );
      blocks.push(`<rect x="${pad + i * (cw + 24) + 20}" y="${cardsY + 22}" width="30" height="30" rx="8" fill="${ACCENT}" opacity="0.16"/>`);
      blocks.push(`<rect x="${pad + i * (cw + 24) + 20}" y="${cardsY + 66}" width="${cw - 60}" height="10" rx="5" fill="${LINE}"/>`);
      blocks.push(`<rect x="${pad + i * (cw + 24) + 20}" y="${cardsY + 84}" width="${cw - 84}" height="10" rx="5" fill="${LINE}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
  <rect width="${w}" height="${h}" fill="${INK}"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" rx="14" fill="#ffffff"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${barH}" rx="14" fill="${PAPER}"/>
  <rect x="${pad}" y="${pad + barH - 14}" width="${w - pad * 2}" height="14" fill="${PAPER}"/>
  <line x1="${pad}" y1="${pad + barH}" x2="${w - pad}" y2="${pad + barH}" stroke="${LINE}"/>
  <circle cx="${pad + 26}" cy="${pad + barH / 2}" r="5" fill="${LINE}"/>
  <circle cx="${pad + 44}" cy="${pad + barH / 2}" r="5" fill="${LINE}"/>
  <circle cx="${pad + 62}" cy="${pad + barH / 2}" r="5" fill="${LINE}"/>
  <rect x="${pad + 86}" y="${pad + barH / 2 - 8}" width="${Math.round(w * 0.3)}" height="16" rx="8" fill="#ffffff" stroke="${LINE}"/>
  ${blocks.join('\n  ')}
  <text x="${w - pad - 18}" y="${h - pad - 18}" text-anchor="end" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${Math.round(h * 0.038)}" font-weight="600" fill="${INK}" opacity="0.32">${label}</text>
</svg>
`;
}

fs.mkdirSync(path.join(OUT, 'projects'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });

let count = 0;
for (const project of projects) {
  fs.writeFileSync(
    path.join(OUT, 'projects', `${project.slug}-cover.svg`),
    frame({ w: 1600, h: 1000, label: project.label, variant: project.kind }),
  );
  count += 1;
  for (let i = 1; i <= 3; i += 1) {
    fs.writeFileSync(
      path.join(OUT, 'projects', `${project.slug}-${i}.svg`),
      frame({
        w: 1600,
        h: 1000,
        label: project.label,
        variant: i % 2 === 0 ? 'app' : project.kind,
      }),
    );
    count += 1;
  }
}

for (const slug of posts) {
  fs.writeFileSync(
    path.join(OUT, 'blog', `${slug}.svg`),
    frame({ w: 1600, h: 1000, label: 'drh.al', variant: 'site' }),
  );
  count += 1;
}

console.log(`Wrote ${count} placeholder images to public/media.`);
