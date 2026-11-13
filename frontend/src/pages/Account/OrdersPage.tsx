import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderService } from '@/services/order.service';
import { formatDate, formatPrice } from '@/utils/format';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowRightIcon } from '@/components/common/Icons';

export default function OrdersPage() {
  useDocumentTitle('Đơn hàng của tôi');
  const { data: orders, loading, error } = useFetch(orderService.myOrders);

  return (
    <>
      <h1 className="page-title">Đơn hàng{orders && orders.length > 0 && <sup>({orders.length})</sup>}</h1>
      {error && <Alert>{error}</Alert>}
      {loading && !orders ? <Spinner /> : !orders?.length ? (
        <div className="dash-head-less dash-empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/shop" className="btn btn-primary btn-md">Mua sắm ngay <ArrowRightIcon /></Link>
        </div>
      ) : (
        <ul className="order-list order-list--ruled">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/my-account/orders/${o.code}`} className="order-row">
                <strong className="order-row__code">#{o.code}</strong>
                <span className="order-row__date muted">
                  {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} sản phẩm
                </span>
                <span className="order-row__status"><StatusBadge status={o.status} /></span>
                <span className="order-row__total">{formatPrice(o.total)}</span>
                <ArrowRightIcon className="order-row__arrow" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
