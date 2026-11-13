import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin.service';
import { formatDate, formatDay, formatPrice } from '@/utils/format';
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/utils/order';
import { PLACEHOLDER_IMAGE } from '@/constants';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import StatusBadge from '@/components/common/StatusBadge';
import RevenueChart from '@/components/admin/RevenueChart';
import { ArrowRightIcon } from '@/components/common/Icons';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin');
  const { user } = useAuth();
  const { data, loading, error } = useFetch(adminService.stats);

  if (loading && !data) return <Spinner />;
  if (error || !data) return <Alert>{error}</Alert>;

  const today = data.daily[data.daily.length - 1];
  const delta = data.prevPeriodRevenue > 0
    ? Math.round(((data.periodRevenue - data.prevPeriodRevenue) / data.prevPeriodRevenue) * 100)
    : null;
  const periodOrders = data.daily.reduce((n, d) => n + d.orders, 0);
  const maxStatus = Math.max(1, ...Object.values(data.statusCounts));

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">{formatDay(new Date())}</p>
          <h1 className="admin-title">Xin chào, {user?.firstName || 'Admin'}</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary btn-md">+ Thêm sản phẩm</Link>
      </header>

      <div className="kpi-grid">
        <div className="kpi">
          <span className="kpi__label">Doanh thu hôm nay</span>
          <strong className="kpi__value">{formatPrice(today.revenue)}</strong>
          <span className="kpi__note">{today.orders} đơn hàng</span>
        </div>
        <div className="kpi">
          <span className="kpi__label">Doanh thu 14 ngày</span>
          <strong className="kpi__value">{formatPrice(data.periodRevenue)}</strong>
          <span className="kpi__note">
            {delta === null ? `${periodOrders} đơn hàng` : `${delta >= 0 ? '+' : '−'}${Math.abs(delta)}% so với 14 ngày trước`}
          </span>
        </div>
        <Link to="/admin/orders?status=PENDING" className={`kpi kpi--link ${data.pendingOrders > 0 ? 'kpi--alert' : ''}`}>
          <span className="kpi__label">Đơn chờ xác nhận</span>
          <strong className="kpi__value">{data.pendingOrders}</strong>
          <span className="kpi__note">{data.pendingOrders > 0 ? <>Cần xử lý <ArrowRightIcon className="icon-inline" width={13} height={13} /></> : 'Không có đơn tồn'}</span>
        </Link>
        <Link to="/admin/products?stock=low" className="kpi kpi--link">
          <span className="kpi__label">Size sắp hết hàng</span>
          <strong className="kpi__value">{data.lowStockCount}</strong>
          <span className="kpi__note">Còn từ 3 sản phẩm trở xuống <ArrowRightIcon className="icon-inline" width={13} height={13} /></span>
        </Link>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
        <section className="admin-panel">
          <div className="panel-head">
            <h2>Doanh thu theo ngày</h2>
            <span className="panel-meta">14 ngày gần nhất · không tính đơn hủy</span>
          </div>
          <RevenueChart data={data.daily} />
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <h2>Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="panel-link">Xem tất cả <ArrowRightIcon className="icon-inline" width={13} height={13} /></Link>
          </div>
          {data.recentOrders.length === 0 ? <p className="panel-empty">Chưa có đơn hàng nào.</p> : (
            <div className="table-scroll">
              <table className="table table-responsive">
                <thead><tr><th>Mã</th><th>Khách hàng</th><th>Thời gian</th><th>Trạng thái</th><th className="num">Tổng</th></tr></thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td data-label="Mã"><Link to={`/admin/orders/${o.id}`} className="code-link">{o.code}</Link></td>
                      <td data-label="Khách hàng">{o.lastName} {o.firstName}</td>
                      <td data-label="Thời gian">{formatDate(o.createdAt)}</td>
                      <td data-label="Trạng thái"><StatusBadge status={o.status} /></td>
                      <td data-label="Tổng" className="num">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <h2>Sắp hết hàng</h2>
            <Link to="/admin/products?stock=low" className="panel-link">Xem tất cả <ArrowRightIcon className="icon-inline" width={13} height={13} /></Link>
          </div>
          {data.lowStock.length === 0 ? <p className="panel-empty">Tất cả sản phẩm đều còn đủ hàng.</p> : (
            <ul className="rank-list">
              {data.lowStock.map((v) => (
                <li key={v.variantId}>
                  <img src={v.image ?? PLACEHOLDER_IMAGE} alt="" />
                  <Link to={`/admin/products/${v.productId}`}>{v.name} <span className="muted">· {v.size}</span></Link>
                  {v.stock === 0 ? <span className="pill pill--out">Hết hàng</span> : <span className="pill">Còn {v.stock}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
        </div>
        <div className="dash-col">
        <section className="admin-panel">
          <div className="panel-head">
            <h2>Đơn hàng theo trạng thái</h2>
            <span className="panel-meta">{data.totalOrders} đơn</span>
          </div>
          <ul className="status-bars">
            {ORDER_STATUSES.map((s) => (
              <li key={s}>
                <Link to={`/admin/orders?status=${s}`}>
                  <span className="status-bars__label">{ORDER_STATUS_LABEL[s]}</span>
                  <span className="status-bars__track"><span style={{ width: `${(data.statusCounts[s] / maxStatus) * 100}%` }} /></span>
                  <span className="status-bars__value">{data.statusCounts[s]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <h2>Bán chạy nhất</h2>
            <span className="panel-meta">theo số lượng đã bán</span>
          </div>
          {data.topProducts.length === 0 ? <p className="panel-empty">Chưa có dữ liệu bán hàng.</p> : (
            <ol className="rank-list">
              {data.topProducts.map((p, i) => (
                <li key={`${p.productId}-${p.name}`}>
                  <span className="rank-list__no">{i + 1}</span>
                  <img src={p.image ?? PLACEHOLDER_IMAGE} alt="" />
                  {p.productId ? <Link to={`/admin/products/${p.productId}`}>{p.name}</Link> : <span>{p.name}</span>}
                  <strong>{p.quantity}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="admin-panel">
          <div className="panel-head"><h2>Cửa hàng</h2></div>
          <dl className="mini-stats">
            <div><dt>Tổng doanh thu</dt><dd>{formatPrice(data.revenue)}</dd></div>
            <div><dt>Sản phẩm đang bán</dt><dd><Link to="/admin/products">{data.totalProducts}</Link></dd></div>
            <div><dt>Khách hàng có tài khoản</dt><dd><Link to="/admin/customers">{data.totalCustomers}</Link></dd></div>
            <div><dt>Tin nhắn chưa đọc</dt><dd><Link to="/admin/messages">{data.unreadMessages}</Link></dd></div>
          </dl>
        </section>
        </div>
      </div>
    </>
  );
}
