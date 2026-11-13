import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/catalog.service';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import type { Paginated, ProductSummary } from '@/types';
import { formatPrice } from '@/utils/format';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { ArrowRightIcon, CloseIcon, SearchIcon } from '@/components/common/Icons';

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Paginated<ProductSummary> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Gợi ý kết quả trong lúc gõ
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults(null); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      productService.list({ q: term, limit: 4 }).then((r) => { if (!cancelled) setResults(r); }).catch(() => {});
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const goAll = () => {
    const term = q.trim();
    if (!term) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(term)}`);
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); goAll(); };

  return (
    <div className={`drawer-root search-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="overlay" onClick={onClose} />
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Tìm kiếm">
        <form className="search-form" onSubmit={onSubmit}>
          <SearchIcon />
          <input ref={inputRef} className="search-input" type="search" placeholder="Tìm sản phẩm…" value={q}
            onChange={(e) => setQ(e.target.value)} tabIndex={open ? 0 : -1} aria-label="Từ khóa" />
          <button type="button" className="icon-btn" aria-label="Đóng tìm kiếm" onClick={onClose} tabIndex={open ? 0 : -1}>
            <CloseIcon />
          </button>
        </form>

        {results && (
          <div className="search-results">
            {results.items.length === 0 ? (
              <p className="muted">Không tìm thấy sản phẩm nào cho “{q.trim()}”.</p>
            ) : (
              <>
                <ul>
                  {results.items.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} onClick={onClose} tabIndex={open ? 0 : -1}>
                        <img src={p.images[0] ?? PLACEHOLDER_IMAGE} alt="" />
                        <span>{p.name}</span>
                        <span className="price">{formatPrice(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="button" className="arrow-link" onClick={goAll} tabIndex={open ? 0 : -1}>
                  Xem tất cả {results.total} kết quả <ArrowRightIcon />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
