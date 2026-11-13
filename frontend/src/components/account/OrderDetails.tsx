import { Link } from 'react-router-dom';
import type { Order } from '@/types';
import { formatPrice } from '@/utils/format';
import { PAYMENT_LABEL } from '@/utils/order';
import { PLACEHOLDER_IMAGE } from '@/constants';

/** Bảng sản phẩm + tổng tiền + địa chỉ giao hàng của 1 đơn (dùng chung cho khách & admin) */
export default function OrderDetails({ order }: { order: Order }) {
  return (
    <>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr><th>Sản phẩm</th><th className="num">SL</th><th className="num">Thành tiền</th></tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id}>
                <td>
                  <div className="order-line">
                    <img src={it.image ?? PLACEHOLDER_IMAGE} alt="" />
                    <div>
                      {it.productSlug ? <Link to={`/product/${it.productSlug}`}>{it.productName}</Link> : it.productName}
                      <div className="muted small">Size: {it.size} · {formatPrice(it.price)}</div>
                    </div>
                  </div>
                </td>
                <td className="num">{it.quantity}</td>
                <td className="num">{formatPrice(it.price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2}>Tạm tính</td><td className="num">{formatPrice(order.subtotal)}</td></tr>
            <tr><td colSpan={2}>Phí vận chuyển</td><td className="num">{order.shippingFee ? formatPrice(order.shippingFee) : 'Miễn phí'}</td></tr>
            <tr><td colSpan={2}>Thanh toán</td><td className="num">{PAYMENT_LABEL[order.paymentMethod]}</td></tr>
            <tr className="totals-grand"><td colSpan={2}>Tổng cộng</td><td className="num">{formatPrice(order.total)}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="address-box">
        <h3 className="block-title">Địa chỉ giao hàng</h3>
        <p>
          {order.lastName} {order.firstName}<br />
          {order.address}{order.district ? `, ${order.district}` : ''}, {order.city}<br />
          {order.phone}<br />
          {order.email}
        </p>
        {order.note && <p className="muted">Ghi chú: {order.note}</p>}
      </div>
    </>
  );
}
