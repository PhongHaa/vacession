import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { categoryService } from '@/services/catalog.service';
import { formatPrice } from '@/utils/format';
import { PLACEHOLDER_IMAGE } from '@/constants';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import AdminToolbar from '@/components/admin/AdminToolbar';
import Pagination from '@/components/common/Pagination';

export default function AdminProductsPage() {
  useDocumentTitle('Sản phẩm');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Number(params.get('page')) || 1;
  const [actionError, setActionError] = useState('');

  const category = params.get('category') ?? '';
  const stock = params.get('stock') ?? '';
  const { data: categories } = useFetch(categoryService.list);
  const { data, loading, error, refetch } = useFetch(() => adminService.products({ q, category, stock, page }), [q, category, stock, page]);

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };


  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"? Đơn hàng cũ vẫn giữ thông tin sản phẩm.`)) return;
    try {
      await adminService.deleteProduct(id);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="admin-eyebrow">{data ? `${data.total} sản phẩm` : ' '}</p>
          <h1 className="admin-title">Sản phẩm</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary btn-md">+ Thêm sản phẩm</Link>
      </div>

      <AdminToolbar
        placeholder="Tìm theo tên sản phẩm…"
        filters={[
          { key: 'category', label: 'Lọc theo danh mục', allLabel: 'Tất cả danh mục', options: (categories ?? []).map((c) => ({ value: c.id, label: c.name })) },
          { key: 'stock', label: 'Lọc theo tồn kho', allLabel: 'Mọi tồn kho', options: [{ value: 'low', label: 'Có size sắp hết (còn 3 trở xuống)' }, { value: 'out', label: 'Hết sạch hàng' }] },
        ]}
      />

      <Alert>{error || actionError}</Alert>
      <section className="admin-panel admin-panel--flush">
      {loading && !data ? <Spinner /> : data && data.items.length === 0 ? <p className="panel-empty">Không có sản phẩm phù hợp.</p> : (
        <div className={`table-scroll ${loading ? 'is-loading' : ''}`}>
          <table className="table table-responsive">
            <thead>
              <tr><th /><th>Tên</th><th>Danh mục</th><th className="num">Giá</th><th className="num">Tồn kho</th><th>Trạng thái</th><th /></tr>
            </thead>
            <tbody>
              {data?.items.map((p) => {
                const stock = p.variants.reduce((n, v) => n + v.stock, 0);
                return (
                  <tr key={p.id}>
                    <td><img className="thumb" src={p.images[0] ?? PLACEHOLDER_IMAGE} alt="" /></td>
                    <td data-label="Tên">
                      <div>
                        <Link to={`/admin/products/${p.id}`} className="link-underline">{p.name}</Link>
                        <div className="size-chips">
                          {p.variants.map((v) => (
                            <span key={v.id} className={v.stock === 0 ? 'is-out' : v.stock <= 3 ? 'is-low' : ''}>{v.size} <b>{v.stock}</b></span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td data-label="Danh mục">{p.category?.name}</td>
                    <td data-label="Giá" className="num">{formatPrice(p.price)}</td>
                    <td data-label="Tồn kho" className="num">{stock === 0 ? <span className="text-danger">Hết</span> : stock}</td>
                    <td data-label="Trạng thái">
                      <div>
                        {p.isActive ? <span className="status status-completed">Đang bán</span> : <span className="status status-cancelled">Ẩn</span>}
                        {p.isNew && <span className="status status-confirmed">New</span>}
                      </div>
                    </td>
                    <td className="row-actions">
                      <Link to={`/admin/products/${p.id}`} className="btn btn-secondary btn-sm">Sửa</Link>
                      <button className="btn btn-ghost btn-sm text-danger" onClick={() => onDelete(p.id, p.name)}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </section>
      {data && (
        <Pagination page={data.page} totalPages={data.totalPages}
          onChange={(p) => update({ page: String(p) })} />
      )}
    </>
  );
}
