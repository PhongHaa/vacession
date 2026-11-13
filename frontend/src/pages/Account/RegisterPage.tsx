import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { FormField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import Spinner from '@/components/common/Spinner';

export default function RegisterPage() {
  useDocumentTitle('Đăng ký');
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const { pending, error, run, setError } = useAsyncAction();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });

  if (loading) return <Spinner />;
  // Đã đăng nhập thì không cần đăng ký nữa
  if (user && !pending) return <Navigate to={from ?? '/my-account'} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Mật khẩu xác nhận không khớp');
    const created = await run(() => register(form.email, form.password));
    if (created) navigate(from ?? '/my-account', { replace: true });
  };

  return (
    <div className="container section narrow-sm">
      <h1 className="page-title">Tạo <em>tài khoản</em></h1>
      <form className="auth-card" onSubmit={onSubmit}>
        <Alert>{error}</Alert>
        <FormField label="Email" type="email" required autoComplete="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <FormField label="Mật khẩu" type="password" required minLength={6} autoComplete="new-password"
          hint="Tối thiểu 6 ký tự"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <FormField label="Xác nhận mật khẩu" type="password" required minLength={6} autoComplete="new-password"
          value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        <p className="muted small">
          Thông tin cá nhân của bạn sẽ được dùng để hỗ trợ trải nghiệm mua sắm, quản lý tài khoản và cho các mục đích
          khác được mô tả trong <Link to="/terms" className="link-underline">chính sách bảo mật</Link>.
        </p>
        <Button type="submit" block loading={pending}>Đăng ký</Button>
      </form>
      <p className="auth-switch">
        Đã có tài khoản? <Link to="/my-account" state={{ from }} className="link-underline">Đăng nhập</Link>
      </p>
    </div>
  );
}
