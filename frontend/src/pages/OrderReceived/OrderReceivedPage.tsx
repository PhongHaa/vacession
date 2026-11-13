import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderService } from '@/services/order.service';
import { formatDate, formatPrice } from '@/utils/format';
import { PAYMENT_LABEL } from '@/utils/order';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import OrderDetails from '@/components/account/OrderDetails';

export default function OrderReceivedPage() {
  useDocumentTitle('Đặt hàng thành công');
  const { code = '' } = useParams();
  const [params] = useSearchParams();
  const { data: order, loading, error } = useFetch(() => orderService.get(code, params.get('email') ?? undefined), [code]);

  if (loading) return <Spinner />;
  if (error || !order) {
    return (
      <div className="container section narrow">
        <Alert>{error ?? 'Không tìm thấy đơn hàng'}</Alert>
        <Link to="/shop" className="btn btn-primary btn-md">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container section narrow">
      <h1 className="page-title">Cảm ơn bạn. Đơn hàng đã được nhận!</h1>

      <ul className="order-overview">
        <li><span>Mã đơn hàng</span><strong>{order.code}</strong></li>
        <li><span>Ngày</span><strong>{formatDate(order.createdAt)}</strong></li>
        <li><span>Tổng cộng</span><strong>{formatPrice(order.total)}</strong></li>
        <li><span>Thanh toán</span><strong>{PAYMENT_LABEL[order.paymentMethod]}</strong></li>
      </ul>

      {order.paymentMethod === 'BANK_TRANSFER' && order.bank && (
        <div className="bank-box">
          <h2 className="block-title">Thông tin chuyển khoản</h2>
          <dl>
            <div><dt>Ngân hàng</dt><dd>{order.bank.name}</dd></div>
            <div><dt>Số tài khoản</dt><dd><strong>{order.bank.accountNumber}</strong></dd></div>
            <div><dt>Chủ tài khoản</dt><dd>{order.bank.accountName}</dd></div>
            <div><dt>Số tiền</dt><dd><strong>{formatPrice(order.total)}</strong></dd></div>
            <div><dt>Nội dung</dt><dd><strong>{order.code}</strong></dd></div>
          </dl>
          <p className="muted small">Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.</p>
        </div>
      )}

      <h2 className="block-title">Chi tiết đơn hàng</h2>
      <OrderDetails order={order} />

      <div className="actions-row">
        <Link to="/shop" className="btn btn-primary btn-md">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
