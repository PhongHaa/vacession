export const APP_NAME = 'VACESSION';

/** Bản demo tĩnh (GitHub Pages): build với `npm run build:demo` */
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true';

export const STATIC_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/terms', label: 'Terms' },
  { to: '/returns', label: 'Returns' },
];

export const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'popularity', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price', label: 'Giá: thấp đến cao' },
  { value: 'price-desc', label: 'Giá: cao đến thấp' },
] as const;

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><rect width="4" height="5" fill="%23eeeeee"/></svg>';
