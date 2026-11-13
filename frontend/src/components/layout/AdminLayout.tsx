import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { adminService } from '@/services/admin.service';
import { ArrowUpRightIcon } from '@/components/common/Icons';
import DemoBadge from '@/components/common/DemoBadge';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Tải lại mỗi khi chuyển trang để số trên menu luôn đúng
  const { data: stats } = useFetch(adminService.stats, [pathname]);

  const links = [
    { to: '/admin', label: 'Tổng quan', end: true },
    { to: '/admin/orders', label: 'Đơn hàng', count: stats?.pendingOrders },
    { to: '/admin/products', label: 'Sản phẩm' },
    { to: '/admin/categories', label: 'Danh mục' },
    { to: '/admin/customers', label: 'Khách hàng' },
    { to: '/admin/messages', label: 'Liên hệ', count: stats?.unreadMessages },
  ];

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="logo logo-sm">{APP_NAME}</span>
          <span className="label">Admin</span>
        </Link>
        <nav className="admin-nav" aria-label="Quản trị">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
              {!!l.count && <span className="admin-nav__count">{l.count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span className="admin-user">{user?.email}</span>
          <Link to="/">Xem cửa hàng <ArrowUpRightIcon /></Link>
          <button onClick={async () => { await logout(); navigate('/my-account'); }}>Đăng xuất</button>
        </div>
      </aside>
      <main className="admin-main" key={pathname}>
        <Outlet />
      </main>
      <DemoBadge />
      <ScrollRestoration />
    </div>
  );
}
