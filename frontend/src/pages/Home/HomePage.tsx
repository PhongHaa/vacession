import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { categoryService, productService } from '@/services/catalog.service';
import ProductGrid from '@/components/product/ProductGrid';
import Spinner from '@/components/common/Spinner';
import Reveal from '@/components/common/Reveal';
import Marquee from '@/components/common/Marquee';
import Wordmark from '@/components/common/Wordmark';
import { ArrowRightIcon } from '@/components/common/Icons';

export default function HomePage() {
  useDocumentTitle();
  const newArrivals = useFetch(() => productService.list({ new: 'true', limit: 4, sort: 'newest' }));
  const bestSellers = useFetch(() => productService.list({ sort: 'popularity', limit: 4 }));
  const { data: categories } = useFetch(categoryService.list);

  return (
    <>
      <section className="hero">
        <div className="hero__grain" aria-hidden />
        <div className="hero__top">
          <span className="label">Fall / Winter Collection</span>
          <span className="label">(Scroll)</span>
        </div>
        <div className="hero__bottom">
          <div className="hero__row">
            <p className="hero__tagline">Trang phục hằng ngày, <em>làm để mặc lâu.</em></p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn-light btn-md">Shop now <ArrowRightIcon /></Link>
              <Link to="/campaign" className="btn btn-outline-light btn-md">Campaign</Link>
            </div>
          </div>
          <h1 className="hero__wordmark"><Wordmark /></h1>
        </div>
      </section>

      <Marquee
        className="marquee-xl"
        repeat={3}
        items={['New Arrivals', <em key="fw">Fall / Winter</em>, APP_NAME, <em key="es">Essentials</em>]}
      />

      <section className="container section">
        <Reveal>
          <div className="section-head">
            <span className="index">(01)</span>
            <h2 className="section-title">New <em>Arrivals</em></h2>
            <Link to="/new-arrivals" className="arrow-link">Xem tất cả <ArrowRightIcon /></Link>
          </div>
        </Reveal>
        {newArrivals.loading && !newArrivals.data ? <Spinner /> : <ProductGrid products={newArrivals.data?.items ?? []} />}
      </section>

      {categories && categories.length > 0 && (
        <section className="container section">
          <Reveal>
            <div className="section-head">
              <span className="index">(02)</span>
              <h2 className="section-title">Shop by <em>Category</em></h2>
              <Link to="/shop" className="arrow-link">Tất cả sản phẩm <ArrowRightIcon /></Link>
            </div>
          </Reveal>
          <ul className="cat-index">
            {categories.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={i * 60}>
                  <Link to={`/category/${c.slug}`} className="cat-row">
                    <span className="index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cat-row__name">{c.name}</span>
                    <span className="index">{c.productCount} items</span>
                    <ArrowRightIcon className="cat-row__arrow" />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container section">
        <Reveal>
          <Link to="/campaign" className="editorial">
            <div className="editorial__text">
              <span className="label">Campaign</span>
              <h2>The <em>Fall / Winter</em> lookbook</h2>
              <span className="arrow-link">Xem lookbook <ArrowRightIcon /></span>
            </div>
            <div className="editorial__media">
              <img src="/images/lookbook-3.svg" alt="" loading="lazy" />
              <img src="/images/lookbook-9.svg" alt="" loading="lazy" />
            </div>
          </Link>
        </Reveal>
      </section>

      <section className="container section">
        <Reveal>
          <div className="section-head">
            <span className="index">(03)</span>
            <h2 className="section-title">Best <em>Sellers</em></h2>
            <Link to="/shop?sort=popularity" className="arrow-link">Xem tất cả <ArrowRightIcon /></Link>
          </div>
        </Reveal>
        {bestSellers.loading && !bestSellers.data ? <Spinner /> : <ProductGrid products={bestSellers.data?.items ?? []} />}
      </section>
    </>
  );
}
