import type { OrderStatus } from '@/types';
import { ORDER_STATUS_LABEL } from '@/utils/order';

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{ORDER_STATUS_LABEL[status]}</span>;
}
