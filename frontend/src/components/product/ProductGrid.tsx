import type { ProductSummary } from '@/types';
import ProductCard from './ProductCard';
import Reveal from '@/components/common/Reveal';

/** dense: trang danh sách dùng thêm cột trên màn hình rất rộng để thẻ sản phẩm không quá to */
export default function ProductGrid({ products, dense = false }: { products: ProductSummary[]; dense?: boolean }) {
  return (
    <div className={`product-grid ${dense ? 'product-grid--dense' : ''}`}>
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 70}>
          <ProductCard product={p} />
        </Reveal>
      ))}
    </div>
  );
}
