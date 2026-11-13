import { useState } from 'react';
import type { DailyStat } from '@/types';
import { formatCompact, formatPrice } from '@/utils/format';

const dayLabel = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Làm tròn trần lên mốc "đẹp" (1, 2, 5 × 10^n) để trục dễ đọc */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * pow >= value) ?? 10;
  return step * pow;
}

/** Biểu đồ cột doanh thu theo ngày: 1 chuỗi dữ liệu, rê chuột hoặc Tab để xem chi tiết */
export default function RevenueChart({ data }: { data: DailyStat[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const ticks = [1, 0.5, 0];
  const current = active !== null ? data[active] : null;

  return (
    <figure className="chart">
      <div className="chart__plot" onMouseLeave={() => setActive(null)}>
        <div className="chart__grid" aria-hidden>
          {ticks.map((t) => (
            <div key={t} className="chart__tick" style={{ bottom: `${t * 100}%` }}>
              <span>{t === 0 ? '0' : formatCompact(max * t)}</span>
            </div>
          ))}
        </div>

        <div className="chart__bars" role="list">
          {data.map((d, i) => (
            <div
              key={d.date}
              role="listitem"
              tabIndex={0}
              className={`chart__col ${active === i ? 'is-active' : ''}`}
              aria-label={`${dayLabel(d.date)}: ${formatPrice(d.revenue)}, ${d.orders} đơn`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <div className={`chart__bar ${d.revenue === 0 ? 'is-zero' : ''}`} style={{ height: `${(d.revenue / max) * 100}%` }} />
            </div>
          ))}
        </div>

        {current && active !== null && (
          <div
            className="chart__tip"
            role="status"
            style={{ left: `${((active + 0.5) / data.length) * 100}%`, bottom: `calc(${(current.revenue / max) * 100}% + 10px)` }}
          >
            <span>{dayLabel(current.date)}</span>
            <strong>{formatPrice(current.revenue)}</strong>
            <span>{current.orders} đơn</span>
          </div>
        )}
      </div>

      <div className="chart__axis" aria-hidden>
        {data.map((d, i) => (
          // Neo theo ngày cuối: màn rộng hiện cách 1 ngày, màn hẹp cách 3 ngày
          <span key={d.date} className={`${(data.length - 1 - i) % 2 ? 'is-odd' : ''} ${(data.length - 1 - i) % 4 ? 'is-minor' : ''}`}>{dayLabel(d.date)}</span>
        ))}
      </div>

      <details className="chart__table">
        <summary>Xem dạng bảng</summary>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Ngày</th><th className="num">Đơn</th><th className="num">Doanh thu</th></tr></thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}><td>{dayLabel(d.date)}</td><td className="num">{d.orders}</td><td className="num">{formatPrice(d.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
