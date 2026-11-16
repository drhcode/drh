/**
 * Regenerates the static logo files from the single source of truth in
 * src/components/brand/drh-logo.tsx:
 *
 *   public/brand/drh-logo.svg    ink logo, for press kits and anywhere an <img> is needed
 *   public/brand/drh-logo.png    ink logo on transparent, 1200px wide — used by the
 *                                email header and the Organization JSON-LD
 *   public/og/default.png        1200×630 fallback social card
 *
 *   npm run brand:assets
 *
 * Uses sharp, which is installed with Next.js for image optimisation.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { DRH_LOGO_HEIGHT, DRH_LOGO_PATH, DRH_LOGO_VIEWBOX, DRH_LOGO_WIDTH } from '../src/components/brand/drh-logo';

const INK = '#0b0d0c';
const PAPER = '#F2F4F0';
const LIME = '#D4FF3A';
const LINE = '#1d2120';

const root = process.cwd();
const out = (...parts: string[]) => {
  const file = path.join(root, 'public', ...parts);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
};

const logoSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${DRH_LOGO_VIEWBOX}" width="${DRH_LOGO_WIDTH}" height="${DRH_LOGO_HEIGHT}">` +
  `<title>drh.al</title><path fill="${fill}" fill-rule="evenodd" d="${DRH_LOGO_PATH}"/></svg>\n`;

/** The fallback social card: the logo on ink with the lime progress bar used by the generated cards. */
function ogSvg() {
  const W = 1200;
  const H = 630;
  const pad = 72;
  const logoW = 640;
  const logoH = (logoW * DRH_LOGO_HEIGHT) / DRH_LOGO_WIDTH;
  const scale = logoW / DRH_LOGO_WIDTH;
  const x = (W - logoW) / 2;
  const y = (H - 12 - pad - logoH) / 2;
  const barY = H - pad - 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <path transform="translate(${x} ${y}) scale(${scale})" fill="${PAPER}" fill-rule="evenodd" d="${DRH_LOGO_PATH}"/>
  <rect x="${pad}" y="${barY}" width="${W - pad * 2}" height="12" rx="6" fill="${LINE}"/>
  <rect x="${pad}" y="${barY}" width="${(W - pad * 2) * 0.64}" height="12" rx="6" fill="${LIME}"/>
</svg>`;
}

async function main() {
  const svg = logoSvg(INK);
  fs.writeFileSync(out('brand', 'drh-logo.svg'), svg);

  await sharp(Buffer.from(svg), { density: (72 * 1200) / DRH_LOGO_WIDTH })
    .resize({ width: 1200 })
    .png({ compressionLevel: 9, palette: true })
    .toFile(out('brand', 'drh-logo.png'));

  await sharp(Buffer.from(ogSvg())).png({ compressionLevel: 9 }).toFile(out('og', 'default.png'));

  for (const file of ['brand/drh-logo.svg', 'brand/drh-logo.png', 'og/default.png']) {
    const { size } = fs.statSync(path.join(root, 'public', file));
    console.log(`public/${file}  ${(size / 1024).toFixed(1)} KB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
