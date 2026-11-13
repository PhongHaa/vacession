import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { formatPrice } from '@/utils/format';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { CloseIcon } from '@/components/common/Icons';
import QuantityInput from '@/components/common/QuantityInput';
import Button from '@/components/common/Button';

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, count, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  return (
    <div className={`drawer-root ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="overlay" onClick={closeCart} />
      <aside className="drawer drawer-right" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
        <div className="drawer-header">
          <h2 className="drawer-title">Cart ({count})</h2>
          <button className="icon-btn" aria-label="Đóng giỏ hàng" onClick={closeCart}><CloseIcon /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <Link to="/shop" className="btn btn-primary btn-md" onClick={closeCart} tabIndex={isOpen ? 0 : -1}>
              Return to Shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.variantId} className="cart-item">
                  <Link to={`/product/${item.slug}`} onClick={closeCart} className="cart-item__img" tabIndex={isOpen ? 0 : -1}>
                    <img src={item.image ?? PLACEHOLDER_IMAGE} alt={item.name} />
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/product/${item.slug}`} onClick={closeCart} className="cart-item__name" tabIndex={isOpen ? 0 : -1}>
                      {item.name}
                    </Link>
                    <span className="muted">Size: {item.size}</span>
                    <span>{formatPrice(item.price)}</span>
                    <div className="cart-item__actions">
                      <QuantityInput
                        size="sm"
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) => updateQuantity(item.variantId, q)}
                      />
                      <button className="link-btn" onClick={() => removeItem(item.variantId)} tabIndex={isOpen ? 0 : -1}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Tạm tính</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="muted small">Shipping, taxes, and discounts calculated at checkout.</p>
              <Button block tabIndex={isOpen ? 0 : -1} onClick={() => { closeCart(); navigate('/checkout'); }}>
                Checkout
              </Button>
              <Button block variant="secondary" tabIndex={isOpen ? 0 : -1} onClick={closeCart}>
                Tiếp tục mua sắm
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
