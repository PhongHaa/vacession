import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { settingsService } from '@/services/catalog.service';
import { contactService } from '@/services/contact.service';
import { FormField, TextareaField } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import { ArrowUpRightIcon, ChevronDownIcon } from '@/components/common/Icons';
import PageHero from './PageHero';

const EMPTY = { name: '', email: '', phone: '', message: '' };

const FAQ = [
  {
    q: 'Tôi theo dõi đơn hàng ở đâu?',
    a: <>Nếu đặt hàng bằng tài khoản, bạn xem trạng thái đơn trong mục <Link to="/my-account/orders">Đơn hàng</Link>. Nếu không, hãy gửi mã đơn hàng cho chúng tôi qua form này.</>,
  },
  {
    q: 'Có những hình thức thanh toán nào?',
    a: <>Thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngân hàng. Thông tin chuyển khoản hiển thị ngay sau khi đặt hàng.</>,
  },
  {
    q: 'Bao lâu thì tôi nhận được hàng?',
    a: <>Nội thành TP.HCM 1 – 2 ngày, ngoại thành và các tỉnh khác 2 – 4 ngày tùy khu vực.</>,
  },
  {
    q: 'Tôi muốn đổi size thì làm thế nào?',
    a: <>Bạn có thể đổi size hoặc đổi mẫu trong 7 ngày. Xem chi tiết tại trang <Link to="/returns">Returns</Link>.</>,
  },
];

export default function ContactPage() {
  useDocumentTitle('Contact');
  const { data: settings } = useFetch(settingsService.get);
  const [form, setForm] = useState(EMPTY);
  const { pending, error, success, run, setSuccess } = useAsyncAction();
  const shop = settings?.shop;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await run(() => contactService.send({ ...form, phone: form.phone || undefined }));
    if (res) {
      setSuccess(res.message);
      setForm(EMPTY);
    }
  };

  return (
    <div className="container section">
      <PageHero
        label="(Contact)"
        title={<>Get in <em>touch</em></>}
        intro="Câu hỏi về sản phẩm, đơn hàng hay hợp tác — hãy để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất."
      />

      <div className="contact-layout">
        <div className="contact-info">
          <dl className="info-list">
            {shop?.address && <div><dt>Địa chỉ</dt><dd>{shop.address}</dd></div>}
            {shop?.phone && <div><dt>Hotline</dt><dd><a href={`tel:${shop.phone}`} className="link-underline">{shop.phone}</a></dd></div>}
            {shop?.email && <div><dt>Email</dt><dd><a href={`mailto:${shop.email}`} className="link-underline">{shop.email}</a></dd></div>}
            {shop?.instagram && (
              <div>
                <dt>Instagram</dt>
                <dd><a href={shop.instagram} target="_blank" rel="noreferrer" className="link-underline">Theo dõi <ArrowUpRightIcon /></a></dd>
              </div>
            )}
          </dl>
        </div>

        <form className="contact-form" onSubmit={onSubmit}>
          <span className="label">Gửi lời nhắn</span>
          <Alert>{error}</Alert>
          <Alert type="success">{success}</Alert>
          <FormField label="Họ tên" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="form-grid">
            <FormField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FormField label="Số điện thoại" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <TextareaField label="Nội dung" required rows={6} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div><Button type="submit" loading={pending}>Gửi tin nhắn</Button></div>
        </form>
      </div>

      <section className="split faq">
        <span className="label">Câu hỏi thường gặp</span>
        <div className="accordion">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q} <ChevronDownIcon width={16} height={16} /></summary>
              <div className="accordion__body">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
