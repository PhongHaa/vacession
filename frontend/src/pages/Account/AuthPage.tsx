import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { FormField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { IS_DEMO } from '@/constants';

/** Trang đăng nhập (hiện ở /my-account khi chưa đăng nhập) */
export default function AuthPage() {
  useDocumentTitle('Đăng nhập');
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const { pending, error, run } = useAsyncAction();
  const [form, setForm] = useState({ email: '', password: '', remember: true });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = await run(() => login(form.email, form.password, form.remember));
    if (user && from) navigate(from, { replace: true });
  };

  return (
    <div className="container section narrow-sm">
      <h1 className="page-title">Đăng <em>nhập</em></h1>
      <form className="auth-card" onSubmit={onSubmit}>
        {IS_DEMO && (
          <Alert type="info">
            Bản demo — thử trang quản trị bằng <strong>admin@vacession.vn</strong> / <strong>Admin@123</strong>{' '}
            <button type="button" className="link-btn" onClick={() => setForm({ email: 'admin@vacession.vn', password: 'Admin@123', remember: true })}>Điền sẵn</button>
          </Alert>
        )}
        <Alert>{error}</Alert>
        <FormField label="Email" type="email" required autoComplete="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <FormField label="Mật khẩu" type="password" required autoComplete="current-password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="auth-row">
          <label className="checkbox">
            <input type="checkbox" checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/my-account/lost-password" className="link-underline small">Quên mật khẩu?</Link>
        </div>
        <Button type="submit" block loading={pending}>Đăng nhập</Button>
      </form>
      <p className="auth-switch">
        Chưa có tài khoản? <Link to="/my-account/register" state={{ from }} className="link-underline">Tạo tài khoản</Link>
      </p>
    </div>
  );
}
