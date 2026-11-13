import type { ReactNode } from 'react';

/** Dải chữ chạy ngang vô hạn */
export default function Marquee({ items, className = '', repeat = 4 }: { items: ReactNode[]; className?: string; repeat?: number }) {
  const list = Array.from({ length: repeat }).flatMap(() => items);
  return (
    <div className={`marquee ${className}`}>
      {[0, 1].map((k) => (
        <div key={k} className="marquee__track" aria-hidden={k === 1}>
          {list.map((item, i) => <span key={i} className="marquee__item">{item}</span>)}
        </div>
      ))}
    </div>
  );
}
