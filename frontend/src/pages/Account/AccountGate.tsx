import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/common/Spinner';
import AuthPage from './AuthPage';

/** Chưa đăng nhập -> form đăng nhập/đăng ký. Đã đăng nhập -> khu vực tài khoản. */
export default function AccountGate() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (!user) return <AuthPage />;

  return (
    <div className="container section">
      <div className="page-hero__meta account-head">
        <span className="label">(My Account)</span>
        <span className="index">{user.email}</span>
      </div>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Tài khoản">
          <NavLink to="/my-account" end>Tổng quan</NavLink>
          <NavLink to="/my-account/orders">Đơn hàng</NavLink>
          <NavLink to="/my-account/edit-account">Thông tin tài khoản</NavLink>
          {user.role === 'ADMIN' && <NavLink to="/admin">Trang quản trị</NavLink>}
          <button onClick={async () => { await logout(); navigate('/my-account'); }}>Đăng xuất</button>
        </nav>
        <div className="account-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
