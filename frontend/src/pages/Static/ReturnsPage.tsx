import { Link } from 'react-router-dom';
import DocPage, { type DocSection } from './DocPage';

const FACTS = [
  { value: '7 ngày', label: 'Đổi size hoặc đổi mẫu kể từ khi nhận hàng' },
  { value: 'Nguyên tem', label: 'Sản phẩm còn tem mác, chưa qua sử dụng hoặc giặt' },
  { value: '2 – 3 ngày', label: 'Gửi sản phẩm mới sau khi chúng tôi nhận được hàng' },
];

const SECTIONS: DocSection[] = [
  {
    id: 'dieu-kien',
    title: 'Điều kiện đổi hàng',
    body: (
      <ul>
        <li>Đổi size hoặc đổi mẫu trong vòng 7 ngày kể từ khi nhận hàng.</li>
        <li>Sản phẩm còn nguyên tem, mác, chưa qua sử dụng hoặc giặt.</li>
        <li>Có mã đơn hàng để đối chiếu.</li>
      </ul>
    ),
  },
  {
    id: 'quy-trinh',
    title: 'Quy trình',
    body: (
      <ol>
        <li>Liên hệ qua trang <Link to="/contact">Contact</Link> hoặc Instagram, kèm mã đơn hàng và sản phẩm muốn đổi.</li>
        <li>Gửi sản phẩm về địa chỉ của shop.</li>
        <li>Chúng tôi kiểm tra và gửi sản phẩm mới trong 2 – 3 ngày làm việc.</li>
      </ol>
    ),
  },
  {
    id: 'khong-ap-dung',
    title: 'Trường hợp không áp dụng',
    body: (
      <ul>
        <li>Sản phẩm giảm giá.</li>
        <li>Phụ kiện.</li>
        <li>Sản phẩm đã qua sử dụng, đã giặt hoặc mất tem mác.</li>
      </ul>
    ),
  },
  {
    id: 'san-pham-loi',
    title: 'Sản phẩm lỗi hoặc giao sai',
    body: <p>Nếu sản phẩm bị lỗi sản xuất hoặc giao không đúng đơn, hãy liên hệ ngay kèm ảnh chụp sản phẩm để chúng tôi đổi sản phẩm mới cho bạn.</p>,
  },
  {
    id: 'huy-don',
    title: 'Hủy đơn hàng',
    body: (
      <p>
        Khi đơn còn ở trạng thái chờ xác nhận, bạn có thể tự hủy trong mục <Link to="/my-account/orders">Đơn hàng</Link> của tài khoản.
        Nếu đặt hàng không dùng tài khoản hoặc đơn đã được xác nhận, vui lòng liên hệ với chúng tôi.
      </p>
    ),
  },
];

export default function ReturnsPage() {
  return (
    <DocPage
      name="Returns"
      label="(Returns)"
      title={<>Returns &amp; <em>Exchanges</em></>}
      intro="Chưa vừa size hay muốn đổi mẫu khác? Đây là cách đổi hàng."
      sections={SECTIONS}
    >
      <ul className="facts">
        {FACTS.map((f) => (
          <li key={f.value} className="fact">
            <strong>{f.value}</strong>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>
    </DocPage>
  );
}
