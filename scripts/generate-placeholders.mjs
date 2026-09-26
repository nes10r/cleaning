/**
 * Generates illustrated SVG placeholders in /public/images/placeholders.
 * Replace each with real photography (see `brief` in config/images.ts).
 * Run: npm run placeholders
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'placeholders');
mkdirSync(out, { recursive: true });

let n = 0;
const r = (v) => Math.round(v * 10) / 10;

function room(W, H, { dirty = false, id }) {
  const fy = r(H * 0.72);
  const wx = r(W * 0.07), wy = r(H * 0.1), ww = r(W * 0.27), wh = r(fy - H * 0.1 - H * 0.17);
  let s = `<defs>
<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dirty ? '#E2DCD0' : '#F6F3ED'}"/><stop offset="1" stop-color="${dirty ? '#D3CABA' : '#EAE3D8'}"/></linearGradient>
<linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dirty ? '#B09A7A' : '#DBC6A4'}"/><stop offset="1" stop-color="${dirty ? '#9E8768' : '#C9B18B'}"/></linearGradient>
<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D5E6EA"/></linearGradient>
<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF9EC" stop-opacity=".95"/><stop offset="1" stop-color="#FFF9EC" stop-opacity="0"/></linearGradient>
<clipPath id="${id}c"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}"/></clipPath></defs>
<rect width="${W}" height="${fy}" fill="url(#${id}w)"/><rect y="${fy}" width="${W}" height="${r(H - fy)}" fill="url(#${id}f)"/>`;
  for (let i = 1; i < 6; i++) s += `<line x1="0" x2="${W}" y1="${r(fy + ((H - fy) * i) / 6)}" y2="${r(fy + ((H - fy) * i) / 6)}" stroke="#3A2A10" stroke-opacity=".06"/>`;
  s += `<rect y="${r(fy - 7)}" width="${W}" height="7" fill="#F9F7F2"/>
<rect x="${r(wx - 7)}" y="${r(wy - 7)}" width="${r(ww + 14)}" height="${r(wh + 14)}" rx="3" fill="#FCFBF8"/><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="url(#${id}s)"/>
<g clip-path="url(#${id}c)"><circle cx="${r(wx + ww * 0.2)}" cy="${r(wy + wh * 0.95)}" r="${r(ww * 0.3)}" fill="#A9C4A0" opacity=".55"/><circle cx="${r(wx + ww * 0.75)}" cy="${r(wy + wh * 1.05)}" r="${r(ww * 0.35)}" fill="#9DBB93" opacity=".5"/></g>
<rect x="${r(wx + ww / 2 - 2)}" y="${wy}" width="4" height="${wh}" fill="#FCFBF8"/><rect x="${wx}" y="${r(wy + wh * 0.42)}" width="${ww}" height="4" fill="#FCFBF8"/>
<rect x="${r(wx + ww + 10)}" y="${r(wy - 16)}" width="${r(W * 0.05)}" height="${r(fy - wy + 8)}" rx="5" fill="#E9E1D3"/>
<polygon points="${wx},${fy} ${r(wx + ww)},${fy} ${r(wx + ww + W * 0.34)},${H} ${r(wx + W * 0.05)},${H}" fill="url(#${id}l)" opacity="${dirty ? 0.25 : 0.8}"/>`;
  return { s, fy, wx, wy, ww, wh };
}

const plant = (x, y, k) =>
  `<rect x="${r(x - 10 * k)}" y="${r(y - 26 * k)}" width="${r(20 * k)}" height="${r(26 * k)}" rx="${r(4 * k)}" fill="#D9CDBB"/><ellipse cx="${r(x - 9 * k)}" cy="${r(y - 40 * k)}" rx="${r(8 * k)}" ry="${r(18 * k)}" transform="rotate(-25 ${r(x - 9 * k)} ${r(y - 40 * k)})" fill="#5F8A5B"/><ellipse cx="${r(x + 9 * k)}" cy="${r(y - 42 * k)}" rx="${r(8 * k)}" ry="${r(19 * k)}" transform="rotate(28 ${r(x + 9 * k)} ${r(y - 42 * k)})" fill="#6E9A68"/><ellipse cx="${r(x)}" cy="${r(y - 50 * k)}" rx="${r(7 * k)}" ry="${r(20 * k)}" fill="#4F7A4C"/>`;

/** A cleaner in a green uniform, simple flat silhouette. */
const person = (x, y, k, pose = 'stand') => {
  const arm = pose === 'wipe' ? `<path d="M${r(x + 8 * k)} ${r(y - 62 * k)} L${r(x + 34 * k)} ${r(y - 70 * k)}" stroke="#0F5C4D" stroke-width="${r(9 * k)}" stroke-linecap="round"/><rect x="${r(x + 30 * k)}" y="${r(y - 78 * k)}" width="${r(12 * k)}" height="${r(9 * k)}" rx="2" fill="#B7E36A"/>` : `<path d="M${r(x + 9 * k)} ${r(y - 62 * k)} L${r(x + 14 * k)} ${r(y - 36 * k)}" stroke="#0F5C4D" stroke-width="${r(9 * k)}" stroke-linecap="round"/>`;
  return `<path d="M${r(x - 5 * k)} ${r(y - 30 * k)} L${r(x - 7 * k)} ${y} M${r(x + 5 * k)} ${r(y - 30 * k)} L${r(x + 7 * k)} ${y}" stroke="#2E3A37" stroke-width="${r(8 * k)}" stroke-linecap="round"/>
<rect x="${r(x - 12 * k)}" y="${r(y - 72 * k)}" width="${r(24 * k)}" height="${r(46 * k)}" rx="${r(10 * k)}" fill="#0F5C4D"/>${arm}
<path d="M${r(x - 9 * k)} ${r(y - 62 * k)} L${r(x - 14 * k)} ${r(y - 36 * k)}" stroke="#0F5C4D" stroke-width="${r(9 * k)}" stroke-linecap="round"/>
<circle cx="${x}" cy="${r(y - 84 * k)}" r="${r(10 * k)}" fill="#E6C3A5"/><path d="M${r(x - 10 * k)} ${r(y - 86 * k)} a${r(10 * k)} ${r(10 * k)} 0 0 1 ${r(20 * k)} 0 Z" fill="#6B4A33"/>`;
};

const scenes = {
  living(W, H, o) {
    const { s, fy } = room(W, H, o);
    const sx = W * 0.44, sw = W * 0.5, sy = fy - H * 0.15;
    return s + `<ellipse cx="${r(W * 0.62)}" cy="${r(fy + (H - fy) * 0.45)}" rx="${r(W * 0.36)}" ry="${r((H - fy) * 0.27)}" fill="#EEE7DB"/>
<line x1="${r(W * 0.72)}" y1="0" x2="${r(W * 0.72)}" y2="${r(H * 0.2)}" stroke="#8A7A62" stroke-width="1.5"/><path d="M${r(W * 0.66)} ${r(H * 0.26)} a${r(W * 0.06)} ${r(H * 0.06)} 0 0 1 ${r(W * 0.12)} 0 Z" fill="#DCD2C1"/>
<rect x="${r(sx)}" y="${r(sy - H * 0.08)}" width="${r(sw)}" height="${r(H * 0.13)}" rx="14" fill="#E6DFD2"/>
<rect x="${r(sx - 8)}" y="${r(sy + H * 0.02)}" width="${r(sw + 16)}" height="${r(H * 0.1)}" rx="12" fill="#F0EBE2"/>
<rect x="${r(sx + sw * 0.1)}" y="${r(sy - H * 0.05)}" width="${r(sw * 0.26)}" height="${r(H * 0.08)}" rx="10" fill="#A8B79F"/><rect x="${r(sx + sw * 0.6)}" y="${r(sy - H * 0.05)}" width="${r(sw * 0.26)}" height="${r(H * 0.08)}" rx="10" fill="#D6CCBA"/>
<rect x="${r(W * 0.47)}" y="${r(fy + (H - fy) * 0.32)}" width="${r(W * 0.3)}" height="7" rx="3" fill="#9A7654"/>
${plant(W * 0.4, fy + 4, W / 400)}${o.person ? person(W * 0.3, fy + (H - fy) * 0.55, W / 330, 'wipe') : ''}`;
  },
  kitchen(W, H, o) {
    const { s, fy, wx, wy, ww, wh } = room(W, H, o);
    const kx = W * 0.42, ct = fy - H * 0.25;
    let k = s + `<rect x="${r(kx)}" y="${r(H * 0.06)}" width="${r(W - kx)}" height="${r(H * 0.2)}" fill="#F8F5EF"/>
<rect x="${r(kx)}" y="${r(H * 0.26)}" width="${r(W - kx)}" height="${r(ct - H * 0.26)}" fill="${o.dirty ? '#DCD3C4' : '#EEE9E0'}"/>`;
    for (let x = kx; x < W; x += W * 0.05) k += `<line x1="${r(x)}" x2="${r(x)}" y1="${r(H * 0.26)}" y2="${r(ct)}" stroke="#D8CFC0" stroke-opacity=".7"/>`;
    k += `<rect x="${r(kx - 6)}" y="${r(ct)}" width="${r(W - kx + 6)}" height="${r(H * 0.035)}" fill="#CBC0AF"/>
<rect x="${r(kx)}" y="${r(ct + H * 0.035)}" width="${r(W - kx)}" height="${r(fy - ct - H * 0.035)}" fill="#F3EFE8"/>
<rect x="${r(kx + (W - kx) / 3 + 10)}" y="${r(ct + H * 0.07)}" width="${r((W - kx) / 3 - 20)}" height="${r(H * 0.14)}" rx="4" fill="${o.dirty ? '#3F403B' : '#2E3431'}"/>
<rect x="${r(W * 0.8)}" y="${r(ct - H * 0.07)}" width="${r(W * 0.06)}" height="${r(H * 0.07)}" rx="6" fill="#2F4A43"/>${plant(W * 0.7, ct, W / 520)}`;
    if (o.dirty) {
      k += `<ellipse cx="${r(W * 0.55)}" cy="${r(H * 0.38)}" rx="${r(W * 0.04)}" ry="${r(H * 0.03)}" fill="#8C6E42" opacity=".35"/><ellipse cx="${r(W * 0.9)}" cy="${r(H * 0.33)}" rx="${r(W * 0.05)}" ry="${r(H * 0.035)}" fill="#8C6E42" opacity=".3"/>
<rect x="${r(W * 0.5)}" y="${r(ct - H * 0.06)}" width="${r(W * 0.05)}" height="${r(H * 0.06)}" rx="3" fill="#E9E4DA"/><rect x="${r(W * 0.56)}" y="${r(ct - H * 0.045)}" width="${r(W * 0.06)}" height="${r(H * 0.045)}" rx="3" fill="#C9B89A"/>
<ellipse cx="${r(W * 0.62)}" cy="${r(fy + (H - fy) * 0.5)}" rx="${r(W * 0.09)}" ry="${r((H - fy) * 0.12)}" fill="#6E5536" opacity=".3"/>`;
      for (let i = 0; i < 14; i++) k += `<circle cx="${r(kx + 20 + ((i * 37) % (W - kx - 40)))}" cy="${r(ct - 2 + ((i * 13) % 5))}" r="1.6" fill="#7A6040" opacity=".7"/>`;
      for (let i = 0; i < 4; i++) k += `<line x1="${r(wx + 10 + (i * ww) / 4)}" y1="${r(wy + 8)}" x2="${r(wx + ww / 4 + (i * ww) / 4)}" y2="${r(wy + wh - 10)}" stroke="#8A7B60" stroke-opacity=".35" stroke-width="3"/>`;
      k += `<rect width="${W}" height="${H}" fill="#6B5A3C" opacity=".12"/>`;
    } else if (o.person) k += person(W * 0.34, fy + (H - fy) * 0.5, W / 330, 'wipe');
    return k;
  },
  renovation(W, H, o) {
    const { s, fy } = room(W, H, o);
    const lx = W * 0.62;
    let k = s + `<polygon points="${r(W * 0.35)},${r(fy + 6)} ${r(W * 0.95)},${r(fy + 6)} ${W},${H} ${r(W * 0.3)},${H}" fill="#F1EEE8" opacity=".9"/>
<line x1="${r(lx)}" y1="${r(fy + 20)}" x2="${r(lx + W * 0.06)}" y2="${r(H * 0.2)}" stroke="#B89A6C" stroke-width="5"/><line x1="${r(lx + W * 0.14)}" y1="${r(fy + 20)}" x2="${r(lx + W * 0.08)}" y2="${r(H * 0.2)}" stroke="#B89A6C" stroke-width="5"/>`;
    for (let i = 1; i < 5; i++) {
      const t = i / 5, y = fy + 20 - (fy + 20 - H * 0.2) * t;
      k += `<line x1="${r(lx + W * 0.06 * t)}" x2="${r(lx + W * 0.14 - W * 0.06 * t)}" y1="${r(y)}" y2="${r(y)}" stroke="#B89A6C" stroke-width="4"/>`;
    }
    return k + `<rect x="${r(W * 0.4)}" y="${r(fy + (H - fy) * 0.35)}" width="${r(W * 0.09)}" height="${r(W * 0.09)}" rx="4" fill="#E6E2DA"/><rect x="${r(W * 0.4)}" y="${r(fy + (H - fy) * 0.35)}" width="${r(W * 0.09)}" height="8" fill="#B7E36A" opacity=".8"/>${person(W * 0.24, fy + (H - fy) * 0.55, W / 330)}`;
  },
  moving(W, H, o) {
    const { s, fy } = room(W, H, o);
    const box = (x, y, w, h) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="3" fill="#C9A775"/><rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h * 0.18)}" fill="#B8955F"/><rect x="${r(x + w * 0.44)}" y="${r(y)}" width="${r(w * 0.12)}" height="${r(h)}" fill="#E7D9B8" opacity=".7"/>`;
    return s + box(W * 0.52, fy - H * 0.02, W * 0.18, H * 0.16) + box(W * 0.72, fy + H * 0.02, W * 0.16, H * 0.13) + box(W * 0.56, fy - H * 0.16, W * 0.13, H * 0.14) + person(W * 0.32, fy + (H - fy) * 0.55, W / 330, 'wipe');
  },
  office(W, H, o) {
    const { s, fy } = room(W, H, o);
    const dx = W * 0.42, dt = fy - H * 0.2;
    return s + `<rect x="${r(dx)}" y="${r(dt)}" width="${r(W * 0.52)}" height="8" rx="2" fill="#C8AD86"/><rect x="${r(dx + 8)}" y="${r(dt + 8)}" width="5" height="${r(fy - dt)}" fill="#7C7F7C"/><rect x="${r(dx + W * 0.52 - 13)}" y="${r(dt + 8)}" width="5" height="${r(fy - dt)}" fill="#7C7F7C"/>
<rect x="${r(dx + W * 0.12)}" y="${r(dt - H * 0.16)}" width="${r(W * 0.22)}" height="${r(H * 0.13)}" rx="4" fill="#2A302E"/><rect x="${r(dx + W * 0.12 + 4)}" y="${r(dt - H * 0.16 + 4)}" width="${r(W * 0.22 - 8)}" height="${r(H * 0.13 - 8)}" rx="2" fill="#DDE9E6"/>
<rect x="${r(dx + W * 0.14)}" y="${r(fy - H * 0.12)}" width="${r(W * 0.12)}" height="${r(H * 0.09)}" rx="8" fill="#6F8D82"/>${plant(W * 0.36, fy + 2, W / 460)}`;
  },
  windows(W, H) {
    const id = `w${++n}`;
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF3F5"/><stop offset="1" stop-color="#C9DDE2"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="#F3EFE8"/><rect x="${r(W * 0.08)}" y="${r(H * 0.08)}" width="${r(W * 0.84)}" height="${r(H * 0.84)}" rx="6" fill="#FCFBF8"/>
<rect x="${r(W * 0.12)}" y="${r(H * 0.14)}" width="${r(W * 0.36)}" height="${r(H * 0.72)}" fill="url(#${id})"/><rect x="${r(W * 0.52)}" y="${r(H * 0.14)}" width="${r(W * 0.36)}" height="${r(H * 0.72)}" fill="url(#${id})"/>
<path d="M${r(W * 0.12)} ${r(H * 0.7)} q${r(W * 0.18)} ${r(-H * 0.12)} ${r(W * 0.36)} 0 v${r(H * 0.16)} h${r(-W * 0.36)}Z" fill="#9DBB93" opacity=".55"/>
<path d="M${r(W * 0.52)} ${r(H * 0.72)} q${r(W * 0.2)} ${r(-H * 0.16)} ${r(W * 0.36)} ${r(-H * 0.02)} v${r(H * 0.16)} h${r(-W * 0.36)}Z" fill="#A9C4A0" opacity=".5"/>
<polygon points="${r(W * 0.55)},${r(H * 0.14)} ${r(W * 0.64)},${r(H * 0.14)} ${r(W * 0.56)},${r(H * 0.86)} ${r(W * 0.52)},${r(H * 0.86)}" fill="#fff" opacity=".45"/>
<g transform="rotate(-18 ${r(W * 0.34)} ${r(H * 0.42)})"><rect x="${r(W * 0.26)}" y="${r(H * 0.4)}" width="${r(W * 0.16)}" height="${r(H * 0.03)}" rx="3" fill="#2E3A37"/><rect x="${r(W * 0.33)}" y="${r(H * 0.43)}" width="${r(W * 0.02)}" height="${r(H * 0.18)}" rx="3" fill="#0F5C4D"/></g>`;
  },
  team(W, H, o) {
    const { s, fy } = room(W, H, o);
    return s + person(W * 0.38, fy + (H - fy) * 0.35, W / 300) + person(W * 0.52, fy + (H - fy) * 0.45, W / 280) + person(W * 0.66, fy + (H - fy) * 0.35, W / 300) + plant(W * 0.86, fy + 4, W / 420);
  },
};

function city(W, H, variant) {
  const id = `c${++n}`;
  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7F1F3"/><stop offset="1" stop-color="#F6F1E7"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  const base = H * 0.78;
  const roof = (x, w, h, c) => `<rect x="${r(x)}" y="${r(base - h)}" width="${r(w)}" height="${r(h)}" fill="${c}"/><polygon points="${r(x - 4)},${r(base - h)} ${r(x + w / 2)},${r(base - h - w * 0.45)} ${r(x + w + 4)},${r(base - h)}" fill="#B5553B" opacity=".85"/>`;
  const row = [0.02, 0.14, 0.27, 0.62, 0.75, 0.87].map((f, i) => roof(W * f, W * 0.11, H * (0.2 + (i % 3) * 0.06), ['#EFE6D6', '#E4D8C2', '#F3ECDF'][i % 3])).join('');
  if (variant === 'vilnius') {
    s += `<rect x="${r(W * 0.4)}" y="${r(base - H * 0.5)}" width="${r(W * 0.07)}" height="${r(H * 0.5)}" fill="#F5F1E8"/><polygon points="${r(W * 0.4)},${r(base - H * 0.5)} ${r(W * 0.435)},${r(base - H * 0.62)} ${r(W * 0.47)},${r(base - H * 0.5)}" fill="#7E8C88"/>
<rect x="${r(W * 0.49)}" y="${r(base - H * 0.28)}" width="${r(W * 0.12)}" height="${r(H * 0.28)}" fill="#F7F4EE"/><polygon points="${r(W * 0.48)},${r(base - H * 0.28)} ${r(W * 0.55)},${r(base - H * 0.37)} ${r(W * 0.62)},${r(base - H * 0.28)}" fill="#EDE7DB"/>`;
  } else if (variant === 'kaunas') {
    s += `<rect x="${r(W * 0.4)}" y="${r(base - H * 0.34)}" width="${r(W * 0.2)}" height="${r(H * 0.34)}" fill="#F4EFE6"/>${Array.from({ length: 4 }, (_, i) => `<rect x="${r(W * 0.42 + i * W * 0.045)}" y="${r(base - H * 0.3)}" width="${r(W * 0.03)}" height="${r(H * 0.24)}" fill="#D7DFDC"/>`).join('')}
<path d="M${r(W * 0.46)} ${r(base - H * 0.34)} a${r(W * 0.04)} ${r(W * 0.04)} 0 0 1 ${r(W * 0.08)} 0" fill="#0F5C4D"/>`;
  } else {
    s += `<rect x="${r(W * 0.36)}" y="${r(base - H * 0.05)}" width="${r(W * 0.28)}" height="${r(H * 0.05)}" fill="#3F5C66"/><line x1="${r(W * 0.44)}" y1="${r(base - H * 0.05)}" x2="${r(W * 0.44)}" y2="${r(base - H * 0.5)}" stroke="#5B4A3A" stroke-width="4"/><line x1="${r(W * 0.54)}" y1="${r(base - H * 0.05)}" x2="${r(W * 0.54)}" y2="${r(base - H * 0.44)}" stroke="#5B4A3A" stroke-width="4"/>
<polygon points="${r(W * 0.445)},${r(base - H * 0.46)} ${r(W * 0.52)},${r(base - H * 0.12)} ${r(W * 0.445)},${r(base - H * 0.12)}" fill="#FCFBF8"/>`;
  }
  s += row + `<rect y="${r(base)}" width="${W}" height="${r(H - base)}" fill="${variant === 'klaipeda' ? '#9CC3CC' : '#B9C9A8'}"/>`;
  return s;
}

const files = [
  ['hero-apartment', 1120, 1240, (W, H) => scenes.living(W, H, { id: 'h', person: true })],
  ['service-regular', 800, 500, (W, H) => scenes.living(W, H, { id: 'a', person: true })],
  ['service-deep', 800, 500, (W, H) => scenes.kitchen(W, H, { id: 'b', person: true })],
  ['service-renovation', 800, 500, (W, H) => scenes.renovation(W, H, { id: 'c' })],
  ['service-moving', 800, 500, (W, H) => scenes.moving(W, H, { id: 'd' })],
  ['service-office', 800, 500, (W, H) => scenes.office(W, H, { id: 'e' })],
  ['service-windows', 800, 500, (W, H) => scenes.windows(W, H)],
  ['kitchen-before', 960, 720, (W, H) => scenes.kitchen(W, H, { id: 'f', dirty: true })],
  ['kitchen-after', 960, 720, (W, H) => scenes.kitchen(W, H, { id: 'g' })],
  ['team', 1200, 800, (W, H) => scenes.team(W, H, { id: 't' })],
  ['city-vilnius', 800, 520, (W, H) => city(W, H, 'vilnius')],
  ['city-kaunas', 800, 520, (W, H) => city(W, H, 'kaunas')],
  ['city-klaipeda', 800, 520, (W, H) => city(W, H, 'klaipeda')],
];

for (const [name, W, H, draw] of files) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>Placeholder: ${name} – replace with a real photo (see config/images.ts)</title>${draw(W, H)}</svg>\n`;
  writeFileSync(join(out, `${name}.svg`), svg);
}
console.log(`Generated ${files.length} placeholders in ${out}`);
