import { Link, useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { formatDate, formatPrice } from '@/utils/format';
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/utils/order';
import type { OrderStatus } from '@/types';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import Pagination from '@/components/common/Pagination';
import AdminToolbar from '@/components/admin/AdminToolbar';
import StatusBadge from '@/components/common/StatusBadge';

export default function AdminOrdersPage() {
  useDocumentTitle('Đơn hàng');
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as OrderStatus | '';
  const q = params.get('q') ?? '';
  const page = Number(params.get('page')) || 1;

  const { data, loading, error } = useFetch(() => adminService.orders({ status, q, page }), [status, q, page]);
  const { data: stats } = useFetch(adminService.stats);

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const countOf = (s: OrderStatus | '') => (stats ? (s ? stats.statusCounts[s] : stats.totalOrders) : null);

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">{stats ? `${stats.totalOrders} đơn · ${stats.pendingOrders} chờ xác nhận` : ' '}</p>
          <h1 className="admin-title">Đơn hàng</h1>
        </div>
      </header>

      <div className="tabs" role="tablist">
        {(['', ...ORDER_STATUSES] as const).map((s) => (
          <button key={s || 'all'} role="tab" aria-selected={status === s} className={status === s ? 'active' : ''}
            onClick={() => update({ status: s })}>
            {s ? ORDER_STATUS_LABEL[s] : 'Tất cả'}
            {countOf(s) !== null && <span className="tabs__count">{countOf(s)}</span>}
          </button>
        ))}
      </div>

      <AdminToolbar placeholder="Tìm mã đơn, email, số điện thoại, tên khách…" />

      {error && <Alert>{error}</Alert>}
      <section className="admin-panel admin-panel--flush">
        {loading && !data ? <Spinner /> : data && data.items.length === 0 ? <p className="panel-empty">Không có đơn hàng nào.</p> : (
          <div className={`table-scroll ${loading ? 'is-loading' : ''}`}>
            <table className="table table-responsive">
              <thead>
                <tr><th>Mã</th><th>Khách hàng</th><th>Thời gian</th><th className="num">SP</th><th>Thanh toán</th><th>Trạng thái</th><th className="num">Tổng</th></tr>
              </thead>
              <tbody>
                {data?.items.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Mã"><Link to={`/admin/orders/${o.id}`} className="code-link">{o.code}</Link></td>
                    <td data-label="Khách hàng"><div><strong>{o.lastName} {o.firstName}</strong><div className="muted small">{o.phone}</div></div></td>
                    <td data-label="Thời gian">{formatDate(o.createdAt)}</td>
                    <td data-label="SP" className="num">{o._count.items}</td>
                    <td data-label="Thanh toán">{o.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</td>
                    <td data-label="Trạng thái"><StatusBadge status={o.status} /></td>
                    <td data-label="Tổng" className="num">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => update({ page: String(p) })} />}
    </>
  );
}
