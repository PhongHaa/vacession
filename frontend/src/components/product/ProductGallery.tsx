import { useRef, useState } from 'react';
import { PLACEHOLDER_IMAGE } from '@/constants';

/** Mobile: vuốt ngang + chấm chỉ số. Desktop: ảnh xếp dọc. */
export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.length ? images : [PLACEHOLDER_IMAGE];
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = trackRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="gallery">
      <div className="gallery__track" ref={trackRef} onScroll={onScroll}>
        {list.map((src, i) => (
          <img key={src + i} src={src} alt={`${alt} - ảnh ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
        ))}
      </div>
      {list.length > 1 && (
        <div className="gallery__dots mobile-only">
          {list.map((_, i) => (
            <button key={i} aria-label={`Ảnh ${i + 1}`} className={i === active ? 'active' : ''} onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
