import { useState, type FormEvent } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { categoryService } from '@/services/catalog.service';
import type { Category } from '@/types';
import { FormField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import Spinner from '@/components/common/Spinner';

const EMPTY = { name: '', slug: '', sortOrder: 0 };

export default function AdminCategoriesPage() {
  useDocumentTitle('Danh mục');
  const { data, loading, refetch } = useFetch(() => { categoryService.invalidate(); return categoryService.list(); });
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const action = useAsyncAction();

  const startEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, sortOrder: c.sortOrder }); };
  const reset = () => { setEditing(null); setForm(EMPTY); };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || undefined };
    const ok = await action.run(() => (editing ? adminService.updateCategory(editing.id, payload) : adminService.createCategory(payload)),
      editing ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
    if (ok) { reset(); refetch(); }
  };

  const onDelete = async (c: Category) => {
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    const ok = await action.run(() => adminService.deleteCategory(c.id).then(() => true), 'Đã xóa danh mục');
    if (ok) refetch();
  };

  return (
    <>
      <h1 className="admin-title">Danh mục</h1>
      <Alert>{action.error}</Alert>
      <Alert type="success">{action.success}</Alert>

      <div className="admin-split">
        <form className="admin-panel stack" onSubmit={onSubmit}>
          <h2 className="block-title">{editing ? `Sửa: ${editing.name}` : 'Thêm danh mục'}</h2>
          <FormField label="Tên" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FormField label="Slug" placeholder="Để trống để tự tạo" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <FormField label="Thứ tự" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <div className="row-actions">
            <Button type="submit" loading={action.pending}>{editing ? 'Lưu' : 'Thêm'}</Button>
            {editing && <Button type="button" variant="ghost" onClick={reset}>Hủy</Button>}
          </div>
        </form>

        {loading && !data ? <Spinner /> : (
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Tên</th><th>Slug</th><th className="num">SP</th><th className="num">Thứ tự</th><th /></tr></thead>
              <tbody>
                {data?.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td className="muted">{c.slug}</td>
                    <td className="num">{c.productCount}</td>
                    <td className="num">{c.sortOrder}</td>
                    <td className="row-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>Sửa</button>
                      <button className="btn btn-ghost btn-sm text-danger" onClick={() => onDelete(c)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
