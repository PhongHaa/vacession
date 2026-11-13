/**
 * Vẽ ảnh mẫu cho trang Campaign (lookbook) và About — không cần internet.
 * Chỉ là hình minh họa: thay bằng ảnh chụp thật trong frontend/public/images/.
 * Chạy: node scripts/mock-scenes.mjs   (từ thư mục frontend)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  navy: '#27364f', grey: '#8b8e93', brown: '#7b5a40', black: '#252525', olive: '#676b3d', white: '#f4f3ef',
  cream: '#e4d9c1', blue: '#6f93bd', charcoal: '#55585c', wash: '#9db6d0', indigo: '#3d4f6e', canvas: '#d9ceb5',
};
const SKIN = ['#d8b594', '#b98d6b', '#e6c8ac', '#8a6347'];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); const target = amt < 0 ? 0 : 255; const t = Math.abs(amt);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (target - c) * t).toString(16).padStart(2, '0')).join('');
}
const light = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 165; };
const mirror = (d) => d.replace(/([MLQ])\s*([\d.\s]+)/g, (_m, cmd, nums) => cmd + nums.trim().split(/\s+/).map(Number).map((x, i) => (i % 2 ? x : 900 - x)).join(' ') + ' ');
const line = (d, color, w = 3, op = 1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
const both = (d, color, w, op) => line(d, color, w, op) + line(mirror(d), color, w, op);
const fill = (d, color, edge) => `<path d="${d}" fill="${color}" stroke="${edge ?? shade(color, light(color) ? -0.28 : -0.4)}" stroke-width="2.5" stroke-linejoin="round"/>`;

const TOP_LONG = 'M372 312 L528 312 L572 340 L612 690 L566 700 L540 440 L540 690 L360 690 L360 440 L334 700 L288 690 L328 340 Z';
const TOP_SHORT = 'M372 312 L528 312 L572 340 L596 470 L548 480 L540 430 L540 690 L360 690 L360 430 L352 480 L304 470 L328 340 Z';

function figure(o, id) {
  const skin = SKIN[o.skin]; const skinEdge = shade(skin, -0.25);
  const tc = o.top.color; const tDark = shade(tc, -0.32); const tInk = light(tc) ? '#3a3a38' : '#efece4';
  const short = ['tee', 'tee-graphic'].includes(o.top.kind);
  const topD = short ? TOP_SHORT : TOP_LONG;
  let s = '';

  // Giày
  const shoe = 'M352 1078 L440 1078 Q446 1112 420 1112 L348 1112 Q338 1094 352 1078 Z';
  const shoeC = o.shoes ?? '#f1eee6';
  s += fill(shoe, shoeC) + fill(mirror(shoe), shoeC) + both('M350 1104 L438 1104', shade(shoeC, -0.35), 3, 0.7);

  // Quần
  const bc = o.bottom.color; const bDark = shade(bc, -0.34);
  if (o.bottom.kind === 'shorts') {
    const leg = 'M362 866 L436 866 L430 1080 L372 1080 Z';
    s += fill(leg, skin, skinEdge) + fill(mirror(leg), skin, skinEdge)
      + `<rect x="370" y="1022" width="62" height="58" fill="#f1eee6" stroke="#bdb8ab" stroke-width="2"/><rect x="468" y="1022" width="62" height="58" fill="#f1eee6" stroke="#bdb8ab" stroke-width="2"/>`;
    const d = 'M364 660 L536 660 L550 872 L462 872 L450 782 L438 872 L350 872 Z';
    s += fill(d, bc) + both('M358 852 L436 852', bDark, 2.5, 0.6);
    if (o.bottom.stripe) s += both('M372 690 L360 870', '#f1eee6', 9, 1);
  } else {
    const d = o.bottom.kind === 'baggy'
      ? 'M362 660 L538 660 L574 1084 L468 1084 L450 800 L432 1084 L326 1084 Z'
      : 'M364 660 L536 660 L552 1084 L466 1084 L450 800 L434 1084 L348 1084 Z';
    s += `<clipPath id="b${id}"><path d="${d}"/></clipPath>` + fill(d, bc);
    if (o.bottom.kind === 'layered') s += `<g clip-path="url(#b${id})"><rect x="300" y="890" width="300" height="220" fill="${shade(bc, 0.34)}"/></g>` + both('M352 890 L440 890', bDark, 3, 0.7) + fill(d, 'none');
    s += both('M356 1064 L438 1064', bDark, 2.5, 0.55) + both('M410 700 L404 1060', bDark, 2, 0.25);
    if (o.bottom.kind === 'carpenter') s += `<rect x="488" y="800" width="50" height="78" rx="3" fill="none" stroke="${bDark}" stroke-width="3" stroke-opacity="0.8"/>`;
  }

  // Tay trần (áo ngắn tay) + bàn tay
  if (short) { const arm = 'M306 468 L350 476 L336 700 L290 694 Z'; s += fill(arm, skin, skinEdge) + fill(mirror(arm), skin, skinEdge); }
  s += `<ellipse cx="311" cy="710" rx="20" ry="24" fill="${skin}" stroke="${skinEdge}" stroke-width="2.5"/><ellipse cx="589" cy="710" rx="20" ry="24" fill="${skin}" stroke="${skinEdge}" stroke-width="2.5"/>`;

  // Áo
  s += `<clipPath id="t${id}"><path d="${topD}"/></clipPath>` + fill(topD, tc);
  const k = o.top.kind;
  let inClip = '';
  if (k === 'polo') inClip += [400, 500, 600].map((y) => `<rect x="270" y="${y}" width="360" height="48" fill="#f1eee6"/>`).join('');
  if (k === 'windbreaker') inClip += `<rect x="270" y="300" width="360" height="118" fill="${shade(tc, 0.24)}" fill-opacity="0.7"/>`;
  if (k === 'sweater') inClip += Array.from({ length: 19 }, (_, i) => `<line x1="${282 + i * 19}" y1="300" x2="${282 + i * 19}" y2="710" stroke="${tDark}" stroke-opacity="0.18" stroke-width="3"/>`).join('');
  inClip += `<rect x="270" y="300" width="360" height="420" fill="url(#lt)"/>`;
  s += `<g clip-path="url(#t${id})">${inClip}</g>` + fill(topD, 'none', shade(tc, light(tc) ? -0.28 : -0.4));
  const hem = `<rect x="360" y="664" width="180" height="26" fill="${tDark}" fill-opacity="0.35"/>` + both('M296 668 L330 676', tDark, 3, 0.6);
  if (k === 'hoodie' || k === 'windbreaker') {
    s += `<path d="M386 320 Q450 244 514 320 Q450 350 386 320 Z" fill="${shade(tc, -0.42)}" stroke="${tDark}" stroke-width="2.5"/>`;
    s += k === 'hoodie'
      ? hem + line('M450 344 L450 690', tDark, 4, 0.9) + both('M374 600 L424 566 L424 664', tDark, 3, 0.65) + line('M438 344 L434 410', tInk, 3, 0.7) + line('M462 344 L466 410', tInk, 3, 0.7)
      : line('M450 344 L450 500', tDark, 4, 0.9) + line('M372 470 L426 470', tDark, 4, 0.85) + line('M360 676 L540 676', tDark, 3, 0.55);
  } else if (k === 'jacket') {
    const lapel = 'M412 312 L450 376 L424 394 L390 330 Z';
    s += fill(lapel, shade(tc, 0.22), tDark) + fill(mirror(lapel), shade(tc, 0.22), tDark) + line('M450 376 L450 690', tDark, 3, 0.8)
      + [420, 500, 580, 656].map((y) => `<circle cx="460" cy="${y}" r="6" fill="#c9a86a" stroke="${tDark}" stroke-width="1.5"/>`).join('')
      + `<rect x="374" y="432" width="60" height="70" rx="3" fill="none" stroke="${tDark}" stroke-width="3" stroke-opacity="0.75"/><rect x="466" y="432" width="60" height="70" rx="3" fill="none" stroke="${tDark}" stroke-width="3" stroke-opacity="0.75"/>`
      + `<rect x="370" y="574" width="66" height="84" rx="3" fill="none" stroke="${tDark}" stroke-width="3" stroke-opacity="0.75"/><rect x="464" y="574" width="66" height="84" rx="3" fill="none" stroke="${tDark}" stroke-width="3" stroke-opacity="0.75"/>`;
  } else if (k === 'oxford' || k === 'polo') {
    const collar = 'M412 312 L450 350 L422 376 L392 326 Z'; const cc = k === 'polo' ? '#f1eee6' : shade(tc, 0.3);
    s += fill(collar, cc, tDark) + fill(mirror(collar), cc, tDark);
    s += k === 'oxford'
      ? line('M442 354 L442 690', tDark, 2, 0.5) + line('M458 354 L458 690', tDark, 2, 0.5) + [390, 460, 530, 600, 664].map((y) => `<circle cx="450" cy="${y}" r="4.5" fill="#f6f4ee" stroke="${tDark}" stroke-width="1.2"/>`).join('') + both('M296 668 L330 676', tDark, 3, 0.6)
      : line('M450 350 L450 420', tDark, 3, 0.8) + both('M296 668 L330 676', tDark, 3, 0.6);
  } else if (k === 'sweater') {
    s += line('M412 314 Q450 344 488 314', tDark, 16, 0.85) + hem;
  } else {
    s += line('M412 314 Q450 346 488 314', tDark, 9, 0.75);
    s += k === 'tee-graphic'
      ? `<g stroke="${tInk}" stroke-opacity="0.85" fill="none" stroke-width="4.5" stroke-linejoin="round"><rect x="398" y="400" width="104" height="128" rx="5"/><circle cx="450" cy="452" r="27"/><path d="M414 506 L486 506" stroke-width="3.5"/></g>`
      : `<circle cx="490" cy="408" r="10" fill="none" stroke="${tInk}" stroke-width="3.5" stroke-opacity="0.85"/>`;
  }

  // Cổ, đầu, tóc / mũ
  s += `<rect x="430" y="282" width="40" height="${k === 'hoodie' || k === 'windbreaker' ? 34 : 44}" fill="${shade(skin, -0.08)}"/>`;
  s += `<ellipse cx="450" cy="236" rx="46" ry="56" fill="${skin}" stroke="${skinEdge}" stroke-width="2.5"/>`;
  if (o.hat?.kind === 'beanie') {
    s += fill('M398 232 Q392 158 450 156 Q508 158 502 232 Z', o.hat.color) + `<rect x="394" y="208" width="112" height="32" rx="8" fill="${shade(o.hat.color, -0.12)}" stroke="${shade(o.hat.color, -0.4)}" stroke-width="2.5"/>`;
  } else if (o.hat?.kind === 'cap') {
    s += fill('M494 212 Q566 212 572 232 Q534 242 494 232 Z', shade(o.hat.color, -0.15)) + fill('M400 228 Q396 162 450 160 Q504 162 500 228 Z', o.hat.color);
  } else {
    s += `<path d="M402 236 Q394 160 450 158 Q506 160 498 236 Q488 198 450 196 Q412 198 402 236 Z" fill="${o.hair ?? '#2a2522'}"/>`;
  }

  // Túi tote cầm tay
  if (o.tote) {
    s += line('M574 716 L556 796', shade(C.canvas, -0.3), 7) + line('M604 716 L626 796', shade(C.canvas, -0.3), 7)
      + fill('M538 792 L644 792 L652 936 L530 936 Z', C.canvas) + `<circle cx="591" cy="866" r="22" fill="none" stroke="#2c2c2a" stroke-width="4" stroke-opacity="0.8"/>`;
  }
  return s;
}

function backdrop(kind, color) {
  if (kind === 'arch') return `<path d="M236 1044 L236 520 Q236 286 450 286 Q664 286 664 520 L664 1044 Z" fill="${color}"/>`;
  if (kind === 'circle') return `<circle cx="450" cy="560" r="336" fill="${color}"/>`;
  if (kind === 'block') return `<rect x="190" y="210" width="520" height="834" fill="${color}"/>`;
  return '';
}

const DEFS = `<linearGradient id="lt" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#fff" stop-opacity="0.14"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></linearGradient>
<filter id="blur" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"/></filter>`;

function look(o, i) {
  const dark = !light(o.bg);
  const accent = shade(o.bg, dark ? 0.1 : -0.09);
  const scene = `${backdrop(o.backdrop, accent)}
<rect x="0" y="1044" width="900" height="156" fill="${shade(o.bg, dark ? -0.25 : -0.1)}"/>
<ellipse cx="450" cy="1110" rx="180" ry="16" fill="#000" fill-opacity="${dark ? 0.5 : 0.24}" filter="url(#blur)"/>
${figure(o, i)}`;
  // Ảnh "zoom" là cận cảnh nửa người, chủ thể nằm giữa khung để cắt ngang hay dọc đều đẹp
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200">
<defs>${DEFS}<radialGradient id="bg" cx="50%" cy="38%" r="80%"><stop offset="0" stop-color="${shade(o.bg, 0.1)}"/><stop offset="1" stop-color="${shade(o.bg, -0.1)}"/></radialGradient></defs>
<rect width="900" height="1200" fill="url(#bg)"/>
${o.zoom ? `<g transform="translate(-99 100) scale(1.22)">${scene}</g>` : scene}
<rect width="900" height="1200" filter="url(#grain)" opacity="0.16"/>
</svg>`;
}

const LOOKS = [
  { zoom: true, bg: '#c9c2b2', backdrop: 'arch', skin: 0, top: { kind: 'hoodie', color: C.navy }, bottom: { kind: 'baggy', color: C.wash }, hat: { kind: 'beanie', color: C.cream } },
  { bg: '#2b2b2a', backdrop: 'block', skin: 1, top: { kind: 'tee-graphic', color: C.white }, bottom: { kind: 'carpenter', color: C.charcoal }, hat: { kind: 'cap', color: C.cream } },
  { bg: '#b7c5d3', backdrop: 'circle', skin: 2, top: { kind: 'jacket', color: C.brown }, bottom: { kind: 'pants', color: C.indigo }, tote: true, shoes: '#2c2c2a' },
  { bg: '#e2dac8', backdrop: 'arch', skin: 3, top: { kind: 'polo', color: C.navy }, bottom: { kind: 'shorts', color: C.grey }, hat: { kind: 'cap', color: C.black } },
  { bg: '#3d4043', backdrop: 'circle', skin: 0, top: { kind: 'sweater', color: C.cream }, bottom: { kind: 'baggy', color: C.wash }, hair: '#5a3d28' },
  { bg: '#c5c9a6', backdrop: 'block', skin: 1, top: { kind: 'windbreaker', color: C.olive }, bottom: { kind: 'shorts', color: C.black, stripe: true }, hat: { kind: 'beanie', color: C.black } },
  { zoom: true, bg: '#dad6cc', backdrop: 'circle', skin: 2, top: { kind: 'oxford', color: C.blue }, bottom: { kind: 'pants', color: C.black }, hair: '#1f1b19' },
  { bg: '#272726', backdrop: 'arch', skin: 3, top: { kind: 'hoodie', color: C.grey }, bottom: { kind: 'shorts', color: C.grey }, hat: { kind: 'cap', color: C.black } },
  { bg: '#c8b39b', backdrop: 'block', skin: 0, top: { kind: 'tee', color: C.cream }, bottom: { kind: 'layered', color: C.indigo }, tote: true, hair: '#2a2522', shoes: '#2c2c2a' },
];
LOOKS.forEach((o, i) => fs.writeFileSync(path.join(OUT, `lookbook-${i + 1}.svg`), look(o, i)));

// ---------- Ảnh bìa About: giá treo quần áo ----------
function about() {
  const items = [
    ['long', C.navy, 250], ['tee', C.white, 190], ['long', C.brown, 270], ['tee', C.black, 200], ['long', C.olive, 250],
    ['pants', C.wash, 300], ['long', C.cream, 240], ['tee', C.charcoal, 195], ['long', C.grey, 260], ['pants', C.indigo, 300],
  ];
  let g = '';
  items.forEach(([kind, color, h], i) => {
    const cx = 258 + i * 76; const y = 196; const edge = shade(color, light(color) ? -0.28 : -0.4);
    g += `<path d="M${cx} ${y - 28} q10 -10 0 -18 q-10 8 0 18 M${cx} ${y - 28} L${cx} ${y}" fill="none" stroke="#55524b" stroke-width="3"/>`;
    const d = kind === 'pants'
      ? `M${cx - 30} ${y} L${cx + 30} ${y} L${cx + 34} ${y + h} L${cx + 4} ${y + h} L${cx} ${y + 60} L${cx - 4} ${y + h} L${cx - 34} ${y + h} Z`
      : kind === 'tee'
        ? `M${cx - 12} ${y} L${cx + 12} ${y} L${cx + 46} ${y + 22} L${cx + 40} ${y + 64} L${cx + 30} ${y + 60} L${cx + 30} ${y + h} L${cx - 30} ${y + h} L${cx - 30} ${y + 60} L${cx - 40} ${y + 64} L${cx - 46} ${y + 22} Z`
        : `M${cx - 12} ${y} L${cx + 12} ${y} L${cx + 44} ${y + 22} L${cx + 50} ${y + h - 30} L${cx + 34} ${y + h - 26} L${cx + 32} ${y + h} L${cx - 32} ${y + h} L${cx - 34} ${y + h - 26} L${cx - 50} ${y + h - 30} L${cx - 44} ${y + 22} Z`;
    g += `<path d="${d}" fill="${color}" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/><path d="${d}" fill="url(#lt)"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="1200" height="700">
<defs>${DEFS}<radialGradient id="bg" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#efebe2"/><stop offset="1" stop-color="#d9d4c8"/></radialGradient></defs>
<rect width="1200" height="700" fill="url(#bg)"/>
<rect y="560" width="1200" height="140" fill="#cdc7b9"/>
<ellipse cx="600" cy="580" rx="430" ry="16" fill="#000" fill-opacity="0.2" filter="url(#blur)"/>
<path d="M196 150 L196 578 M1004 150 L1004 578 M168 578 L224 578 M976 578 L1032 578" fill="none" stroke="#2c2b29" stroke-width="9" stroke-linecap="round"/>
${g}
<path d="M180 168 L1020 168" fill="none" stroke="#2c2b29" stroke-width="9" stroke-linecap="round"/>
<rect width="1200" height="700" filter="url(#grain)" opacity="0.16"/>
</svg>`;
}
fs.writeFileSync(path.join(OUT, 'about.svg'), about());
console.log(`Đã vẽ ${LOOKS.length} ảnh lookbook + ảnh bìa About vào ${OUT}`);
