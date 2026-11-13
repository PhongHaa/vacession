import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/auth.service';
import { FormField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { ArrowLeftIcon } from '@/components/common/Icons';

export default function LostPasswordPage() {
  useDocumentTitle('Quên mật khẩu');
  const [email, setEmail] = useState('');
  const { pending, error, success, run, setSuccess } = useAsyncAction();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await run(() => authService.forgotPassword(email));
    if (res) {
      setSuccess(res.message);
      setEmail('');
    }
  };

  return (
    <div className="container section narrow-sm">
      <h1 className="page-title">Quên mật khẩu</h1>
      <form className="stack" onSubmit={onSubmit}>
        <p>Nhập email đã đăng ký, chúng tôi sẽ gửi link để bạn đặt lại mật khẩu.</p>
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
        <FormField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" block loading={pending}>Gửi link đặt lại mật khẩu</Button>
        <Link to="/my-account" className="link-underline small"><ArrowLeftIcon /> Quay lại đăng nhập</Link>
      </form>
    </div>
  );
}
