import { APP_NAME } from '@/constants';

/** Tên thương hiệu cỡ lớn, luôn co giãn vừa khít chiều ngang */
export default function Wordmark({ className = '' }: { className?: string }) {
  const fontSize = 1000 / (APP_NAME.length * 0.6);
  const height = fontSize * 0.74;
  return (
    <svg className={`wordmark ${className}`} viewBox={`0 0 1000 ${height}`} role="img" aria-label={APP_NAME}>
      <text x="0" y={height} fontSize={fontSize} textLength="1000" lengthAdjust="spacingAndGlyphs">{APP_NAME}</text>
    </svg>
  );
}
