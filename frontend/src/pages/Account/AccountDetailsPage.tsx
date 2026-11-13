import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { accountService } from '@/services/account.service';
import { FormField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function AccountDetailsPage() {
  useDocumentTitle('Thông tin tài khoản');
  const { user, setUser } = useAuth();
  const profileAction = useAsyncAction();
  const passwordAction = useAsyncAction();

  const [profile, setProfile] = useState({
    lastName: user?.lastName ?? '',
    firstName: user?.firstName ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const set = (key: keyof typeof profile) => (e: { target: { value: string } }) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await profileAction.run(() => accountService.updateProfile(profile), 'Đã lưu thông tin');
    if (res) setUser(res.user);
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return passwordAction.setError('Mật khẩu xác nhận không khớp');
    const ok = await passwordAction.run(
      () => accountService.changePassword(pw.currentPassword, pw.newPassword),
      'Đổi mật khẩu thành công',
    );
    if (ok) setPw({ currentPassword: '', newPassword: '', confirm: '' });
  };

  return (
    <div className="stack-lg">
      <h1 className="page-title">Thông tin tài khoản</h1>
      <form onSubmit={onSaveProfile} className="stack">
        <h2 className="block-title">Thông tin cá nhân & địa chỉ</h2>
        <Alert>{profileAction.error}</Alert>
        <Alert type="success">{profileAction.success}</Alert>
        <div className="form-grid">
          <FormField label="Họ" value={profile.lastName} onChange={set('lastName')} />
          <FormField label="Tên" value={profile.firstName} onChange={set('firstName')} />
          <FormField label="Email" value={user?.email ?? ''} disabled />
          <FormField label="Số điện thoại" type="tel" value={profile.phone} onChange={set('phone')} />
          <FormField label="Địa chỉ" className="span-2" value={profile.address} onChange={set('address')} />
          <FormField label="Tỉnh / Thành phố" value={profile.city} onChange={set('city')} />
        </div>
        <div><Button type="submit" loading={profileAction.pending}>Lưu thay đổi</Button></div>
      </form>

      <form onSubmit={onChangePassword} className="stack">
        <h2 className="block-title">Đổi mật khẩu</h2>
        <Alert>{passwordAction.error}</Alert>
        <Alert type="success">{passwordAction.success}</Alert>
        <div className="form-grid">
          <FormField label="Mật khẩu hiện tại" type="password" required className="span-2" autoComplete="current-password"
            value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <FormField label="Mật khẩu mới" type="password" required minLength={6} autoComplete="new-password"
            value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <FormField label="Xác nhận mật khẩu mới" type="password" required minLength={6} autoComplete="new-password"
            value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
        </div>
        <div><Button type="submit" loading={passwordAction.pending}>Đổi mật khẩu</Button></div>
      </form>
    </div>
  );
}
