import { Link, useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { formatDate, formatPrice } from '@/utils/format';
import { ORDER_STATUS_LABEL, PAYMENT_LABEL } from '@/utils/order';
import type { OrderStatus } from '@/types';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import OrderDetails from '@/components/account/OrderDetails';
import { ArrowLeftIcon } from '@/components/common/Icons';

const FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'];
const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Xác nhận đơn',
  CONFIRMED: 'Bắt đầu giao hàng',
  SHIPPING: 'Đánh dấu hoàn thành',
};

export default function AdminOrderDetailPage() {
  const { id = '' } = useParams();
  const { data: order, loading, error, setData } = useFetch(() => adminService.order(id), [id]);
  const action = useAsyncAction();
  useDocumentTitle(order ? `Đơn ${order.code}` : 'Đơn hàng');

  if (loading) return <Spinner />;
  if (error || !order) return <Alert>{error}</Alert>;

  const step = FLOW.indexOf(order.status);
  const next = step >= 0 && step < FLOW.length - 1 ? FLOW[step + 1] : null;
  const cancelled = order.status === 'CANCELLED';

  const setStatus = async (status: OrderStatus) => {
    if (status === 'CANCELLED' && !confirm('Hủy đơn này? Số lượng sản phẩm sẽ được trả lại vào kho.')) return;
    const updated = await action.run(() => adminService.updateOrderStatus(order.id, status), `Đã chuyển sang "${ORDER_STATUS_LABEL[status]}"`);
    if (updated) setData({ ...order, ...updated });
  };

  return (
    <>
      <Link to="/admin/orders" className="back-link"><ArrowLeftIcon /> Đơn hàng</Link>
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">Đặt lúc {formatDate(order.createdAt)}</p>
          <h1 className="admin-title">Đơn #{order.code} <StatusBadge status={order.status} /></h1>
        </div>
      </header>

      <div className="order-grid">
        <section className="admin-panel">
          <div className="panel-head"><h2>Sản phẩm</h2><span className="panel-meta">{order.items.reduce((n, i) => n + i.quantity, 0)} sản phẩm</span></div>
          <OrderDetails order={order} />
        </section>

        <div className="order-side">
          <section className="admin-panel">
            <div className="panel-head"><h2>Xử lý đơn</h2></div>
            {cancelled ? (
              <p className="panel-empty">Đơn đã hủy. Hàng đã được trả lại vào kho.</p>
            ) : (
              <ol className="stepper">
                {FLOW.map((s, i) => (
                  <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''}>
                    <span className="stepper__dot" />
                    {ORDER_STATUS_LABEL[s]}
                  </li>
                ))}
              </ol>
            )}
            <Alert>{action.error}</Alert>
            <Alert type="success">{action.success}</Alert>
            {!cancelled && (
              <div className="order-actions">
                {next && <Button block loading={action.pending} onClick={() => setStatus(next)}>{NEXT_ACTION[order.status]}</Button>}
                {order.status !== 'COMPLETED' && (
                  <Button block variant="ghost" className="text-danger" disabled={action.pending} onClick={() => setStatus('CANCELLED')}>Hủy đơn</Button>
                )}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-head"><h2>Khách hàng</h2></div>
            <dl className="mini-stats">
              <div><dt>Họ tên</dt><dd>{order.lastName} {order.firstName}</dd></div>
              <div><dt>Điện thoại</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${order.email}`}>{order.email}</a></dd></div>
            </dl>
          </section>

          <section className="admin-panel">
            <div className="panel-head"><h2>Thanh toán</h2></div>
            <dl className="mini-stats">
              <div><dt>Hình thức</dt><dd>{PAYMENT_LABEL[order.paymentMethod]}</dd></div>
              <div><dt>Cần thu</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
            {order.paymentMethod === 'BANK_TRANSFER' && order.status === 'PENDING' && (
              <p className="panel-note">Kiểm tra đã nhận chuyển khoản với nội dung <strong>{order.code}</strong> trước khi xác nhận.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
