import { useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { formatDay, formatPrice, fullName } from '@/utils/format';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import AdminToolbar from '@/components/admin/AdminToolbar';
import Pagination from '@/components/common/Pagination';

export default function AdminCustomersPage() {
  useDocumentTitle('Khách hàng');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Number(params.get('page')) || 1;
  const { data, loading, error } = useFetch(() => adminService.customers({ q, page }), [q, page]);


  return (
    <>
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">{data ? `${data.total} tài khoản` : ' '}</p>
          <h1 className="admin-title">Khách hàng</h1>
        </div>
      </header>

      <AdminToolbar placeholder="Tìm tên, email, số điện thoại…" />

      {error && <Alert>{error}</Alert>}
      <section className="admin-panel admin-panel--flush">
        {loading && !data ? <Spinner /> : data && data.items.length === 0 ? (
          <p className="panel-empty">{q ? 'Không tìm thấy khách hàng phù hợp.' : 'Chưa có khách hàng nào đăng ký tài khoản.'}</p>
        ) : (
          <div className={`table-scroll ${loading ? 'is-loading' : ''}`}>
            <table className="table table-responsive">
              <thead>
                <tr><th>Khách hàng</th><th>Điện thoại</th><th>Khu vực</th><th className="num">Số đơn</th><th className="num">Đã chi</th><th>Đơn gần nhất</th><th>Ngày đăng ký</th></tr>
              </thead>
              <tbody>
                {data?.items.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Khách hàng">
                      <div>
                        <strong>{fullName(c) || '—'}</strong>
                        <div className="muted small"><a href={`mailto:${c.email}`}>{c.email}</a></div>
                      </div>
                    </td>
                    <td data-label="Điện thoại">{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : <span className="muted">—</span>}</td>
                    <td data-label="Khu vực">{c.city || <span className="muted">—</span>}</td>
                    <td data-label="Số đơn" className="num">{c.orderCount}</td>
                    <td data-label="Đã chi" className="num">{formatPrice(c.spent)}</td>
                    <td data-label="Đơn gần nhất">{c.lastOrderAt ? formatDay(c.lastOrderAt) : <span className="muted">Chưa mua</span>}</td>
                    <td data-label="Ngày đăng ký">{formatDay(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => setParams({ ...(q && { q }), page: String(p) })} />}
    </>
  );
}
