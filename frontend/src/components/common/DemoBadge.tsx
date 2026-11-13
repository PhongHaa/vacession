import { IS_DEMO } from '@/constants';

/** Nhãn góc dưới màn hình cho bản demo trên GitHub Pages */
export default function DemoBadge() {
  if (!IS_DEMO) return null;

  const onReset = async () => {
    if (!confirm('Xóa mọi thay đổi bạn đã làm (đơn hàng, tài khoản, sản phẩm…) và quay về dữ liệu mẫu?')) return;
    const { resetDemo } = await import('@/demo/server');
    resetDemo();
    location.assign(import.meta.env.BASE_URL);
  };

  return (
    <div className="demo-badge" role="note">
      <span className="demo-badge__dot" aria-hidden />
      <span>Bản demo · dữ liệu chỉ lưu trên trình duyệt này</span>
      <button type="button" onClick={onReset}>Khôi phục</button>
    </div>
  );
}
