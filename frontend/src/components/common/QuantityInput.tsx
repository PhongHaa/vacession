import { MinusIcon, PlusIcon } from './Icons';

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: 'md' | 'sm';
}

export default function QuantityInput({ value, min = 1, max, onChange, size = 'md' }: Props) {
  return (
    <div className={`qty qty-${size}`}>
      <button type="button" aria-label="Giảm số lượng" onClick={() => onChange(value - 1)} disabled={value <= min}>
        <MinusIcon width={14} height={14} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Số lượng"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
      />
      <button type="button" aria-label="Tăng số lượng" onClick={() => onChange(value + 1)} disabled={value >= max}>
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}
