import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { categoryService, productService } from '@/services/catalog.service';
import { SORT_OPTIONS } from '@/constants';
import type { SortOption } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import SortSelect from '@/components/product/SortSelect';
import Pagination from '@/components/common/Pagination';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';

type Mode = 'all' | 'new' | 'category';

const isSort = (v: string | null): v is SortOption => SORT_OPTIONS.some((o) => o.value === v);

export default function ShopPage({ mode }: { mode: Mode }) {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const rawSort = params.get('sort');
  const sort: SortOption = isSort(rawSort) ? rawSort : 'default';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const q = params.get('q') ?? '';

  const { data: categories } = useFetch(categoryService.list);
  const { data, loading, error } = useFetch(
    () => productService.list({
      category: mode === 'category' ? slug : undefined,
      new: mode === 'new' ? 'true' : undefined,
      sort, page, q: q || undefined,
    }),
    [mode, slug, sort, page, q],
  );

  const category = categories?.find((c) => c.slug === slug);
  const title = mode === 'new' ? 'New Arrivals'
    : mode === 'category' ? category?.name ?? ''
    : q ? `Kết quả cho “${q}”` : 'All';
  useDocumentTitle(title || 'Shop');

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setParams(next);
  };

  return (
    <div className="container section">
      <header className="shop-head">
        <h1 className="display-title">{title}{data && <sup>({data.total})</sup>}</h1>
      </header>

      <div className="shop-toolbar">
        <nav className="chips" aria-label="Lọc theo danh mục">
          <NavLink to="/new-arrivals">New</NavLink>
          <NavLink to="/shop" end>All</NavLink>
          {categories?.map((c) => <NavLink key={c.id} to={`/category/${c.slug}`}>{c.name}</NavLink>)}
        </nav>
        <SortSelect value={sort} onChange={(v) => update({ sort: v === 'default' ? null : v, page: null })} />
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && !data ? (
        <Spinner />
      ) : data && data.items.length === 0 ? (
        <p className="empty">Chưa có sản phẩm nào.</p>
      ) : (
        <div className={loading ? 'is-loading' : ''}>
          <ProductGrid products={data?.items ?? []} dense />
        </div>
      )}

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(p) => { update({ page: p === 1 ? null : String(p) }); window.scrollTo({ top: 0 }); }}
        />
      )}
    </div>
  );
}
