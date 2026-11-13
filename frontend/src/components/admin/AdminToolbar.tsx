import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloseIcon, SearchIcon } from '@/components/common/Icons';

export interface ToolbarFilter {
  /** Tên tham số trên URL, ví dụ "category" */
  key: string;
  /** Nhãn cho trình đọc màn hình, ví dụ "Lọc theo danh mục" */
  label: string;
  /** Chữ hiện khi chưa lọc, ví dụ "Tất cả danh mục" */
  allLabel: string;
  options: { value: string; label: string }[];
}

interface Props {
  placeholder: string;
  filters?: ToolbarFilter[];
}

/**
 * Thanh tìm kiếm + bộ lọc dùng chung cho các trang danh sách trong admin.
 * Trạng thái nằm trên URL (?q=...&category=...), nên trang chỉ cần đọc useSearchParams.
 * Gõ là tự tìm sau 350ms; đổi bộ lọc hay từ khóa đều quay về trang 1.
 */
export default function AdminToolbar({ placeholder, filters = [] }: Props) {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [search, setSearch] = useState(q);

  // Luôn sửa trên URL đang hiển thị (window.location), không dùng bản chụp cũ trong closure:
  // nếu không, lần tìm kiếm đang chờ 350ms có thể ghi đè lại bộ lọc vừa bị xóa.
  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete('page');
    setParams(next, { replace: true });
  };

  // Gõ xong 350ms mới tìm, để không gọi API theo từng phím
  useEffect(() => {
    const term = search.trim();
    if (term === q) return;
    const t = setTimeout(() => update({ q: term }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // URL đổi từ bên ngoài (nút Back, xóa lọc) thì cập nhật lại ô nhập
  useEffect(() => {
    setSearch((current) => (current.trim() === q ? current : q));
  }, [q]);

  const active = !!q || filters.some((f) => params.get(f.key));
  const reset = () => {
    setSearch('');
    update({ q: '', ...Object.fromEntries(filters.map((f) => [f.key, ''])) });
  };

  return (
    <form className="toolbar" role="search" onSubmit={(e) => { e.preventDefault(); update({ q: search.trim() }); }}>
      <label className="toolbar__search">
        <SearchIcon width={18} height={18} />
        <input type="search" placeholder={placeholder} aria-label={placeholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button type="button" className="toolbar__clear" aria-label="Xóa từ khóa" onClick={() => setSearch('')}>
            <CloseIcon width={16} height={16} />
          </button>
        )}
      </label>

      {filters.map((f) => (
        <select key={f.key} aria-label={f.label} className={params.get(f.key) ? 'is-active' : ''}
          value={params.get(f.key) ?? ''} onChange={(e) => update({ [f.key]: e.target.value })}>
          <option value="">{f.allLabel}</option>
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}

      {active && <button type="button" className="btn btn-ghost btn-md toolbar__reset" onClick={reset}>Xóa lọc</button>}
    </form>
  );
}
