import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { productService } from '@/services/catalog.service';
import ProductGrid from '@/components/product/ProductGrid';
import Reveal from '@/components/common/Reveal';
import { ArrowRightIcon } from '@/components/common/Icons';
import PageHero from './PageHero';

// Kiểu khung ảnh cho từng look: 'lg' = lớn, 'half' = nửa hàng, '' = nhỏ
const LAYOUT = ['lg', '', '', '', '', '', 'lg', 'half', 'half'];
const LOOKS = LAYOUT.map((size, i) => ({
  size,
  no: String(i + 1).padStart(2, '0'),
  src: `/images/lookbook-${i + 1}.svg`,
}));

function Look({ look }: { look: (typeof LOOKS)[number] }) {
  return (
    <figure className={`look ${look.size ? `look--${look.size}` : ''}`}>
      <Reveal>
        <img src={look.src} alt={`Look ${look.no}`} loading="lazy" />
        <figcaption><span>Look {look.no}</span><span>FW</span></figcaption>
      </Reveal>
    </figure>
  );
}

export default function CampaignPage() {
  useDocumentTitle('Campaign');
  const { data } = useFetch(() => productService.list({ new: 'true', limit: 4, sort: 'newest' }));

  return (
    <div className="container section">
      <PageHero
        label="(Campaign)"
        meta={`${LOOKS.length} looks`}
        title={<>Fall / Winter <em>Lookbook</em></>}
        intro="Bộ ảnh của mùa Thu / Đông: những lớp áo chồng lên nhau, tông màu trầm và chất liệu dày dặn."
      />

      <div className="lookbook-grid">
        {LOOKS.slice(0, 5).map((look) => <Look key={look.no} look={look} />)}
      </div>

      <Reveal>
        <p className="pull-quote">Những món đồ được làm ra để mặc mỗi ngày, <em>không phải để cất đi.</em></p>
      </Reveal>

      <div className="lookbook-grid">
        {LOOKS.slice(5).map((look) => <Look key={look.no} look={look} />)}
      </div>

      {data && data.items.length > 0 && (
        <section className="section">
          <Reveal>
            <div className="section-head">
              <span className="index">(Shop the campaign)</span>
              <h2 className="section-title">In the <em>collection</em></h2>
              <Link to="/new-arrivals" className="arrow-link">Xem tất cả <ArrowRightIcon /></Link>
            </div>
          </Reveal>
          <ProductGrid products={data.items} />
        </section>
      )}
    </div>
  );
}
