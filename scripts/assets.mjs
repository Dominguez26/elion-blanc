// Genera og-image.png (1200x630), favicon-32.png y apple-touch-icon.png desde SVG.
// Uso: node scripts/assets.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const dots = [];
const cx = 880, cy = 315, R = 230;
for (let i = 0; i < 2600; i++) {
  const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = Math.sqrt(1 - u * u);
  const x = cx + Math.cos(th) * r * R, y = cy + u * R, z = (Math.sin(th) * r + 1) / 2;
  const tono = ['#BF0603', '#BF0603', '#E23416', '#FF6E46', '#FFD6BE'][(rnd() * 5) | 0];
  dots.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(1 + z * 1.6).toFixed(1)}" height="${(1 + z * 1.6).toFixed(1)}" fill="${tono}" opacity="${(0.25 + z * 0.7).toFixed(2)}"/>`);
}
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#000"/>
<defs><radialGradient id="h" cx="${cx}" cy="${cy}" r="${R * 1.6}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#BF0603" stop-opacity=".22"/><stop offset="1" stop-color="#BF0603" stop-opacity="0"/></radialGradient></defs>
<circle cx="${cx}" cy="${cy}" r="${R * 1.6}" fill="url(#h)"/>
${dots.join('')}
<text x="64" y="86" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="7" fill="#fff">ELION BLANC</text>
<text x="64" y="300" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="300" letter-spacing="-3" fill="#fff">Ecosistemas web</text>
<text x="64" y="376" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="300" letter-spacing="-3" fill="#fff">inmersivos que</text>
<text x="64" y="452" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="300" letter-spacing="-3" fill="#8F8A82">convierten visitas</text>
<text x="64" y="528" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="300" letter-spacing="-3"><tspan fill="#8F8A82">en </tspan><tspan fill="#BF0603">ventas.</tspan></text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-image.png');

const fav = readFileSync('public/favicon.svg');
await sharp(fav, { density: 600 }).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(fav, { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('assets generados');
