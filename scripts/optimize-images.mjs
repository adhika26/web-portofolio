import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = resolve(root, 'public/projects');
const publicDir = resolve(root, 'public');

const projects = ['sistem-rekomendasi', 'angkringan-pos', 'angkringan-east-revamp', 'gym-assistant'];
const widths = [640, 1280];

await mkdir(projectsDir, { recursive: true });

for (const name of projects) {
  const input = resolve(projectsDir, `${name}.png`);
  for (const width of widths) {
    const base = sharp(input).resize({ width, withoutEnlargement: true });

    await base
      .clone()
      .webp({ quality: 78, effort: 5 })
      .toFile(resolve(projectsDir, `${name}-${width}.webp`));

    await base
      .clone()
      .avif({ quality: 55, effort: 5 })
      .toFile(resolve(projectsDir, `${name}-${width}.avif`));
  }
  console.log(`optimized ${name}`);
}

const mark = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="80%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#facc15" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#facc15" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#050505"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="56" y="56" width="1088" height="518" rx="28" fill="#0d0d0d" stroke="#27272a"/>
  <rect x="96" y="96" width="92" height="92" rx="20" fill="#facc15"/>
  <text x="142" y="158" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700" fill="#050505">A.</text>
  <text x="96" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="700" fill="#fafafa">Adhika Dwiki</text>
  <text x="96" y="378" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="700" fill="#fafafa">Septian</text>
  <text x="96" y="442" font-family="Segoe UI, Arial, sans-serif" font-size="27" fill="#a1a1aa">Creative Web &amp; Fullstack Developer</text>
  <rect x="96" y="486" width="300" height="2" fill="#facc15" opacity="0.5"/>
  <text x="96" y="532" font-family="Segoe UI, Arial, sans-serif" font-size="21" fill="#facc15">adhika26.github.io/web-portofolio</text>
  <text x="1104" y="532" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#71717a">Klaten, Indonesia</text>
</svg>`;

await sharp(Buffer.from(mark)).png({ compressionLevel: 9 }).toFile(resolve(publicDir, 'og-image.png'));

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#050505"/>
  <rect x="28" y="28" width="456" height="456" rx="88" fill="none" stroke="#facc15" stroke-opacity="0.35" stroke-width="4"/>
  <text x="256" y="322" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="230" font-weight="700" fill="#facc15">A.</text>
</svg>`;

await sharp(Buffer.from(iconSvg)).resize(180, 180).png().toFile(resolve(publicDir, 'apple-touch-icon.png'));
await sharp(Buffer.from(iconSvg)).resize(192, 192).png().toFile(resolve(publicDir, 'icon-192.png'));
await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(resolve(publicDir, 'icon-512.png'));

console.log('generated og-image.png and app icons');
