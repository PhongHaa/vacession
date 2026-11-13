import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { categoryService, settingsService } from '@/services/catalog.service';
import { MenuIcon, UserIcon, BagIcon, SearchIcon } from '@/components/common/Icons';
import Marquee from '@/components/common/Marquee';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const { count, openCart } = useCart();
  const { user } = useAuth();
  const { data: categories } = useFetch(categoryService.list);
  const { data: settings } = useFetch(settingsService.get);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shopLinks = [
    { to: '/new-arrivals', label: 'New Arrivals' },
    { to: '/shop', label: 'All' },
    ...(categories ?? []).map((c) => ({ to: `/category/${c.slug}`, label: c.name })),
  ];

  const notes = [
    settings && settings.shippingFee > 0 ? 'Giao hàng toàn quốc' : 'Free ship khi mua hàng tại website',
    'Thanh toán khi nhận hàng (COD)',
  ];

  // Ở trang chủ, header trong suốt nằm đè lên hero cho tới khi cuộn
  const overlay = pathname === '/' && !scrolled;

  return (
    <>
      <div className="announcement"><Marquee items={notes} /></div>

      <header className={`site-header ${overlay ? 'is-overlay' : ''}`}>
        <div className="header-bar">
          <div className="header-left">
            <button className="icon-btn mobile-only" aria-label="Mở menu" onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </button>
            <nav className="main-nav desktop-only" aria-label="Danh mục">
              {shopLinks.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
            </nav>
          </div>

          <Link to="/" className="logo" aria-label={`${APP_NAME} - Trang chủ`}>{APP_NAME}</Link>

          <div className="header-right">
            <button className="header-link desktop-only" onClick={() => setSearchOpen(true)}>Search</button>
            <button className="icon-btn mobile-only" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </button>
            <NavLink to="/my-account" className="header-link desktop-only">{user ? 'Account' : 'Sign in'}</NavLink>
            <Link to="/my-account" className="icon-btn mobile-only" aria-label="Tài khoản"><UserIcon /></Link>
            <button className="cart-btn" onClick={openCart} aria-label={`Giỏ hàng, ${count} sản phẩm`}>
              <span className="desktop-only">Cart</span>
              <BagIcon className="mobile-only" />
              <span className={`cart-count ${count > 0 ? 'has-items' : ''}`}>{count}</span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        shopLinks={shopLinks}
        instagram={settings?.shop.instagram}
        signedIn={!!user}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
