import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import DemoBadge from '@/components/common/DemoBadge';

export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="site">
      <a href="#main" className="skip-link">Bỏ qua tới nội dung</a>
      <Header />
      {/* key theo đường dẫn -> mỗi lần chuyển trang có hiệu ứng vào nhẹ */}
      <main id="main" key={pathname} className="site-main page-enter">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <DemoBadge />
      <ScrollRestoration />
    </div>
  );
}
