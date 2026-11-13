import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { orderService } from '@/services/order.service';
import { settingsService } from '@/services/catalog.service';
import { formatPrice } from '@/utils/format';
import { PAYMENT_LABEL } from '@/utils/order';
import { PLACEHOLDER_IMAGE } from '@/constants';
import type { PaymentMethod } from '@/types';
import { FormField, TextareaField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function CheckoutPage() {
  useDocumentTitle('Thanh toán');
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useFetch(settingsService.get);
  const { pending, error, run } = useAsyncAction();

  const [form, setForm] = useState({
    lastName: user?.lastName ?? '',
    firstName: user?.firstName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    district: '',
    city: user?.city ?? '',
    note: '',
  });
  const [payment, setPayment] = useState<PaymentMethod>('COD');
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const shippingFee = settings?.shippingFee ?? 0;

  if (items.length === 0 && !pending) {
    return (
      <div className="container section narrow center">
        <h1 className="page-title">Thanh toán</h1>
        <p>Giỏ hàng của bạn đang trống.</p>
        <Link to="/shop" className="btn btn-primary btn-md">Return to Shop</Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const order = await run(() => orderService.create({
      ...form,
      district: form.district || undefined,
      note: form.note || undefined,
      paymentMethod: payment,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    }));
    if (order) {
      navigate(`/order-received/${order.code}?email=${encodeURIComponent(order.email)}`, { replace: true });
      clear();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container section">
      <h1 className="page-title">Thanh toán</h1>
      <Alert>{error}</Alert>

      <form className="checkout-layout" onSubmit={onSubmit}>
        <div className="checkout-form">
          <h2 className="block-title">Thông tin giao hàng</h2>
          {!user && (
            <p className="muted small">
              Đã có tài khoản? <Link to="/my-account" className="link-underline">Đăng nhập</Link> để theo dõi đơn hàng dễ hơn.
            </p>
          )}
          <div className="form-grid">
            <FormField label="Họ" required value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
            <FormField label="Tên" required value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
            <FormField label="Số điện thoại" required type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            <FormField label="Email" required type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            <FormField label="Địa chỉ" required className="span-2" placeholder="Số nhà, tên đường, phường/xã"
              value={form.address} onChange={set('address')} autoComplete="street-address" />
            <FormField label="Quận / Huyện" value={form.district} onChange={set('district')} />
            <FormField label="Tỉnh / Thành phố" required value={form.city} onChange={set('city')} autoComplete="address-level1" />
            <TextareaField label="Ghi chú đơn hàng" className="span-2" rows={3} placeholder="Ví dụ: giao giờ hành chính"
              value={form.note} onChange={set('note')} />
          </div>

          <h2 className="block-title">Phương thức thanh toán</h2>
          <div className="payment-options">
            {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
              <label key={m} className={`payment-option ${payment === m ? 'active' : ''}`}>
                <input type="radio" name="payment" value={m} checked={payment === m} onChange={() => setPayment(m)} />
                <span>
                  <strong>{PAYMENT_LABEL[m]}</strong>
                  <small className="muted">
                    {m === 'COD' ? 'Thanh toán bằng tiền mặt khi nhận hàng.' : 'Thông tin chuyển khoản sẽ hiển thị sau khi đặt hàng.'}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <aside className="order-summary">
          <h2 className="block-title">Đơn hàng ({items.length})</h2>
          <ul className="summary-items">
            {items.map((i) => (
              <li key={i.variantId}>
                <div className="summary-thumb">
                  <img src={i.image ?? PLACEHOLDER_IMAGE} alt="" />
                  <span className="summary-qty">{i.quantity}</span>
                </div>
                <div className="summary-name">
                  {i.name}
                  <span className="muted small">Size: {i.size}</span>
                </div>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <div><dt>Tạm tính</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Phí vận chuyển</dt><dd>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</dd></div>
            <div className="totals-grand"><dt>Tổng cộng</dt><dd>{formatPrice(subtotal + shippingFee)}</dd></div>
          </dl>
          <Button type="submit" block loading={pending}>Đặt hàng</Button>
          <p className="muted small">
            Bằng việc đặt hàng, bạn đồng ý với <Link to="/terms" className="link-underline">điều khoản</Link> và{' '}
            <Link to="/returns" className="link-underline">chính sách đổi trả</Link>.
          </p>
        </aside>
      </form>
    </div>
  );
}
