import { Link } from 'react-router-dom';
import DocPage, { type DocSection } from './DocPage';

const SECTIONS: DocSection[] = [
  {
    id: 'dat-hang',
    title: 'Đặt hàng',
    body: (
      <>
        <p>Bạn có thể đặt hàng trực tiếp trên website mà không cần tạo tài khoản. Sau khi đặt, bạn nhận được mã đơn hàng để theo dõi.</p>
        <p>Đơn hàng được xác nhận qua điện thoại hoặc email. Chúng tôi có quyền từ chối hoặc hủy đơn có thông tin không chính xác, hoặc khi sản phẩm hết hàng ngoài dự kiến.</p>
      </>
    ),
  },
  {
    id: 'gia-thanh-toan',
    title: 'Giá & thanh toán',
    body: (
      <>
        <p>Giá niêm yết trên website tính bằng Việt Nam đồng (₫) và đã bao gồm VAT.</p>
        <ul>
          <li><strong>Thanh toán khi nhận hàng (COD):</strong> trả tiền mặt cho nhân viên giao hàng.</li>
          <li><strong>Chuyển khoản ngân hàng:</strong> thông tin tài khoản hiển thị sau khi đặt hàng; ghi mã đơn hàng ở nội dung chuyển khoản.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'giao-hang',
    title: 'Giao hàng',
    body: (
      <>
        <ul>
          <li>Nội thành TP.HCM: 1 – 2 ngày.</li>
          <li>Ngoại thành và các tỉnh khác: 2 – 4 ngày tùy khu vực.</li>
        </ul>
        <p>Với đơn COD, bạn được kiểm tra hàng trước khi thanh toán.</p>
      </>
    ),
  },
  {
    id: 'tai-khoan',
    title: 'Tài khoản',
    body: (
      <>
        <p>Tài khoản giúp bạn xem lịch sử đơn hàng, lưu địa chỉ giao hàng và tự hủy đơn khi đơn còn ở trạng thái chờ xác nhận.</p>
        <p>Bạn có trách nhiệm giữ bí mật mật khẩu. Nếu quên, hãy dùng chức năng <Link to="/my-account/lost-password">quên mật khẩu</Link> để đặt lại.</p>
      </>
    ),
  },
  {
    id: 'bao-mat',
    title: 'Chính sách bảo mật',
    body: (
      <>
        <p>Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, số điện thoại, email và địa chỉ giao hàng.</p>
        <p>Thông tin này không được bán hay chia sẻ cho bên thứ ba, ngoại trừ đơn vị vận chuyển để giao hàng cho bạn.</p>
      </>
    ),
  },
  {
    id: 'doi-tra',
    title: 'Đổi trả',
    body: <p>Điều kiện và quy trình đổi hàng được mô tả chi tiết tại trang <Link to="/returns">Returns</Link>.</p>,
  },
];

export default function TermsPage() {
  return (
    <DocPage
      name="Terms"
      label="(Terms)"
      title={<>Terms &amp; <em>Conditions</em></>}
      intro="Những điều khoản áp dụng khi bạn mua hàng tại website. Vui lòng đọc kỹ trước khi đặt hàng."
      sections={SECTIONS}
    />
  );
}
