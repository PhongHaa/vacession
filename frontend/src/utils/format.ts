/** 1230000 -> "1.230.000 ₫" */
export const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;

/** 1250000 -> "1,3tr", 450000 -> "450k" (dùng cho trục biểu đồ) */
export const formatCompact = (value: number) => {
  if (value >= 1e9) return `${(value / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tỷ`;
  if (value >= 1e6) return `${(value / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
  return String(value);
};

export const formatDay = (value: string | Date) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export const fullName = (u: { firstName?: string | null; lastName?: string | null }) =>
  [u.lastName, u.firstName].filter(Boolean).join(' ');
