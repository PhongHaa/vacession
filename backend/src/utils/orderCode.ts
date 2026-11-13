import { randomInt } from 'node:crypto';

/** Ví dụ: VC2611120123 (VC + yymmdd + 4 số ngẫu nhiên) */
export function generateOrderCode() {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}`.padStart(2, '0') +
    `${d.getMonth() + 1}`.padStart(2, '0') +
    `${d.getDate()}`.padStart(2, '0');
  return `VC${ymd}${randomInt(0, 10000).toString().padStart(4, '0')}`;
}
