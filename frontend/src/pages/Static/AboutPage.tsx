import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Reveal from '@/components/common/Reveal';
import { ArrowRightIcon } from '@/components/common/Icons';
import PageHero from './PageHero';

const VALUES = [
  { title: 'Chất liệu', text: 'Chọn vải trước, thiết kế sau. Mỗi chất liệu được mặc thử và giặt thử trước khi đưa vào sản xuất.' },
  { title: 'Form dáng', text: 'Rập được chỉnh theo vóc dáng người Việt, rộng rãi vừa đủ để thoải mái mà vẫn gọn.' },
  { title: 'Độ bền', text: 'Đường may chắc, phụ liệu tốt. Một món đồ nên đẹp dần lên theo thời gian sử dụng.' },
];

export default function AboutPage() {
  useDocumentTitle('About');
  return (
    <div className="container section">
      <PageHero
        label="(About)"
        title={<>About <em>us</em></>}
        intro={<>{APP_NAME} là thương hiệu thời trang local, làm ra những món đồ tối giản để mặc mỗi ngày.</>}
      />

      <Reveal><img src="/images/about.svg" alt="" className="about-cover" /></Reveal>

      <Reveal>
        <section className="split">
          <span className="label">Câu chuyện</span>
          <div className="split__body">
            <p className="statement">Chúng tôi tin rằng tủ đồ tốt là tủ đồ <em>ít nhưng dùng được lâu.</em></p>
            <div className="prose">
              <p>
                {APP_NAME} bắt đầu từ mong muốn đơn giản: làm ra những món đồ mà chính chúng tôi muốn mặc hằng ngày.
                Không chạy theo xu hướng ngắn hạn, mỗi bộ sưu tập chỉ gồm một số ít thiết kế được làm thật kỹ.
              </p>
              <p>
                Từ khâu chọn vải, lên rập đến hoàn thiện, từng sản phẩm đều được theo sát để đảm bảo chất lượng
                trước khi đến tay bạn.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="split">
        <span className="label">Điều chúng tôi quan tâm</span>
        <ol className="value-list">
          {VALUES.map((v, i) => (
            <li key={v.title}>
              <Reveal delay={i * 60} className="value-row">
                <span className="index">{String(i + 1).padStart(2, '0')}</span>
                <h2>{v.title}</h2>
                <p>{v.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <Reveal>
        <div className="image-pair">
          <img src="/images/lookbook-1.svg" alt="" loading="lazy" />
          <img src="/images/lookbook-7.svg" alt="" loading="lazy" />
        </div>
      </Reveal>

      <Reveal>
        <section className="cta-band">
          <p className="statement">Xem những gì chúng tôi <em>đang làm.</em></p>
          <div className="actions-row">
            <Link to="/shop" className="btn btn-primary btn-md">Shop <ArrowRightIcon /></Link>
            <Link to="/campaign" className="btn btn-secondary btn-md">Campaign</Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
