/**
 * Vẽ ảnh sản phẩm mẫu dạng SVG (không cần internet, không vướng bản quyền).
 * Mỗi loại sản phẩm có hình riêng, mặt trước + mặt sau.
 * Đây chỉ là ảnh minh họa — thay bằng ảnh chụp thật qua trang Admin > Sản phẩm.
 */
import fs from 'node:fs';
import path from 'node:path';

export const MOCK_VERSION = 'v3';
type View = 'front' | 'back';

const COLORS: Record<string, string> = {
  navy: '#27364f', grey: '#8b8e93', gray: '#8b8e93', brown: '#7b5a40', black: '#252525',
  olive: '#676b3d', white: '#f4f3ef', cream: '#e4d9c1', blue: '#6f93bd', charcoal: '#43464a',
  'light wash': '#9db6d0',
};
const DEFAULT_COLORS: Record<string, string> = { 'pants-layered': '#3d4f6e', tote: '#d9ceb5' };

/** Pha màu về phía trắng (amt > 0) hoặc đen (amt < 0), amt trong [-1, 1] */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const target = amt < 0 ? 0 : 255;
  const t = Math.abs(amt);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (target - c) * t));
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 170;
};

function kindOf(name: string, category: string) {
  const n = name.toLowerCase();
  const rules: [string, string][] = [
    ['hoodie', 'hoodie'], ['work jacket', 'jacket'], ['bomber', 'bomber'], ['windbreaker', 'windbreaker'],
    ['graphic tee', 'tee-graphic'], ['logo tee', 'tee-logo'], ['polo', 'polo'], ['sweater', 'sweater'], ['shirt', 'oxford'],
    ['denim pants', 'pants-layered'], ['carpenter', 'pants-carpenter'], ['jeans', 'pants-baggy'],
    ['track shorts', 'shorts-track'], ['shorts', 'shorts-sweat'],
    ['beanie', 'beanie'], ['cap', 'cap'], ['tote', 'tote'], ['belt', 'belt'],
  ];
  const hit = rules.find(([key]) => n.includes(key));
  if (hit) return hit[1];
  return ({ outerwears: 'jacket', tops: 'tee-logo', bottom: 'pants', accessories: 'cap' } as Record<string, string>)[category] ?? 'tee-logo';
}

function colorOf(name: string, kind: string) {
  const n = name.toLowerCase();
  const key = Object.keys(COLORS).sort((a, b) => b.length - a.length).find((k) => n.includes(k));
  return key ? COLORS[key] : DEFAULT_COLORS[kind] ?? '#4a4a4a';
}

interface Part { d: string; fill: string }
interface Art { parts: Part[]; over: string; under?: string; bottom: number; width: number }

const mirror = (d: string) => d.replace(/([MLQ])\s*([\d.\s]+)/g, (_m, cmd: string, nums: string) => {
  const v = nums.trim().split(/\s+/).map(Number);
  return cmd + v.map((x, i) => (i % 2 === 0 ? 800 - x : x)).join(' ') + ' ';
});
const stroke = (d: string, color: string, w = 3, op = 1, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const both = (d: string, color: string, w = 3, op = 1) => stroke(d, color, w, op) + stroke(mirror(d), color, w, op);

// ---------- Áo ----------
function top(kind: string, base: string, view: View): Art {
  const dark = shade(base, -0.3);
  const lite = shade(base, 0.22);
  const ink = isLight(base) ? '#3a3a38' : '#efece4';
  const short = kind.startsWith('tee') ;
  const neck = view === 'front' ? (kind === 'oxford' || kind === 'jacket' ? 262 : 250) : 230;
  const sleeveFill = kind === 'bomber' ? '#e6dfcd' : base;

  const body = short
    ? `M302 252 L352 226 Q400 ${neck + 12} 448 226 L498 252 L516 330 L516 722 L284 722 L284 330 Z`
    : `M302 242 L352 216 Q400 ${neck} 448 216 L498 242 L520 330 L520 742 L280 742 L280 330 Z`;
  const sleeve = short ? 'M302 252 L190 334 L236 404 L286 372 L302 330 Z' : 'M302 242 L238 292 L158 662 L222 684 L282 430 L302 330 Z';
  const parts: Part[] = [{ d: sleeve, fill: sleeveFill }, { d: mirror(sleeve), fill: sleeveFill }, { d: body, fill: base }];
  const hemY = short ? 722 : 742;
  const x0 = short ? 284 : 280;
  let over = '';
  let under = '';

  const rib = () => `<rect x="${x0}" y="${hemY - 30}" width="${800 - 2 * x0}" height="30" fill="${dark}" fill-opacity="0.35"/>`
    + both('M168 634 L230 656', dark, 3, 0.6);
  const zip = (to: number) => stroke(`M400 ${neck + 2} L400 ${to}`, dark, 5, 0.9) + `<rect x="394" y="${neck + 8}" width="12" height="26" rx="3" fill="${shade(base, 0.45)}"/>`;
  const hood = () => view === 'front'
    ? `<path d="M338 232 Q400 142 462 232 Q400 268 338 232 Z" fill="${shade(base, -0.42)}" stroke="${dark}" stroke-width="2.5"/>`
    : `<path d="M332 232 Q400 214 468 232 L452 336 Q400 376 348 336 Z" fill="${shade(base, -0.1)}" stroke="${dark}" stroke-width="2.5"/>`;

  if (kind === 'hoodie') {
    over += hood() + rib();
    if (view === 'front') {
      over += zip(hemY) + both('M300 612 L372 566 L372 706', dark, 3, 0.7)
        + stroke('M384 262 L380 340', ink, 3, 0.7) + stroke('M416 262 L420 340', ink, 3, 0.7);
    }
  } else if (kind === 'windbreaker') {
    over += hood() + stroke(`M${x0} ${hemY - 16} L${800 - x0} ${hemY - 16}`, dark, 3, 0.6) + both('M168 634 L230 656', dark, 3, 0.6);
    under += `<rect x="150" y="200" width="500" height="150" fill="${lite}" fill-opacity="0.55"/>`;
    if (view === 'front') over += zip(480) + stroke('M306 430 L376 430', dark, 5, 0.9) + stroke('M440 600 L500 560', dark, 3, 0.6);
    else over += stroke(`M${x0} 350 L${800 - x0} 350`, dark, 3, 0.5);
  } else if (kind === 'bomber') {
    over += stroke(`M352 216 Q400 ${neck} 448 216`, dark, 16, 0.9) + rib();
    if (view === 'front') over += zip(hemY) + `<circle cx="455" cy="385" r="24" fill="#e6dfcd" stroke="${dark}" stroke-width="2"/><circle cx="455" cy="385" r="13" fill="none" stroke="${base}" stroke-width="4"/>`
      + both('M300 600 L352 570', dark, 4, 0.7);
  } else if (kind === 'jacket') {
    if (view === 'front') {
      const lapel = 'M352 216 L400 300 L370 320 L322 238 Z';
      over += `<path d="${lapel}" fill="${lite}" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/><path d="${mirror(lapel)}" fill="${lite}" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>`
        + stroke(`M400 300 L400 ${hemY}`, dark, 3, 0.8)
        + [350, 440, 530, 620, 705].map((y) => `<circle cx="412" cy="${y}" r="7" fill="#c9a86a" stroke="${dark}" stroke-width="1.5"/>`).join('')
        + `<rect x="304" y="372" width="78" height="92" rx="4" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.75"/><rect x="418" y="372" width="78" height="92" rx="4" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.75"/>`
        + `<rect x="298" y="590" width="88" height="112" rx="4" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.75"/><rect x="414" y="590" width="88" height="112" rx="4" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.75"/>`;
    } else {
      over += stroke('M352 216 Q400 236 448 216', dark, 14, 0.8) + stroke(`M${x0} 340 Q400 372 ${800 - x0} 340`, dark, 3, 0.7) + stroke(`M400 360 L400 ${hemY}`, dark, 2.5, 0.5);
    }
  } else if (kind === 'sweater') {
    under += Array.from({ length: 26 }, (_, i) => `<line x1="${150 + i * 20}" y1="200" x2="${150 + i * 20}" y2="760" stroke="${dark}" stroke-opacity="0.16" stroke-width="3"/>`).join('');
    over += stroke(`M352 216 Q400 ${neck} 448 216`, dark, 18, 0.85) + rib();
  } else if (kind === 'oxford') {
    if (view === 'front') {
      const collar = 'M352 216 L400 262 L366 296 L330 232 Z';
      over += `<path d="${collar}" fill="${shade(base, 0.3)}" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/><path d="${mirror(collar)}" fill="${shade(base, 0.3)}" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>`
        + stroke(`M391 266 L391 ${hemY}`, dark, 2, 0.55) + stroke(`M409 266 L409 ${hemY}`, dark, 2, 0.55)
        + [310, 390, 470, 550, 630, 705].map((y) => `<circle cx="400" cy="${y}" r="5" fill="#f6f4ee" stroke="${dark}" stroke-width="1.2"/>`).join('')
        + `<path d="M424 362 L494 362 L494 432 L459 448 L424 432 Z" fill="none" stroke="${dark}" stroke-width="2.5" stroke-opacity="0.7"/>`;
    } else {
      over += stroke('M352 216 Q400 238 448 216', dark, 14, 0.7) + stroke(`M${x0} 336 L${800 - x0} 336`, dark, 2.5, 0.6) + stroke('M400 336 L400 420', dark, 2.5, 0.5);
    }
    over += both('M168 634 L230 656', dark, 3, 0.6);
  } else if (kind === 'polo') {
    under += [330, 450, 570, 690].map((y) => `<rect x="140" y="${y}" width="520" height="56" fill="#f1eee6" fill-opacity="0.92"/>`).join('');
    const collar = 'M352 216 L400 258 L372 288 L332 230 Z';
    over += view === 'front'
      ? `<path d="${collar}" fill="#f1eee6" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/><path d="${mirror(collar)}" fill="#f1eee6" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>`
        + stroke('M400 258 L400 352', dark, 3, 0.8) + `<circle cx="400" cy="296" r="5" fill="#f1eee6" stroke="${dark}" stroke-width="1.2"/><circle cx="400" cy="330" r="5" fill="#f1eee6" stroke="${dark}" stroke-width="1.2"/>`
      : stroke('M352 216 Q400 240 448 216', '#f1eee6', 16, 1);
    over += both('M168 634 L230 656', dark, 3, 0.6);
  } else {
    // áo thun
    over += stroke(`M352 226 Q400 ${neck + 12} 448 226`, dark, 10, 0.75);
    if (kind === 'tee-graphic' && view === 'front') {
      over += `<g stroke="${ink}" stroke-opacity="0.85" fill="none" stroke-width="5" stroke-linejoin="round">
        <rect x="330" y="340" width="140" height="170" rx="6"/><circle cx="400" cy="408" r="36"/>
        <path d="M352 478 L448 478 M366 494 L434 494" stroke-width="4"/><path d="M376 420 L394 392 L410 414 L424 398" stroke-width="4"/></g>`;
    } else if (kind === 'tee-graphic') {
      over += `<rect x="372" y="282" width="56" height="10" rx="3" fill="${ink}" fill-opacity="0.8"/>`;
    } else if (view === 'front') {
      over += `<circle cx="448" cy="352" r="13" fill="none" stroke="${ink}" stroke-width="4" stroke-opacity="0.85"/><circle cx="448" cy="352" r="3.5" fill="${ink}" fill-opacity="0.85"/>`;
    }
    over += both('M200 348 L244 412', dark, 3, 0.5);
  }
  return { parts, over, under, bottom: hemY, width: short ? 430 : 500 };
}

// ---------- Quần ----------
function pants(kind: string, base: string, view: View): Art {
  const dark = shade(base, -0.32);
  const baggy = kind === 'pants-baggy';
  const d = baggy
    ? 'M285 200 L515 200 L562 800 L428 800 L400 440 L372 800 L238 800 Z'
    : 'M292 200 L508 200 L532 800 L425 800 L400 430 L375 800 L268 800 Z';
  let under = '';
  let over = stroke(`M${baggy ? 287 : 293} 230 L${baggy ? 513 : 507} 230`, dark, 3, 0.8)
    + [318, 400, 482].map((x) => `<rect x="${x - 5}" y="198" width="10" height="36" rx="2" fill="${base}" stroke="${dark}" stroke-width="2"/>`).join('')
    + both(baggy ? 'M262 778 L378 778' : 'M288 782 L380 782', dark, 2.5, 0.6);
  if (kind === 'pants-layered') under += `<rect x="200" y="545" width="400" height="300" fill="${shade(base, 0.32)}"/>`;
  if (kind === 'pants-layered') over += both('M278 545 L384 545', dark, 3, 0.75);
  if (view === 'front') {
    over += stroke('M400 230 L400 332 Q394 348 378 348', dark, 3, 0.75) + both('M302 234 Q312 304 366 308', dark, 3, 0.75)
      + `<circle cx="400" cy="215" r="6" fill="#c9a86a" stroke="${dark}" stroke-width="1.5"/>`;
    if (kind === 'pants-carpenter') over += `<rect x="452" y="440" width="56" height="96" rx="3" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.8"/>` + stroke('M288 420 Q262 470 282 524', dark, 5, 0.85);
  } else {
    over += stroke('M294 262 Q400 300 506 262', dark, 3, 0.7) + stroke('M400 230 L400 430', dark, 2.5, 0.5)
      + `<path d="M312 292 L378 292 L374 372 L345 388 L316 372 Z" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.8"/><path d="M422 292 L488 292 L484 372 L455 388 L426 372 Z" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.8"/>`
      + `<rect x="446" y="206" width="44" height="18" rx="2" fill="#b8905c" stroke="${dark}" stroke-width="1.5"/>`;
  }
  return { parts: [{ d, fill: base }], over, under, bottom: 800, width: baggy ? 360 : 300 };
}

function shorts(kind: string, base: string, view: View): Art {
  const dark = shade(base, -0.32);
  const ink = isLight(base) ? '#3a3a38' : '#f1eee6';
  const d = 'M286 300 L514 300 L550 612 L420 612 L400 472 L380 612 L250 612 Z';
  let under = '';
  let over = `<rect x="286" y="300" width="228" height="34" fill="${dark}" fill-opacity="0.38"/>`
    + Array.from({ length: 15 }, (_, i) => `<line x1="${298 + i * 15}" y1="303" x2="${298 + i * 15}" y2="331" stroke="${dark}" stroke-opacity="0.45" stroke-width="2"/>`).join('')
    + both('M258 594 L378 594', dark, 2.5, 0.6);
  if (kind === 'shorts-track') under += `<path d="M296 334 L262 612 L282 612 L314 334 Z" fill="#f1eee6"/><path d="${mirror('M296 334 L262 612 L282 612 L314 334 Z')}" fill="#f1eee6"/>`;
  if (view === 'front') {
    over += stroke('M390 322 L384 404', ink, 3.5, 0.9) + stroke('M410 322 L418 398', ink, 3.5, 0.9) + both('M300 340 Q312 396 352 404', dark, 3, 0.7);
    if (kind === 'shorts-sweat') over += `<circle cx="300" cy="560" r="10" fill="none" stroke="${ink}" stroke-width="3.5" stroke-opacity="0.85"/>`;
  } else {
    over += `<rect x="424" y="372" width="76" height="84" rx="4" fill="none" stroke="${dark}" stroke-width="3" stroke-opacity="0.8"/>` + stroke('M400 334 L400 472', dark, 2.5, 0.5);
  }
  return { parts: [{ d, fill: base }], over, under, bottom: 612, width: 330 };
}

// ---------- Phụ kiện ----------
function cap(base: string, view: View): Art {
  const dark = shade(base, -0.34);
  const ink = isLight(base) ? '#3a3a38' : '#efece4';
  const crown = 'M258 548 Q250 346 400 342 Q550 346 542 548 Q400 524 258 548 Z';
  const brim = 'M266 540 Q400 512 534 540 Q566 612 400 624 Q234 612 266 540 Z';
  let over = stroke('M400 342 Q396 440 400 528', dark, 2.5, 0.6) + stroke('M400 342 Q318 400 316 536', dark, 2.5, 0.6) + stroke('M400 342 Q482 400 484 536', dark, 2.5, 0.6)
    + `<ellipse cx="400" cy="342" rx="13" ry="7" fill="${dark}"/>`;
  if (view === 'front') {
    over += `<rect x="366" y="430" width="68" height="40" rx="5" fill="${ink}" fill-opacity="0.92"/><circle cx="400" cy="450" r="9" fill="none" stroke="${base}" stroke-width="3.5"/>`;
    return { parts: [{ d: crown, fill: base }, { d: brim, fill: shade(base, -0.14) }], over, bottom: 624, width: 340 };
  }
  over += `<path d="M348 546 Q400 462 452 546 Z" fill="#d9d5cb" stroke="${dark}" stroke-width="2.5"/>` + stroke('M350 532 L450 532', dark, 9, 0.9)
    + `<rect x="388" y="524" width="24" height="16" rx="3" fill="#c9a86a" stroke="${dark}" stroke-width="1.5"/>`;
  return { parts: [{ d: crown, fill: base }], over, bottom: 552, width: 300 };
}

function beanie(base: string, view: View): Art {
  const dark = shade(base, -0.3);
  const ink = isLight(base) ? '#3a3a38' : '#efece4';
  const dome = 'M292 576 Q284 330 400 326 Q516 330 508 576 Z';
  const cuff = 'M278 548 L522 548 L522 642 Q400 660 278 642 Z';
  const under = Array.from({ length: 17 }, (_, i) => `<line x1="${272 + i * 16}" y1="320" x2="${272 + i * 16}" y2="660" stroke="${dark}" stroke-opacity="0.22" stroke-width="4"/>`).join('');
  const over = view === 'front'
    ? `<rect x="368" y="576" width="64" height="40" rx="4" fill="${ink}" fill-opacity="0.92"/><path d="M382 596 L418 596" stroke="${base}" stroke-width="4" stroke-linecap="round"/>`
    : stroke('M400 330 L400 548', dark, 2.5, 0.5);
  return { parts: [{ d: dome, fill: base }, { d: cuff, fill: shade(base, -0.1) }], over, under, bottom: 652, width: 280 };
}

function tote(base: string, view: View): Art {
  const dark = shade(base, -0.32);
  const bag = 'M254 436 L546 436 L562 792 L238 792 Z';
  const handle = (d: string, color: string) => stroke(d, shade(color, -0.3), 23) + stroke(d, color, 18);
  const pre = handle('M330 446 Q330 268 400 268 Q470 268 470 446', shade(base, -0.16));
  let over = stroke('M256 464 L544 464', dark, 2.5, 0.6)
    + [316, 484].map((x) => `<rect x="${x - 16}" y="440" width="32" height="40" fill="none" stroke="${dark}" stroke-width="2" stroke-opacity="0.7"/><path d="M${x - 16} 440 L${x + 16} 480 M${x + 16} 440 L${x - 16} 480" stroke="${dark}" stroke-width="2" stroke-opacity="0.6"/>`).join('');
  if (view === 'front') over += `<circle cx="400" cy="624" r="52" fill="none" stroke="#2c2c2a" stroke-width="6" stroke-opacity="0.85"/><path d="M372 624 L428 624 M400 596 L400 652" stroke="#2c2c2a" stroke-width="6" stroke-opacity="0.85" stroke-linecap="round"/>`;
  else over += `<rect x="340" y="540" width="120" height="96" rx="4" fill="none" stroke="${dark}" stroke-width="2.5" stroke-opacity="0.55" stroke-dasharray="8 6"/>`;
  // quai trước vẽ đè lên thân túi
  over = handle('M316 446 Q316 240 400 240 Q484 240 484 446', base) + over;
  return { parts: [{ d: bag, fill: base }], over, under: '', bottom: 792, width: 360, ...{ pre } } as Art & { pre: string };
}

function belt(base: string, view: View): Art {
  const dark = shade(base, -0.34);
  const lite = shade(base, 0.22);
  const ring = (rx: number, ry: number, color: string, w: number, op = 1, dash = '') =>
    `<ellipse cx="400" cy="560" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" ${dash}/>`;
  let over = ring(176, 150, dark, 54) + ring(176, 150, base, 48) + ring(196, 170, lite, 2, 0.7, 'stroke-dasharray="7 6"') + ring(156, 130, lite, 2, 0.7, 'stroke-dasharray="7 6"');
  if (view === 'front') {
    over += `<path d="M330 396 L470 396 L470 444 L330 444 Z" fill="${base}" stroke="${dark}" stroke-width="3"/>`
      + [350, 372, 394].map((x) => `<circle cx="${x}" cy="420" r="4" fill="${dark}"/>`).join('')
      + `<rect x="414" y="384" width="62" height="72" rx="8" fill="none" stroke="#c2a163" stroke-width="10"/><path d="M414 420 L462 420" stroke="#c2a163" stroke-width="6" stroke-linecap="round"/>`;
  } else {
    over += `<rect x="372" y="388" width="56" height="64" rx="4" fill="${shade(base, -0.12)}" stroke="${dark}" stroke-width="3"/>`;
  }
  return { parts: [], over, bottom: 714, width: 400 };
}

function draw(kind: string, base: string, view: View): Art {
  if (kind.startsWith('pants')) return pants(kind, base, view);
  if (kind.startsWith('shorts')) return shorts(kind, base, view);
  if (kind === 'cap') return cap(base, view);
  if (kind === 'beanie') return beanie(base, view);
  if (kind === 'tote') return tote(base, view);
  if (kind === 'belt') return belt(base, view);
  return top(kind, base, view);
}

function svg(name: string, category: string, view: View) {
  const kind = kindOf(name, category);
  const base = colorOf(name, kind);
  const art = draw(kind, base, view) as Art & { pre?: string };
  const outline = isLight(base) ? '#b9b3a4' : shade(base, -0.4);
  const [bg1, bg2] = view === 'front' ? ['#f5f3ee', '#e2dfd6'] : ['#efede7', '#dbd8ce'];
  const clip = art.parts.map((p) => `<path d="${p.d}"/>`).join('');
  const fills = art.parts.map((p) => `<path d="${p.d}" fill="${p.fill}"/>`).join('');
  const lines = art.parts.map((p) => `<path d="${p.d}" fill="none" stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
<defs>
  <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></radialGradient>
  <linearGradient id="lt" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></linearGradient>
  <filter id="blur" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"/></filter>
  <clipPath id="c">${clip}</clipPath>
</defs>
<rect width="800" height="1000" fill="url(#bg)"/>
<ellipse cx="400" cy="${art.bottom + 22}" rx="${art.width * 0.5}" ry="15" fill="#000" fill-opacity="0.22" filter="url(#blur)"/>
${art.pre ?? ''}
${fills}
<g clip-path="url(#c)">${art.under ?? ''}<rect width="800" height="1000" fill="url(#lt)"/><rect width="800" height="1000" filter="url(#grain)" opacity="${isLight(base) ? 0.09 : 0.22}"/></g>
${lines}
${art.over}
</svg>`;
}

/** Ghi 2 ảnh (trước/sau) vào backend/uploads/seed và trả về URL */
export function writeProductImages(slug: string, name: string, category: string): string[] {
  const dir = path.resolve(process.cwd(), 'uploads', 'seed');
  fs.mkdirSync(dir, { recursive: true });
  return (['front', 'back'] as View[]).map((view, i) => {
    const file = `${slug}-${i + 1}-${MOCK_VERSION}.svg`;
    fs.writeFileSync(path.join(dir, file), svg(name, category, view));
    return `/uploads/seed/${file}`;
  });
}
