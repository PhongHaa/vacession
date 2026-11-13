import type { ReactNode } from 'react';

interface Props {
  label: string;
  meta?: string;
  title: ReactNode;
  intro?: ReactNode;
}

/** Phần mở đầu dùng chung cho các trang thông tin */
export default function PageHero({ label, meta, title, intro }: Props) {
  return (
    <header className="page-hero">
      <div className="page-hero__meta">
        <span className="label">{label}</span>
        {meta && <span className="index">{meta}</span>}
      </div>
      <div className="page-hero__row">
        <h1 className="display-title">{title}</h1>
        {intro && <p className="page-hero__intro">{intro}</p>}
      </div>
    </header>
  );
}
