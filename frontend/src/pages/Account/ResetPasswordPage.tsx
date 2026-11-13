import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/auth.service';
import { FormField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function ResetPasswordPage() {
  useDocumentTitle('Đặt lại mật khẩu');
  const token = useSearchParams()[0].get('token') ?? '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const { pending, error, success, run, setError } = useAsyncAction();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Mật khẩu xác nhận không khớp');
    await run(() => authService.resetPassword(token, form.password), 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
  };

  return (
    <div className="container section narrow-sm">
      <h1 className="page-title">Đặt lại mật khẩu</h1>
      {!token ? (
        <Alert>Link không hợp lệ.</Alert>
      ) : success ? (
        <div className="stack">
          <Alert type="success">{success}</Alert>
          <Link to="/my-account" className="btn btn-primary btn-md">Đăng nhập</Link>
        </div>
      ) : (
        <form className="stack" onSubmit={onSubmit}>
          <Alert>{error}</Alert>
          <FormField label="Mật khẩu mới" type="password" required minLength={6} autoComplete="new-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FormField label="Xác nhận mật khẩu" type="password" required minLength={6} autoComplete="new-password"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          <Button type="submit" block loading={pending}>Lưu mật khẩu</Button>
        </form>
      )}
    </div>
  );
}
