import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderService } from '@/services/order.service';
import { formatDate, formatPrice, fullName } from '@/utils/format';
import type { OrderStatus } from '@/types';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowRightIcon } from '@/components/common/Icons';

const IN_PROGRESS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING'];

export default function DashboardPage() {
  useDocumentTitle('Tài khoản');
  const { user } = useAuth();
  const { data: orders, loading, error } = useFetch(orderService.myOrders);
  if (!user) return null;

  const active = orders?.filter((o) => IN_PROGRESS.includes(o.status)) ?? [];
  const spent = orders?.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0) ?? 0;
  const recent = orders?.slice(0, 3) ?? [];
  const address = [user.address, user.city].filter(Boolean).join(', ');
  const hasShipping = !!(user.phone && user.address && user.city);

  return (
    <div className="dash">
      <h1 className="page-title">Xin chào, <em>{user.firstName || fullName(user) || user.email.split('@')[0]}.</em></h1>

      <ul className="facts">
        <li className="fact"><strong>{orders ? orders.length : '–'}</strong><span>Đơn hàng đã đặt</span></li>
        <li className="fact"><strong>{orders ? active.length : '–'}</strong><span>Đơn đang xử lý</span></li>
        <li className="fact"><strong>{orders ? formatPrice(spent) : '–'}</strong><span>Tổng chi tiêu (không tính đơn hủy)</span></li>
      </ul>

      <section>
        <div className="dash-head">
          <span className="label">Đơn hàng gần đây</span>
          {recent.length > 0 && <Link to="/my-account/orders" className="arrow-link">Xem tất cả <ArrowRightIcon /></Link>}
        </div>
        {error && <Alert>{error}</Alert>}
        {loading && !orders ? <Spinner /> : recent.length === 0 ? (
          <div className="dash-empty">
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link to="/shop" className="btn btn-primary btn-md">Mua sắm ngay <ArrowRightIcon /></Link>
          </div>
        ) : (
          <ul className="order-list">
            {recent.map((o) => (
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
      </section>

      <section>
        <div className="dash-head">
          <span className="label">Thông tin giao hàng</span>
          <Link to="/my-account/edit-account" className="arrow-link">{hasShipping ? 'Chỉnh sửa' : 'Bổ sung'} <ArrowRightIcon /></Link>
        </div>
        {!hasShipping && (
          <p className="dash-note">Thêm số điện thoại và địa chỉ để lần thanh toán sau được điền sẵn.</p>
        )}
        <dl className="info-list">
          <div><dt>Họ tên</dt><dd>{fullName(user) || <span className="muted">Chưa có</span>}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Điện thoại</dt><dd>{user.phone || <span className="muted">Chưa có</span>}</dd></div>
          <div><dt>Địa chỉ</dt><dd>{address || <span className="muted">Chưa có</span>}</dd></div>
        </dl>
      </section>

      {user.role === 'ADMIN' && (
        <Link to="/admin" className="dash-admin">
          <span>
            <span className="label">Dành cho quản trị viên</span>
            <strong>Quản lý đơn hàng, sản phẩm và danh mục</strong>
          </span>
          <ArrowRightIcon />
        </Link>
      )}
    </div>
  );
}
