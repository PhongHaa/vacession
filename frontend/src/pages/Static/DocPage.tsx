import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ArrowRightIcon } from '@/components/common/Icons';
import PageHero from './PageHero';

export interface DocSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface Props {
  name: string;
  label: string;
  title: ReactNode;
  intro: ReactNode;
  sections: DocSection[];
  /** Nội dung chèn giữa phần mở đầu và phần văn bản (vd. các con số nổi bật) */
  children?: ReactNode;
}

const pad = (i: number) => String(i + 1).padStart(2, '0');

/** Trang văn bản dài (Terms, Returns): mục lục dính bên trái + các mục đánh số */
export default function DocPage({ name, label, title, intro, sections, children }: Props) {
  useDocumentTitle(name);
  return (
    <div className="container section">
      <PageHero label={label} meta={`${sections.length} mục`} title={title} intro={intro} />
      {children}

      <div className="doc-layout">
        <nav className="doc-toc" aria-label="Mục lục">
          <span className="label">Mục lục</span>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`}><span className="index">{pad(i)}</span>{s.title}</a>
          ))}
        </nav>

        <div className="doc-body">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="doc-section">
              <span className="index">{pad(i)}</span>
              <h2>{s.title}</h2>
              <div className="prose">{s.body}</div>
            </section>
          ))}

          <div className="doc-help">
            <p>Còn thắc mắc? Chúng tôi luôn sẵn sàng hỗ trợ.</p>
            <Link to="/contact" className="btn btn-secondary btn-md">Liên hệ <ArrowRightIcon /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
