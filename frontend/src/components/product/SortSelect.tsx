import { SORT_OPTIONS } from '@/constants';
import type { SortOption } from '@/types';

export default function SortSelect({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  return (
    <label className="sort-select">
      <span>Sort</span>
      <select value={value} onChange={(e) => onChange(e.target.value as SortOption)}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
