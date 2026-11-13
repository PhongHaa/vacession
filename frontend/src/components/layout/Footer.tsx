import { Link } from 'react-router-dom';
import { APP_NAME, STATIC_LINKS } from '@/constants';
import { useFetch } from '@/hooks/useFetch';
import { categoryService, settingsService } from '@/services/catalog.service';
import Wordmark from '@/components/common/Wordmark';
import { ArrowUpRightIcon } from '@/components/common/Icons';

export default function Footer() {
  const { data: settings } = useFetch(settingsService.get);
  const { data: categories } = useFetch(categoryService.list);
  const shop = settings?.shop;

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <p className="footer-intro">Trang phục hằng ngày, <em>làm để mặc lâu.</em></p>

        <nav className="footer-col" aria-label="Shop">
          <h3>Shop</h3>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/shop">All</Link>
          {categories?.map((c) => <Link key={c.id} to={`/category/${c.slug}`}>{c.name}</Link>)}
        </nav>

        <nav className="footer-col" aria-label="Thông tin">
          <h3>Info</h3>
          <Link to="/campaign">Campaign</Link>
          {STATIC_LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          <Link to="/my-account">My Account</Link>
        </nav>

        <div className="footer-col">
          <h3>Contact</h3>
          {shop?.address && <span>{shop.address}</span>}
          {shop?.phone && <a href={`tel:${shop.phone}`}>{shop.phone}</a>}
          {shop?.email && <a href={`mailto:${shop.email}`}>{shop.email}</a>}
          {shop?.instagram && <a href={shop.instagram} target="_blank" rel="noreferrer">Instagram <ArrowUpRightIcon /></a>}
        </div>
      </div>

      <Wordmark className="footer-wordmark" />

      <div className="footer-bottom">
        <span>{APP_NAME} © {new Date().getFullYear()}</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
