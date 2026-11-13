/**
 * "Backend" chạy ngay trong trình duyệt cho bản demo (GitHub Pages không chạy được server).
 * Trả về đúng định dạng và thông báo lỗi như backend thật (backend/src), nên các trang không cần biết
 * mình đang chạy demo. Dữ liệu lưu trong localStorage của từng người xem.
 */
import seed from './seed.json';
import { ApiError } from '@/services/apiError';
import type {
  AdminStats, Category, ContactMessage, Order, OrderItem, OrderStatus, PaymentMethod, Role, User, Variant,
} from '@/types';

const DB_KEY = 'vacession_demo_db_v1';
const SESSION_KEY = 'vacession_demo_session';
const ADMIN_EMAIL = 'admin@vacession.vn';
const ADMIN_PASSWORD = 'Admin@123';
const LOW_STOCK = 3;

// ---------- Kiểu dữ liệu lưu trữ ----------
interface DbUser extends User { passwordHash: string }
interface DbProduct {
  id: string; name: string; slug: string; description: string; price: number; images: string[];
  sizeChart: string | null; categoryId: string; isActive: boolean; isNew: boolean; sortOrder: number;
  soldCount: number; createdAt: string; variants: Variant[];
}
interface DbOrder extends Order { userId: string | null; updatedAt: string }
interface DB {
  categories: Category[];
  products: DbProduct[];
  users: DbUser[];
  orders: DbOrder[];
  messages: ContactMessage[];
  resetTokens: { token: string; userId: string; expiresAt: number; used: boolean }[];
}

// ---------- Tiện ích ----------
const fail = (message: string, status = 400): never => { throw new ApiError(message, status); };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);
const now = () => new Date().toISOString();
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
const slugify = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0|\+84)\d{9,10}$/;

async function hash(text: string) {
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`vacession-demo:${text}`));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `plain:${text}`; // trình duyệt quá cũ / không phải https — chỉ là demo
}

function str(v: unknown, field: string, { required = false, max = 255 } = {}) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) fail(`Vui lòng nhập ${field}`);
  if (s.length > max) fail(`${field} quá dài`);
  return s;
}
const email = (v: unknown) => {
  const s = str(v, 'email', { required: true }).toLowerCase();
  if (!EMAIL_RE.test(s)) fail('Email không hợp lệ');
  return s;
};
const password = (v: unknown) => {
  const s = typeof v === 'string' ? v : '';
  if (!s) fail('Vui lòng nhập mật khẩu');
  if (s.length < 6) fail('Mật khẩu tối thiểu 6 ký tự');
  return s;
};

// ---------- Lưu trữ ----------
let memory: DB | null = null;

function save(db: DB) {
  memory = db;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    fail('Bộ nhớ trình duyệt đã đầy. Hãy xóa bớt ảnh đã tải lên hoặc khôi phục dữ liệu mẫu.', 507);
  }
}

async function load(): Promise<DB> {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return (memory = JSON.parse(raw) as DB);
  } catch {
    // localStorage bị chặn: dùng bộ nhớ tạm trong phiên
  }
  const db = await createSeed();
  save(db);
  return db;
}

/** Xóa toàn bộ thay đổi của người xem, quay về dữ liệu mẫu ban đầu */
export function resetDemo() {
  memory = null;
  try {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('vacession_cart');
  } catch {
    // bỏ qua
  }
}

const getSession = () => { try { return localStorage.getItem(SESSION_KEY); } catch { return null; } };
const setSession = (id: string | null) => {
  try { if (id) localStorage.setItem(SESSION_KEY, id); else localStorage.removeItem(SESSION_KEY); } catch { /* bỏ qua */ }
};

// ---------- Dữ liệu mẫu ban đầu ----------
/** Số ngẫu nhiên cố định theo seed: mọi người xem thấy cùng một bộ đơn mẫu */
function rng(seedNum: number) {
  let s = seedNum;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

async function createSeed(): Promise<DB> {
  const db: DB = {
    categories: clone(seed.categories) as Category[],
    products: clone(seed.products) as DbProduct[],
    users: [], orders: [], messages: [], resetTokens: [],
  };
  const t = now();
  db.users.push({
    id: 'u-admin', email: ADMIN_EMAIL, passwordHash: await hash(ADMIN_PASSWORD), firstName: 'Admin', lastName: null,
    phone: null, address: null, city: null, role: 'ADMIN', createdAt: t,
  });

  const customers = [
    { first: 'Lan', last: 'Trần', city: 'TP.HCM', phone: '0901234567' },
    { first: 'Minh', last: 'Nguyễn', city: 'Hà Nội', phone: '0912345678' },
    { first: 'Huy', last: 'Phạm', city: 'Đà Nẵng', phone: '0934567890' },
    { first: 'Thảo', last: 'Lê', city: 'TP.HCM', phone: '0987654321' },
  ];
  const custPass = await hash('demo123');
  customers.forEach((c, i) => db.users.push({
    id: `u-demo-${i}`, email: `khach${i + 1}@example.com`, passwordHash: custPass, firstName: c.first, lastName: c.last,
    phone: c.phone, address: `${12 + i * 7} Lê Lợi`, city: c.city, role: 'CUSTOMER',
    createdAt: new Date(Date.now() - (20 + i * 3) * 86400000).toISOString(),
  }));

  // ~14 đơn rải trong 2 tuần gần nhất để trang tổng quan admin có số liệu
  const r = rng(20261113);
  const plan: [number, OrderStatus][] = [
    [0, 'PENDING'], [0, 'PENDING'], [1, 'CONFIRMED'], [1, 'PENDING'], [2, 'SHIPPING'], [3, 'COMPLETED'], [4, 'COMPLETED'],
    [5, 'CANCELLED'], [6, 'COMPLETED'], [8, 'COMPLETED'], [9, 'SHIPPING'], [10, 'COMPLETED'], [12, 'COMPLETED'], [13, 'COMPLETED'],
  ];
  for (const [daysAgo, status] of plan) {
    const c = customers[Math.floor(r() * customers.length)];
    const ci = customers.indexOf(c);
    const lines = 1 + Math.floor(r() * 2);
    const items: OrderItem[] = [];
    for (let k = 0; k < lines; k++) {
      const p = db.products[Math.floor(r() * db.products.length)];
      const v = p.variants.filter((x) => x.stock > 2)[0];
      if (!v || items.some((it) => it.productSlug === p.slug && it.size === v.size)) continue;
      const qty = 1 + Math.floor(r() * 2);
      if (status !== 'CANCELLED') { v.stock -= qty; p.soldCount += qty; }
      items.push({ id: uid(), productName: p.name, productSlug: p.slug, size: v.size, image: p.images[0] ?? null, price: p.price, quantity: qty });
    }
    if (!items.length) continue;
    const created = new Date(Date.now() - daysAgo * 86400000 - Math.floor(r() * 8) * 3600000);
    const subtotal = items.reduce((n, it) => n + it.price * it.quantity, 0);
    db.orders.push({
      id: uid(), code: orderCode(created), userId: `u-demo-${ci}`, email: `khach${ci + 1}@example.com`,
      firstName: c.first, lastName: c.last, phone: c.phone, address: `${12 + ci * 7} Lê Lợi`, city: c.city, district: null, note: null,
      paymentMethod: r() > 0.5 ? 'COD' : 'BANK_TRANSFER', status, subtotal, shippingFee: seed.settings.shippingFee,
      total: subtotal + seed.settings.shippingFee, items, createdAt: created.toISOString(), updatedAt: created.toISOString(),
    });
  }
  db.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  db.messages.push({
    id: uid(), name: 'Minh Nguyễn', email: 'khach2@example.com', phone: null, isRead: false,
    message: 'Shop ơi, hoodie navy bao giờ có lại size XL ạ?', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  });
  return db;
}

function orderCode(d = new Date()) {
  const ymd = `${d.getFullYear() % 100}`.padStart(2, '0') + `${d.getMonth() + 1}`.padStart(2, '0') + `${d.getDate()}`.padStart(2, '0');
  return `VC${ymd}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

// ---------- Định dạng trả về ----------
const publicUser = ({ passwordHash: _, ...u }: DbUser): User => u;

function card(db: DB, p: DbProduct) {
  const c = db.categories.find((x) => x.id === p.categoryId);
  return {
    id: p.id, name: p.name, slug: p.slug, price: p.price, images: p.images, isNew: p.isNew,
    category: { name: c?.name ?? '', slug: c?.slug ?? '' }, variants: p.variants.map(({ id, size, stock }) => ({ id, size, stock })),
  };
}
const paginate = <T>(all: T[], page: number, limit: number) => ({
  items: all.slice((page - 1) * limit, page * limit), total: all.length, page, totalPages: Math.max(1, Math.ceil(all.length / limit)),
});
const num = (v: string | null, def: number, max = 100) => Math.min(max, Math.max(1, Number(v) || def));
const orderOut = ({ userId: _u, updatedAt: _t, ...o }: DbOrder): Order => o;

// ---------- Xác thực ----------
function currentUser(db: DB) {
  const id = getSession();
  return id ? db.users.find((u) => u.id === id) ?? null : null;
}
function requireUser(db: DB) {
  return currentUser(db) ?? fail('Vui lòng đăng nhập', 401);
}
function requireAdmin(db: DB) {
  const u = requireUser(db);
  if (u.role !== 'ADMIN') fail('Bạn không có quyền truy cập', 403);
  return u;
}

// ---------- Nghiệp vụ dùng chung ----------
function uniqueSlug(base: string, taken: (s: string) => boolean) {
  const root = slugify(base) || 'item';
  let slug = root;
  for (let i = 2; taken(slug); i++) slug = `${root}-${i}`;
  return slug;
}

function restoreStock(db: DB, o: DbOrder) {
  for (const it of o.items) {
    const p = db.products.find((x) => x.slug === it.productSlug);
    const v = p?.variants.find((x) => x.size === it.size);
    if (v) v.stock += it.quantity;
    if (p) p.soldCount = Math.max(0, p.soldCount - it.quantity);
  }
}

function changeStatus(db: DB, o: DbOrder, next: OrderStatus) {
  if (o.status === next) return;
  if (o.status === 'CANCELLED') fail('Đơn đã hủy, không thể đổi trạng thái');
  if (next === 'CANCELLED') restoreStock(db, o);
  o.status = next;
  o.updatedAt = now();
}

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function stats(db: DB): AdminStats {
  const DAYS = 14;
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (DAYS - 1));
  const prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - DAYS);
  const valid = db.orders.filter((o) => o.status !== 'CANCELLED');
  const daily = Array.from({ length: DAYS }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return { date: dayKey(d), revenue: 0, orders: 0 }; });
  const byDate = new Map(daily.map((d) => [d.date, d]));
  for (const o of valid) {
    const d = byDate.get(dayKey(new Date(o.createdAt)));
    if (d) { d.revenue += o.total; d.orders += 1; }
  }
  const statusCounts: Record<OrderStatus, number> = { PENDING: 0, CONFIRMED: 0, SHIPPING: 0, COMPLETED: 0, CANCELLED: 0 };
  db.orders.forEach((o) => { statusCounts[o.status] += 1; });

  const sold = new Map<string, { name: string; quantity: number; slug: string | null }>();
  for (const o of valid) for (const it of o.items) {
    const key = it.productSlug ?? it.productName;
    const cur = sold.get(key) ?? { name: it.productName, quantity: 0, slug: it.productSlug };
    cur.quantity += it.quantity; sold.set(key, cur);
  }
  const topProducts = [...sold.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5).map((t) => {
    const p = db.products.find((x) => x.slug === t.slug);
    return { productId: p?.id ?? null, name: t.name, quantity: t.quantity, image: p?.images[0] ?? null };
  });
  const low = db.products.filter((p) => p.isActive)
    .flatMap((p) => p.variants.filter((v) => v.stock <= LOW_STOCK).map((v) => ({ variantId: v.id, productId: p.id, name: p.name, image: p.images[0] ?? null, size: v.size, stock: v.stock })))
    .sort((a, b) => a.stock - b.stock);

  return {
    totalOrders: db.orders.length,
    pendingOrders: statusCounts.PENDING,
    revenue: valid.reduce((n, o) => n + o.total, 0),
    totalProducts: db.products.filter((p) => p.isActive).length,
    totalCustomers: db.users.filter((u) => u.role === 'CUSTOMER').length,
    unreadMessages: db.messages.filter((m) => !m.isRead).length,
    recentOrders: db.orders.slice(0, 6).map(({ items: _i, ...o }) => orderOut({ ...o, items: [] })),
    daily,
    periodRevenue: daily.reduce((n, d) => n + d.revenue, 0),
    prevPeriodRevenue: valid.filter((o) => { const t = new Date(o.createdAt); return t >= prevStart && t < start; }).reduce((n, o) => n + o.total, 0),
    statusCounts, topProducts, lowStock: low.slice(0, 6), lowStockCount: low.length,
  };
}

/** Thu nhỏ ảnh tải lên (tối đa 900px) rồi lưu dạng data URL để vừa localStorage */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ApiError('Không đọc được ảnh', 400));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new ApiError('Ảnh không hợp lệ', 400));
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Bộ định tuyến ----------
type Body = Record<string, unknown>;
type Ctx = { db: DB; q: URLSearchParams; body: Body; params: Record<string, string>; raw: BodyInit | null | undefined };
type Handler = (ctx: Ctx) => unknown | Promise<unknown>;
const routes: [string, RegExp, string[], Handler][] = [];
function route(method: string, pattern: string, handler: Handler) {
  const keys: string[] = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_m, k) => { keys.push(k); return '([^/]+)'; })}$`);
  routes.push([method, re, keys, handler]);
}

// --- Công khai ---
route('GET', '/health', () => ({ status: 'ok', timestamp: now() }));
route('GET', '/settings', () => ({ shippingFee: seed.settings.shippingFee, shop: seed.settings.shop }));
route('GET', '/categories', ({ db }) => [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
  .map((c) => ({ ...c, productCount: db.products.filter((p) => p.isActive && p.categoryId === c.id).length })));

route('GET', '/products', ({ db, q }) => {
  const cat = q.get('category') ? db.categories.find((c) => c.slug === q.get('category')) : undefined;
  const term = norm(q.get('q') ?? '');
  let list = db.products.filter((p) => p.isActive
    && (!q.get('category') || p.categoryId === cat?.id)
    && (q.get('new') !== 'true' || p.isNew)
    && (!term || norm(p.name).includes(term)));
  const sort = q.get('sort') ?? 'default';
  const by: Record<string, (a: DbProduct, b: DbProduct) => number> = {
    popularity: (a, b) => b.soldCount - a.soldCount || b.createdAt.localeCompare(a.createdAt),
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    price: (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
  };
  list = [...list].sort(by[sort] ?? ((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt)));
  return paginate(list.map((p) => card(db, p)), num(q.get('page'), 1, 1e6), num(q.get('limit'), 48));
});

route('GET', '/products/:slug', ({ db, params }) => {
  const p = db.products.find((x) => x.slug === decodeURIComponent(params.slug) && x.isActive) ?? fail('Không tìm thấy sản phẩm', 404);
  const related = db.products.filter((x) => x.isActive && x.categoryId === p.categoryId && x.id !== p.id)
    .sort((a, b) => b.soldCount - a.soldCount).slice(0, 4).map((x) => card(db, x));
  return { ...card(db, p), description: p.description, sizeChart: p.sizeChart, categoryId: p.categoryId, related };
});

// --- Tài khoản ---
route('POST', '/auth/register', async ({ db, body }) => {
  const mail = email(body.email); const pass = password(body.password);
  if (db.users.some((u) => u.email === mail)) fail('Email này đã được đăng ký', 409);
  const user: DbUser = {
    id: uid(), email: mail, passwordHash: await hash(pass), firstName: str(body.firstName, 'tên', { max: 50 }) || null,
    lastName: str(body.lastName, 'họ', { max: 50 }) || null, phone: null, address: null, city: null, role: 'CUSTOMER' as Role, createdAt: now(),
  };
  db.users.push(user); save(db); setSession(user.id);
  return { user: publicUser(user) };
});
route('POST', '/auth/login', async ({ db, body }) => {
  const mail = email(body.email);
  if (typeof body.password !== 'string' || !body.password) fail('Vui lòng nhập mật khẩu');
  const u = db.users.find((x) => x.email === mail);
  if (!u || u.passwordHash !== await hash(body.password as string)) fail('Email hoặc mật khẩu không đúng', 401);
  setSession(u!.id);
  return { user: publicUser(u!) };
});
route('POST', '/auth/logout', () => { setSession(null); return { message: 'Đã đăng xuất' }; });
route('GET', '/auth/me', ({ db }) => { const u = currentUser(db); return { user: u ? publicUser(u) : null }; });
route('POST', '/auth/forgot-password', ({ db, body }) => {
  const u = db.users.find((x) => x.email === email(body.email));
  if (!u) return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' };
  const token = uid().replace(/-/g, '');
  db.resetTokens.push({ token, userId: u.id, expiresAt: Date.now() + 3600000, used: false }); save(db);
  const link = `${location.origin}${import.meta.env.BASE_URL}my-account/reset-password?token=${token}`;
  return { message: `Bản demo không gửi email thật. Mở link sau để đặt lại mật khẩu: ${link}` };
});
route('POST', '/auth/reset-password', async ({ db, body }) => {
  const rec = db.resetTokens.find((t) => t.token === body.token);
  if (!rec || rec.used || rec.expiresAt < Date.now()) fail('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
  const u = db.users.find((x) => x.id === rec!.userId) ?? fail('Không tìm thấy tài khoản', 404);
  u.passwordHash = await hash(password(body.password)); rec!.used = true; save(db);
  return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' };
});
route('PUT', '/account/profile', ({ db, body }) => {
  const u = requireUser(db);
  u.firstName = str(body.firstName, 'tên', { max: 50 }) || null;
  u.lastName = str(body.lastName, 'họ', { max: 50 }) || null;
  u.phone = str(body.phone, 'số điện thoại', { max: 20 }) || null;
  u.address = str(body.address, 'địa chỉ') || null;
  u.city = str(body.city, 'tỉnh/thành phố', { max: 100 }) || null;
  save(db);
  return { user: publicUser(u) };
});
route('PUT', '/account/password', async ({ db, body }) => {
  const u = requireUser(db);
  if (typeof body.currentPassword !== 'string' || !body.currentPassword) fail('Vui lòng nhập mật khẩu hiện tại');
  if (u.passwordHash !== await hash(body.currentPassword as string)) fail('Mật khẩu hiện tại không đúng');
  u.passwordHash = await hash(password(body.newPassword)); save(db);
  return { message: 'Đổi mật khẩu thành công' };
});

// --- Đơn hàng ---
route('POST', '/orders', ({ db, body }) => {
  const customer = {
    firstName: str(body.firstName, 'tên', { required: true, max: 50 }),
    lastName: str(body.lastName, 'họ', { required: true, max: 50 }),
    email: email(body.email),
    phone: str(body.phone, 'số điện thoại', { required: true, max: 20 }),
    address: str(body.address, 'địa chỉ', { required: true }),
    city: str(body.city, 'tỉnh/thành phố', { required: true, max: 100 }),
    district: str(body.district, 'quận/huyện', { max: 100 }) || null,
    note: str(body.note, 'ghi chú', { max: 500 }) || null,
  };
  if (!PHONE_RE.test(customer.phone)) fail('Số điện thoại không hợp lệ');
  const payment = body.paymentMethod as PaymentMethod;
  if (payment !== 'COD' && payment !== 'BANK_TRANSFER') fail('Vui lòng chọn phương thức thanh toán');
  const lines = Array.isArray(body.items) ? (body.items as { variantId: string; quantity: number }[]) : [];
  if (!lines.length) fail('Giỏ hàng trống');

  const qty = new Map<string, number>();
  lines.forEach((l) => qty.set(l.variantId, (qty.get(l.variantId) ?? 0) + Math.max(1, Math.floor(Number(l.quantity) || 0))));
  // Kiểm tra hết rồi mới trừ kho, để lỗi giữa chừng không làm lệch tồn kho
  const picked = [...qty].map(([variantId, n]) => {
    const p = db.products.find((x) => x.variants.some((v) => v.id === variantId));
    const v = p?.variants.find((x) => x.id === variantId);
    if (!p || !v) fail('Một số sản phẩm không còn tồn tại, vui lòng kiểm tra lại giỏ hàng');
    if (!p!.isActive) fail(`${p!.name} đã ngừng bán`);
    if (v!.stock < n) fail(v!.stock > 0 ? `${p!.name} (size ${v!.size}) chỉ còn ${v!.stock} sản phẩm` : `${p!.name} (size ${v!.size}) đã hết hàng`);
    return { p: p!, v: v!, n };
  });
  const items: OrderItem[] = picked.map(({ p, v, n }) => {
    v.stock -= n; p.soldCount += n;
    return { id: uid(), productName: p.name, productSlug: p.slug, size: v.size, image: p.images[0] ?? null, price: p.price, quantity: n };
  });
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const t = now();
  const order: DbOrder = {
    id: uid(), code: orderCode(), userId: currentUser(db)?.id ?? null, ...customer, paymentMethod: payment, status: 'PENDING',
    subtotal, shippingFee: seed.settings.shippingFee, total: subtotal + seed.settings.shippingFee, items, createdAt: t, updatedAt: t,
  };
  db.orders.unshift(order); save(db);
  return orderOut(order);
});
route('GET', '/orders/my', ({ db }) => { const u = requireUser(db); return db.orders.filter((o) => o.userId === u.id).map(orderOut); });
route('POST', '/orders/my/:code/cancel', ({ db, params }) => {
  const u = requireUser(db);
  const o = db.orders.find((x) => x.code === params.code && x.userId === u.id) ?? fail('Không tìm thấy đơn hàng', 404);
  if (o.status !== 'PENDING') fail('Chỉ có thể hủy đơn đang chờ xác nhận');
  changeStatus(db, o, 'CANCELLED'); save(db);
  return orderOut(o);
});
route('GET', '/orders/:code', ({ db, params, q }) => {
  const o = db.orders.find((x) => x.code === params.code);
  const u = currentUser(db);
  const mail = (q.get('email') ?? '').trim().toLowerCase();
  if (!o || !((u && o.userId === u.id) || (mail && o.email === mail))) fail('Không tìm thấy đơn hàng', 404);
  return { ...orderOut(o!), bank: o!.paymentMethod === 'BANK_TRANSFER' ? seed.settings.bank : undefined };
});
route('POST', '/contact', ({ db, body }) => {
  const name = str(body.name, 'họ tên', { required: true, max: 100 });
  const message = str(body.message, 'nội dung', { required: true, max: 2000 });
  if (message.length < 5) fail('Nội dung tối thiểu 5 ký tự');
  db.messages.unshift({ id: uid(), name, email: email(body.email), phone: str(body.phone, 'số điện thoại', { max: 20 }) || null, message, isRead: false, createdAt: now() });
  save(db);
  return { message: 'Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.' };
});

// --- Admin ---
route('GET', '/admin/stats', ({ db }) => { requireAdmin(db); return stats(db); });

route('GET', '/admin/products', ({ db, q }) => {
  requireAdmin(db);
  const term = norm(q.get('q') ?? '');
  const list = db.products.filter((p) => (!term || norm(p.name).includes(term))
    && (!q.get('category') || p.categoryId === q.get('category'))
    && (q.get('stock') !== 'low' || p.variants.some((v) => v.stock <= LOW_STOCK))
    && (q.get('stock') !== 'out' || p.variants.every((v) => v.stock <= 0)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => ({ ...p, category: { name: db.categories.find((c) => c.id === p.categoryId)?.name ?? '' } }));
  return paginate(list, num(q.get('page'), 1, 1e6), num(q.get('limit'), 20));
});
route('GET', '/admin/products/:id', ({ db, params }) => {
  requireAdmin(db);
  return db.products.find((p) => p.id === params.id) ?? fail('Không tìm thấy sản phẩm', 404);
});

function productInput(db: DB, body: Body, id?: string) {
  const name = str(body.name, 'tên sản phẩm', { required: true, max: 200 });
  const price = Number(body.price);
  if (!Number.isInteger(price) || price < 0) fail('Giá không hợp lệ');
  if (!db.categories.some((c) => c.id === body.categoryId)) fail('Vui lòng chọn danh mục');
  const variants = (Array.isArray(body.variants) ? body.variants : []) as { size: string; stock: number }[];
  const clean = variants.map((v) => ({ size: String(v.size ?? '').trim(), stock: Math.max(0, Math.floor(Number(v.stock) || 0)) })).filter((v) => v.size);
  if (!clean.length) fail('Cần ít nhất 1 size');
  if (new Set(clean.map((v) => v.size.toUpperCase())).size !== clean.length) fail('Size bị trùng');
  const rawSlug = str(body.slug, 'slug').toLowerCase();
  if (rawSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)) fail('Slug chỉ gồm chữ thường, số và dấu gạch ngang');
  const taken = (s: string) => db.products.some((p) => p.slug === s && p.id !== id);
  if (rawSlug && taken(rawSlug)) fail('Dữ liệu đã tồn tại (trùng slug hoặc email)', 409);
  return {
    name, price, slug: rawSlug || uniqueSlug(name, taken), description: typeof body.description === 'string' ? body.description : '',
    images: (Array.isArray(body.images) ? body.images : []).filter((x): x is string => typeof x === 'string').slice(0, 10),
    sizeChart: typeof body.sizeChart === 'string' && body.sizeChart ? body.sizeChart : null,
    categoryId: body.categoryId as string, isActive: body.isActive !== false, isNew: body.isNew === true,
    sortOrder: Math.floor(Number(body.sortOrder) || 0), variants: clean,
  };
}
route('POST', '/admin/products', ({ db, body }) => {
  requireAdmin(db);
  const { variants, ...data } = productInput(db, body);
  const p: DbProduct = { id: uid(), ...data, soldCount: 0, createdAt: now(), variants: variants.map((v) => ({ id: uid(), ...v })) };
  db.products.unshift(p); save(db);
  return p;
});
route('PUT', '/admin/products/:id', ({ db, params, body }) => {
  requireAdmin(db);
  const p = db.products.find((x) => x.id === params.id) ?? fail('Không tìm thấy sản phẩm', 404);
  const { variants, ...data } = productInput(db, body, p.id);
  Object.assign(p, data);
  // Giữ id của size cũ để giỏ hàng của khách không bị lệch
  p.variants = variants.map((v) => ({ id: p.variants.find((o) => o.size === v.size)?.id ?? uid(), ...v }));
  save(db);
  return p;
});
route('DELETE', '/admin/products/:id', ({ db, params }) => {
  requireAdmin(db);
  if (!db.products.some((p) => p.id === params.id)) fail('Không tìm thấy dữ liệu', 404);
  db.products = db.products.filter((p) => p.id !== params.id); save(db);
  return undefined;
});

function categoryInput(db: DB, body: Body, id?: string) {
  const name = str(body.name, 'tên danh mục', { required: true, max: 100 });
  const rawSlug = str(body.slug, 'slug').toLowerCase();
  const taken = (s: string) => db.categories.some((c) => c.slug === s && c.id !== id);
  if (rawSlug && taken(rawSlug)) fail('Dữ liệu đã tồn tại (trùng slug hoặc email)', 409);
  return { name, slug: rawSlug || uniqueSlug(name, taken), sortOrder: Math.floor(Number(body.sortOrder) || 0) };
}
route('POST', '/admin/categories', ({ db, body }) => {
  requireAdmin(db);
  const c: Category = { id: uid(), ...categoryInput(db, body) };
  db.categories.push(c); save(db);
  return c;
});
route('PUT', '/admin/categories/:id', ({ db, params, body }) => {
  requireAdmin(db);
  const c = db.categories.find((x) => x.id === params.id) ?? fail('Không tìm thấy dữ liệu', 404);
  Object.assign(c, categoryInput(db, body, c.id)); save(db);
  return c;
});
route('DELETE', '/admin/categories/:id', ({ db, params }) => {
  requireAdmin(db);
  const count = db.products.filter((p) => p.categoryId === params.id).length;
  if (count > 0) fail(`Danh mục đang có ${count} sản phẩm, không thể xóa`);
  db.categories = db.categories.filter((c) => c.id !== params.id); save(db);
  return undefined;
});

route('GET', '/admin/orders', ({ db, q }) => {
  requireAdmin(db);
  const term = norm(q.get('q') ?? '');
  const list = db.orders.filter((o) => (!q.get('status') || o.status === q.get('status'))
    && (!term || [o.code, o.email, o.phone, o.firstName, o.lastName].some((f) => norm(f).includes(term))))
    .map((o) => ({ ...orderOut(o), _count: { items: o.items.length } }));
  return paginate(list, num(q.get('page'), 1, 1e6), num(q.get('limit'), 20));
});
route('GET', '/admin/orders/:id', ({ db, params }) => {
  requireAdmin(db);
  return orderOut(db.orders.find((o) => o.id === params.id) ?? fail('Không tìm thấy đơn hàng', 404));
});
route('PATCH', '/admin/orders/:id/status', ({ db, params, body }) => {
  requireAdmin(db);
  const o = db.orders.find((x) => x.id === params.id) ?? fail('Không tìm thấy đơn hàng', 404);
  const next = body.status as OrderStatus;
  if (!['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].includes(next)) fail('Trạng thái không hợp lệ');
  changeStatus(db, o, next); save(db);
  return orderOut(o);
});

route('GET', '/admin/customers', ({ db, q }) => {
  requireAdmin(db);
  const term = norm(q.get('q') ?? '');
  const list = db.users.filter((u) => u.role === 'CUSTOMER'
    && (!term || [u.email, u.firstName ?? '', u.lastName ?? '', u.phone ?? ''].some((f) => norm(f).includes(term))))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((u) => {
      const orders = db.orders.filter((o) => o.userId === u.id);
      return {
        ...publicUser(u), orderCount: orders.length,
        spent: orders.filter((o) => o.status !== 'CANCELLED').reduce((n, o) => n + o.total, 0),
        lastOrderAt: orders.reduce<string | null>((m, o) => (!m || o.createdAt > m ? o.createdAt : m), null),
      };
    });
  return paginate(list, num(q.get('page'), 1, 1e6), num(q.get('limit'), 20));
});
route('GET', '/admin/messages', ({ db }) => { requireAdmin(db); return db.messages; });
route('PATCH', '/admin/messages/:id/read', ({ db, params }) => {
  requireAdmin(db);
  const m = db.messages.find((x) => x.id === params.id) ?? fail('Không tìm thấy dữ liệu', 404);
  m.isRead = true; save(db);
  return m;
});
route('POST', '/admin/upload', async ({ db, raw }) => {
  requireAdmin(db);
  const files = raw instanceof FormData ? raw.getAll('images').filter((f): f is File => f instanceof File) : [];
  if (!files.length) fail('Chưa chọn ảnh');
  if (files.some((f) => !/^image\/(jpeg|png|webp|gif)$/.test(f.type))) fail('Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF');
  return { urls: await Promise.all(files.slice(0, 10).map(fileToDataUrl)) };
});

// ---------- Điểm vào ----------
export async function handleDemoRequest(method: string, fullPath: string, body?: BodyInit | null): Promise<unknown> {
  await sleep(120 + Math.random() * 160); // giả lập độ trễ mạng để loading hiển thị tự nhiên
  const [path, query = ''] = fullPath.split('?');
  const db = await load();
  let parsed: Body = {};
  if (typeof body === 'string') { try { parsed = JSON.parse(body) as Body; } catch { fail('JSON không hợp lệ'); } }

  for (const [m, re, keys, handler] of routes) {
    if (m !== method.toUpperCase()) continue;
    const match = re.exec(path);
    if (!match) continue;
    const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
    const result = await handler({ db, q: new URLSearchParams(query), body: parsed, params, raw: body });
    return result === undefined ? undefined : clone(result);
  }
  return fail(`Không tìm thấy: ${method} /api${path}`, 404);
}
