import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage({ message }: { message?: string }) {
  useDocumentTitle('Không tìm thấy');
  return (
    <div className="container section narrow center">
      <h1 className="page-title">404</h1>
      <p>{message ?? 'Không tìm thấy trang bạn yêu cầu.'}</p>
      <Link to="/shop" className="btn btn-primary btn-md">Return to Shop</Link>
    </div>
  );
}
