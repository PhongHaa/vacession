import { Link, useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderService } from '@/services/order.service';
import { formatDate } from '@/utils/format';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import OrderDetails from '@/components/account/OrderDetails';
import { ArrowLeftIcon } from '@/components/common/Icons';

export default function OrderDetailPage() {
  const { code = '' } = useParams();
  useDocumentTitle(`Đơn hàng ${code}`);
  const { data: order, loading, error, setData } = useFetch(() => orderService.get(code), [code]);
  const cancel = useAsyncAction();

  if (loading) return <Spinner />;
  if (error || !order) return <Alert>{error ?? 'Không tìm thấy đơn hàng'}</Alert>;

  const onCancel = async () => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
    const updated = await cancel.run(() => orderService.cancel(order.code), 'Đã hủy đơn hàng');
    if (updated) setData({ ...order, ...updated });
  };

  return (
    <div>
      <Link to="/my-account/orders" className="back-link"><ArrowLeftIcon /> Tất cả đơn hàng</Link>
      <h1 className="page-title order-title">Đơn #{order.code} <StatusBadge status={order.status} /></h1>
      <p className="order-heading muted">Đặt lúc {formatDate(order.createdAt)}</p>
      <Alert>{cancel.error}</Alert>
      <Alert type="success">{cancel.success}</Alert>
      <OrderDetails order={order} />
      {order.status === 'PENDING' && (
        <Button variant="danger" onClick={onCancel} loading={cancel.pending}>Hủy đơn hàng</Button>
      )}
    </div>
  );
}
