/**
 * Xuất danh mục, sản phẩm và thông tin shop từ database ra file tĩnh cho bản demo (GitHub Pages).
 *   - frontend/src/demo/seed.json       : dữ liệu
 *   - frontend/public/demo/products/    : ảnh sản phẩm đang dùng ở /uploads/
 * Chạy lại mỗi khi muốn bản demo cập nhật theo dữ liệu mới: npm run demo:export
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FRONTEND = path.resolve(process.cwd(), '../frontend');
const OUT_JSON = path.join(FRONTEND, 'src/demo/seed.json');
const OUT_IMG = path.join(FRONTEND, 'public/demo/products');
const UPLOADS = path.resolve(process.cwd(), 'uploads');

async function main() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.product.findMany({ include: { variants: { orderBy: { id: 'asc' } } }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
  ]);

  fs.rmSync(OUT_IMG, { recursive: true, force: true });
  fs.mkdirSync(OUT_IMG, { recursive: true });

  // Ảnh trong /uploads được chép sang frontend; ảnh là link ngoài thì giữ nguyên
  const toStatic = (url: string) => {
    if (!url.startsWith('/uploads/')) return url;
    const file = path.basename(url);
    fs.copyFileSync(path.join(UPLOADS, url.replace(/^\/uploads\//, '')), path.join(OUT_IMG, file));
    return `/demo/products/${file}`;
  };

  const data = {
    exportedAt: new Date().toISOString(),
    settings: {
      shippingFee: Number(process.env.SHIPPING_FEE ?? 0),
      shop: {
        email: process.env.SHOP_EMAIL ?? '', phone: process.env.SHOP_PHONE ?? '',
        address: process.env.SHOP_ADDRESS ?? '', instagram: process.env.SHOP_INSTAGRAM ?? '',
      },
      bank: {
        name: process.env.BANK_NAME ?? '', accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? '',
        accountName: process.env.BANK_ACCOUNT_NAME ?? '',
      },
    },
    categories: categories.map(({ id, name, slug, sortOrder }) => ({ id, name, slug, sortOrder })),
    products: products.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description, price: p.price,
      images: p.images.map(toStatic), sizeChart: p.sizeChart ? toStatic(p.sizeChart) : null,
      categoryId: p.categoryId, isActive: p.isActive, isNew: p.isNew, sortOrder: p.sortOrder,
      soldCount: p.soldCount, createdAt: p.createdAt.toISOString(),
      variants: p.variants.map(({ id, size, stock }) => ({ id, size, stock })),
    })),
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ Đã xuất ${data.categories.length} danh mục, ${data.products.length} sản phẩm, ${fs.readdirSync(OUT_IMG).length} ảnh cho bản demo.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
