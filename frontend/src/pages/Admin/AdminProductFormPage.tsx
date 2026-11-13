import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { categoryService } from '@/services/catalog.service';
import type { ProductInput } from '@/types';
import { FormField, TextareaField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import Spinner from '@/components/common/Spinner';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '@/components/common/Icons';

const EMPTY: ProductInput = {
  name: '', slug: '', description: '', price: 0, images: [], sizeChart: null, categoryId: '',
  isActive: true, isNew: true, sortOrder: 0, variants: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }],
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  useDocumentTitle(isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm');

  const { data: categories } = useFetch(categoryService.list);
  const existing = useFetch(() => (id ? adminService.product(id) : Promise.resolve(null)), [id]);
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [imageUrl, setImageUrl] = useState('');
  const save = useAsyncAction();
  const upload = useAsyncAction();

  useEffect(() => {
    const p = existing.data;
    if (p) {
      setForm({
        name: p.name, slug: p.slug, description: p.description, price: p.price, images: p.images,
        sizeChart: p.sizeChart, categoryId: p.categoryId, isActive: p.isActive, isNew: p.isNew,
        sortOrder: p.sortOrder, variants: p.variants.map(({ size, stock }) => ({ size, stock })),
      });
    }
  }, [existing.data]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onUpload = async (files: FileList | null, target: 'images' | 'sizeChart') => {
    if (!files?.length) return;
    const res = await upload.run(() => adminService.upload(files));
    if (!res) return;
    if (target === 'images') set('images', [...form.images, ...res.urls].slice(0, 10));
    else set('sizeChart', res.urls[0]);
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set('images', next);
  };

  const setVariant = (i: number, patch: Partial<{ size: string; stock: number }>) =>
    set('variants', form.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, variants: form.variants.filter((v) => v.size.trim()) };
    const saved = await save.run(() => (id ? adminService.updateProduct(id, payload) : adminService.createProduct(payload)));
    if (saved) navigate('/admin/products');
  };

  if (isEdit && existing.loading) return <Spinner />;
  if (isEdit && existing.error) return <Alert>{existing.error}</Alert>;

  return (
    <>
      <Link to="/admin/products" className="back-link"><ArrowLeftIcon /> Sản phẩm</Link>
      <h1 className="admin-title">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
      <Alert>{save.error || upload.error}</Alert>

      <form className="admin-form" onSubmit={onSubmit}>
        <section className="admin-panel stack">
          <FormField label="Tên sản phẩm" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          <FormField label="Slug (URL)" value={form.slug} placeholder="Để trống để tự tạo từ tên"
            onChange={(e) => set('slug', e.target.value)} />
          <div className="form-grid">
            <FormField label="Giá (VND)" type="number" min={0} step={1000} required value={form.price}
              onChange={(e) => set('price', Number(e.target.value))} />
            <div className="field">
              <label htmlFor="category">Danh mục <span className="req">*</span></label>
              <select id="category" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">— Chọn danh mục —</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <TextareaField label="Mô tả" rows={6} value={form.description} onChange={(e) => set('description', e.target.value)} />
          <div className="form-grid">
            <FormField label="Thứ tự hiển thị" type="number" value={form.sortOrder} hint="Số nhỏ hiển thị trước"
              onChange={(e) => set('sortOrder', Number(e.target.value))} />
            <div className="field checkbox-group">
              <label className="checkbox"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Đang bán</label>
              <label className="checkbox"><input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} /> New Arrival</label>
            </div>
          </div>
        </section>

        <section className="admin-panel stack">
          <h2 className="block-title">Size & tồn kho</h2>
          {form.variants.map((v, i) => (
            <div key={i} className="variant-row">
              <input aria-label="Size" placeholder="Size" value={v.size} onChange={(e) => setVariant(i, { size: e.target.value.toUpperCase() })} />
              <input aria-label="Tồn kho" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: Number(e.target.value) })} />
              <button type="button" className="btn btn-ghost btn-sm text-danger" aria-label="Xóa size"
                onClick={() => set('variants', form.variants.filter((_, idx) => idx !== i))}>Xóa</button>
            </div>
          ))}
          <div className="row-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('variants', [...form.variants, { size: '', stock: 0 }])}>+ Thêm size</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('variants', ['S', 'M', 'L', 'XL'].map((size) => ({ size, stock: 10 })))}>S/M/L/XL</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('variants', [{ size: 'FREE SIZE', stock: 10 }])}>Free size</button>
          </div>
        </section>

        <section className="admin-panel stack">
          <h2 className="block-title">Hình ảnh ({form.images.length}/10)</h2>
          <p className="muted small">Ảnh đầu tiên là ảnh chính, ảnh thứ 2 hiện khi rê chuột. Tỉ lệ khuyên dùng 4:5.</p>
          <div className="image-list">
            {form.images.map((src, i) => (
              <figure key={src + i} className="image-item">
                <img src={src} alt="" />
                <figcaption>
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Lên trước"><ArrowLeftIcon /></button>
                  <button type="button" onClick={() => set('images', form.images.filter((_, idx) => idx !== i))} aria-label="Xóa ảnh"><CloseIcon width={14} height={14} /></button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Ra sau"><ArrowRightIcon width={14} height={14} /></button>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="row-actions">
            <label className="btn btn-secondary btn-sm file-btn">
              {upload.pending ? 'Đang tải…' : 'Tải ảnh lên'}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { onUpload(e.target.files, 'images'); e.target.value = ''; }} />
            </label>
            <input placeholder="hoặc dán URL ảnh" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" disabled={!imageUrl.trim()}
              onClick={() => { set('images', [...form.images, imageUrl.trim()]); setImageUrl(''); }}>Thêm</button>
          </div>

          <h2 className="block-title">Ảnh bảng size (tùy chọn)</h2>
          {form.sizeChart && (
            <figure className="image-item image-item-wide">
              <img src={form.sizeChart} alt="Bảng size" />
              <figcaption><button type="button" onClick={() => set('sizeChart', null)}>Xóa</button></figcaption>
            </figure>
          )}
          <label className="btn btn-secondary btn-sm file-btn">
            Tải ảnh bảng size
            <input type="file" accept="image/*" hidden onChange={(e) => { onUpload(e.target.files, 'sizeChart'); e.target.value = ''; }} />
          </label>
        </section>

        <div className="admin-form__actions">
          <Button type="submit" loading={save.pending}>{isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</Button>
          <Link to="/admin/products" className="btn btn-ghost btn-md">Hủy</Link>
        </div>
      </form>
    </>
  );
}
