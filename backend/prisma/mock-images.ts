/**
 * Vẽ lại ảnh mẫu cho các sản phẩm đang dùng ảnh mẫu (/uploads/seed/...).
 * Sản phẩm đã có ảnh thật (upload qua Admin) không bị đụng tới.
 * Chạy: npm run db:mock-images
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { writeProductImages } from './placeholders.js';

const prisma = new PrismaClient();
const SEED_PREFIX = '/uploads/seed/';

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  const keep = new Set<string>();
  let updated = 0;
  for (const p of products) {
    const usesMock = p.images.length === 0 || p.images.every((u) => u.startsWith(SEED_PREFIX));
    if (!usesMock) { p.images.filter((u) => u.startsWith(SEED_PREFIX)).forEach((u) => keep.add(path.basename(u))); continue; }
    const images = writeProductImages(p.slug, p.name, p.category.slug);
    images.forEach((u) => keep.add(path.basename(u)));
    await prisma.product.update({ where: { id: p.id }, data: { images } });
    updated++;
  }
  // Dọn file ảnh mẫu cũ không còn sản phẩm nào dùng
  const dir = path.resolve(process.cwd(), 'uploads', 'seed');
  const stale = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !keep.has(f)) : [];
  stale.forEach((f) => fs.unlinkSync(path.join(dir, f)));
  console.log(`✅ Đã vẽ lại ảnh mẫu cho ${updated}/${products.length} sản phẩm, xóa ${stale.length} file cũ.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
