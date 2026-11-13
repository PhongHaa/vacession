import { Link } from 'react-router-dom';
import type { ProductSummary, Variant } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/format';
import { PLACEHOLDER_IMAGE } from '@/constants';

export default function ProductCard({ product }: { product: ProductSummary }) {
  const { addItem, openCart } = useCart();
  const soldOut = product.variants.every((v) => v.stock <= 0);
  const [first, second] = product.images;
  const url = `/product/${product.slug}`;
  // "Washed Zip Hoodie / Navy" -> tên + màu
  const [title, ...rest] = product.name.split(' / ');
  const variantLabel = rest.join(' / ');

  const quickAdd = (v: Variant) => {
    addItem({
      variantId: v.id, productId: product.id, slug: product.slug, name: product.name,
      image: first ?? null, size: v.size, price: product.price, maxStock: v.stock,
    }, 1);
    openCart();
  };

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link to={url} aria-label={product.name}>
          <img src={first ?? PLACEHOLDER_IMAGE} alt={product.name} loading="lazy" />
          {second && <img className="product-card__hover" src={second} alt="" loading="lazy" aria-hidden />}
        </Link>
        {soldOut ? <span className="badge badge-dark">Sold out</span> : product.isNew && <span className="badge">New</span>}
        {!soldOut && (
          <div className="quick-add">
            <span className="quick-add__label">Thêm nhanh</span>
            <div className="quick-add__sizes">
              {product.variants.map((v) => (
                <button key={v.id} type="button" disabled={v.stock <= 0} onClick={() => quickAdd(v)}
                  aria-label={`Thêm size ${v.size} vào giỏ`}>
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={url}>{title}</Link>
          {variantLabel && <span className="product-card__variant">{variantLabel}</span>}
        </h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
