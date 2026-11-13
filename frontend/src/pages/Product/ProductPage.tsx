import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { productService } from '@/services/catalog.service';
import { useCart } from '@/contexts/CartContext';
import type { ProductDetail, Variant } from '@/types';
import { formatPrice } from '@/utils/format';
import ProductGallery from '@/components/product/ProductGallery';
import ProductGrid from '@/components/product/ProductGrid';
import SizeChart from '@/components/product/SizeChart';
import QuantityInput from '@/components/common/QuantityInput';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { ChevronDownIcon } from '@/components/common/Icons';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const { data, loading, error } = useFetch(() => productService.get(slug), [slug]);

  if (loading && !data) return <Spinner />;
  if (error || !data) return <NotFoundPage message={error ?? undefined} />;
  // key -> reset size/số lượng khi chuyển sang sản phẩm khác
  return <ProductView key={data.id} product={data} />;
}

function ProductView({ product }: { product: ProductDetail }) {
  useDocumentTitle(product.name);
  const { addItem, openCart, items } = useCart();
  const [selected, setSelected] = useState<Variant | null>(
    product.variants.length === 1 && product.variants[0].stock > 0 ? product.variants[0] : null,
  );
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const soldOut = product.variants.every((v) => v.stock <= 0);
  const inCart = selected ? items.find((i) => i.variantId === selected.id)?.quantity ?? 0 : 0;
  const available = selected ? selected.stock - inCart : 0;

  const handleAdd = () => {
    if (!selected) return setError('Vui lòng chọn size');
    if (available <= 0) return setError('Bạn đã thêm tối đa số lượng còn trong kho');
    addItem({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? null,
      size: selected.size,
      price: product.price,
      maxStock: selected.stock,
    }, Math.min(qty, available));
    setQty(1);
    openCart();
  };

  return (
    <div className="container section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link> / <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
      </nav>

      <div className="product-layout">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">{formatPrice(product.price)}</p>

          <fieldset className="size-picker">
            <legend>Size{selected ? `: ${selected.size}` : ''}</legend>
            <div className="size-options">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`size-option ${selected?.id === v.id ? 'active' : ''}`}
                  disabled={v.stock <= 0}
                  aria-pressed={selected?.id === v.id}
                  onClick={() => { setSelected(v); setQty(1); setError(''); }}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {selected && selected.stock <= 5 && <p className="muted small">Chỉ còn {selected.stock} sản phẩm</p>}
          </fieldset>

          <div className="buy-row">
            <QuantityInput value={qty} max={Math.max(1, available)} onChange={setQty} />
            <Button className="buy-btn" onClick={handleAdd} disabled={soldOut}>
              {soldOut ? 'Hết hàng' : selected ? 'Thêm vào giỏ' : 'Chọn tùy chọn'}
            </Button>
          </div>
          {error && <p className="field-error" role="alert">{error}</p>}

          <div className="accordion">
            <details open>
              <summary>Descriptions <ChevronDownIcon width={16} height={16} /></summary>
              <div className="accordion__body pre-line">{product.description || 'Đang cập nhật.'}</div>
            </details>
            <details>
              <summary>Size Chart <ChevronDownIcon width={16} height={16} /></summary>
              <div className="accordion__body"><SizeChart image={product.sizeChart} /></div>
            </details>
            <details>
              <summary>Shipping Information <ChevronDownIcon width={16} height={16} /></summary>
              <div className="accordion__body">
                <ul className="plain-list">
                  <li>Nội thành TP.HCM: 1 – 2 ngày / HCMC urban: 1 – 2 days</li>
                  <li>Ngoại thành &amp; tỉnh: 2 – 4 ngày tùy khu vực / Suburban &amp; provinces: 2 – 4 days</li>
                  <li>Được kiểm tra hàng trước khi thanh toán (COD).</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>

      {product.related.length > 0 && (
        <section className="section">
          <h2 className="section-title">You may also like</h2>
          <ProductGrid products={product.related} />
        </section>
      )}
    </div>
  );
}
