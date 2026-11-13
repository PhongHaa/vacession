import { useFetch } from '@/hooks/useFetch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/format';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';

export default function AdminMessagesPage() {
  useDocumentTitle('Liên hệ');
  const { data, loading, error, setData } = useFetch(adminService.messages);

  const markRead = async (id: string) => {
    const updated = await adminService.markMessageRead(id);
    setData((list) => list?.map((m) => (m.id === id ? updated : m)) ?? null);
  };

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <>
      <h1 className="admin-title">Liên hệ</h1>
      {!data?.length ? <p className="muted">Chưa có tin nhắn.</p> : (
        <ul className="message-list">
          {data.map((m) => (
            <li key={m.id} className={`admin-panel message ${m.isRead ? '' : 'unread'}`}>
              <div className="message__head">
                <strong>{m.name}</strong>
                <span className="muted small">{formatDate(m.createdAt)}</span>
              </div>
              <div className="muted small">
                <a href={`mailto:${m.email}`}>{m.email}</a>{m.phone && <> · <a href={`tel:${m.phone}`}>{m.phone}</a></>}
              </div>
              <p className="pre-line">{m.message}</p>
              {!m.isRead && <button className="btn btn-secondary btn-sm" onClick={() => markRead(m.id)}>Đánh dấu đã đọc</button>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
