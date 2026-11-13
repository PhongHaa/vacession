import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { slugify } from '../src/utils/slugify.js';
import { writeProductImages } from './placeholders.js';

const prisma = new PrismaClient();

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL'];

const categories = [
  { name: 'Outerwears', slug: 'outerwears', sortOrder: 1 },
  { name: 'Tops', slug: 'tops', sortOrder: 2 },
  { name: 'Bottom', slug: 'bottom', sortOrder: 3 },
  { name: 'Accessories', slug: 'accessories', sortOrder: 4 },
];

const DESC = (material: string, details: string) =>
  `Chất liệu: ${material}.\n${details}\n\nMaterial: ${material}.`;

const products: Array<{
  name: string; category: string; price: number; isNew?: boolean; sizes?: string[]; desc: string;
}> = [
  { name: 'Washed Zip Hoodie / Navy', category: 'outerwears', price: 890000, isNew: true, desc: DESC('Cotton nỉ 400gsm', 'Form boxy, wash bạc màu thủ công, khóa kéo kim loại.') },
  { name: 'Washed Zip Hoodie / Grey', category: 'outerwears', price: 890000, isNew: true, desc: DESC('Cotton nỉ 400gsm', 'Form boxy, wash bạc màu thủ công, khóa kéo kim loại.') },
  { name: 'Work Jacket / Brown', category: 'outerwears', price: 1150000, desc: DESC('Canvas 12oz', 'Túi hộp hai bên, cúc đồng khắc logo.') },
  { name: 'Varsity Bomber / Black', category: 'outerwears', price: 1290000, desc: DESC('Dạ pha len', 'Tay da PU, bo len gân, thêu chữ ở ngực.') },
  { name: 'Nylon Windbreaker / Olive', category: 'outerwears', price: 790000, desc: DESC('Nylon chống nước nhẹ', 'Mũ trùm có dây rút, gấp gọn vào túi.') },

  { name: 'Vintage Graphic Tee / White', category: 'tops', price: 420000, isNew: true, desc: DESC('Cotton 250gsm', 'In lụa hiệu ứng nứt vintage, form oversize.') },
  { name: 'Vintage Graphic Tee / Black', category: 'tops', price: 420000, isNew: true, desc: DESC('Cotton 250gsm', 'In lụa hiệu ứng nứt vintage, form oversize.') },
  { name: 'Basic Logo Tee / Cream', category: 'tops', price: 350000, desc: DESC('Cotton 230gsm', 'Thêu logo nhỏ ở ngực, form regular.') },
  { name: 'Striped Rugby Polo / Navy', category: 'tops', price: 690000, desc: DESC('Cotton dày', 'Cổ bẻ trắng, sọc ngang bản to.') },
  { name: 'Oxford Long Sleeve Shirt / Blue', category: 'tops', price: 590000, desc: DESC('Oxford cotton', 'Cúc cài cổ, túi ngực, form rộng.') },
  { name: 'Heavyweight Sweater / Charcoal', category: 'tops', price: 750000, desc: DESC('Len dệt kim', 'Dệt gân, cổ tròn, vai rớt.') },

  { name: 'Double Layered Denim Pants', category: 'bottom', price: 1230000, isNew: true, desc: DESC('Denim 13oz', 'Phối hai tông denim, cúc khắc logo, patch da sau lưng.') },
  { name: 'Carpenter Pants / Black', category: 'bottom', price: 850000, desc: DESC('Canvas cotton', 'Vòng treo búa, túi hộp, ống suông.') },
  { name: 'Baggy Jeans / Light Wash', category: 'bottom', price: 950000, desc: DESC('Denim 12oz', 'Ống rộng, wash sáng, cạp cao.') },
  { name: 'Nylon Track Shorts / Black', category: 'bottom', price: 450000, desc: DESC('Nylon', 'Lưng thun có dây rút, sọc hai bên.') },
  { name: 'Sweat Shorts / Grey', category: 'bottom', price: 390000, desc: DESC('Cotton nỉ', 'Lưng thun, túi sau, thêu logo.') },

  { name: 'Logo Cap / Black', category: 'accessories', price: 350000, sizes: ['FREE SIZE'], desc: DESC('Cotton twill', 'Thêu logo nổi, khóa chỉnh kim loại.') },
  { name: 'Beanie / Cream', category: 'accessories', price: 320000, isNew: true, sizes: ['FREE SIZE'], desc: DESC('Len acrylic', 'Gập gấu, patch dệt logo.') },
  { name: 'Canvas Tote Bag', category: 'accessories', price: 380000, sizes: ['FREE SIZE'], desc: DESC('Canvas 16oz', 'Quai dài đeo vai, túi nhỏ bên trong.') },
  { name: 'Leather Belt / Brown', category: 'accessories', price: 490000, sizes: ['90', '100', '110'], desc: DESC('Da bò', 'Khóa đồng khắc logo.') },
];

async function main() {
  console.log('🌱 Seeding...');

  // Admin mặc định — đổi mật khẩu sau khi đăng nhập
  await prisma.user.upsert({
    where: { email: 'admin@vacession.vn' },
    update: {},
    create: {
      email: 'admin@vacession.vn',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      firstName: 'Admin',
      role: 'ADMIN',
    },
  });

  const catIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
    catIds[c.slug] = row.id;
  }

  for (const [i, p] of products.entries()) {
    const slug = slugify(p.name);
    const sizes = p.sizes ?? CLOTHING_SIZES;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.desc,
        price: p.price,
        images: writeProductImages(slug, p.name, p.category), // ảnh mẫu SVG, thay bằng ảnh thật qua Admin
        categoryId: catIds[p.category],
        isNew: p.isNew ?? false,
        sortOrder: i,
        soldCount: Math.floor(Math.random() * 100),
        variants: { create: sizes.map((size) => ({ size, stock: size === 'XL' ? 0 : 10 + Math.floor(Math.random() * 20) })) },
      },
    });
  }

  console.log(`✅ Done: ${categories.length} danh mục, ${products.length} sản phẩm, admin: admin@vacession.vn / Admin@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
