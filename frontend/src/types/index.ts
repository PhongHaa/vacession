export type Role = 'CUSTOMER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER';
export type SortOption = 'default' | 'popularity' | 'newest' | 'price' | 'price-desc';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount?: number;
}

export interface Variant {
  id: string;
  size: string;
  stock: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  isNew: boolean;
  category: { name: string; slug: string };
  variants: Variant[];
}

export interface ProductDetail extends ProductSummary {
  description: string;
  sizeChart: string | null;
  related: ProductSummary[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  productSlug: string | null;
  size: string;
  image: string | null;
  price: number;
  quantity: number;
}

export interface BankInfo {
  name: string;
  accountNumber: string;
  accountName: string;
}

export interface Order {
  id: string;
  code: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  district: string | null;
  note: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  bank?: BankInfo;
}

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface Settings {
  shippingFee: number;
  shop: { email: string; phone: string; address: string; instagram: string };
}

export interface CheckoutInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items: { variantId: string; quantity: number }[];
}

// ---------- Admin ----------
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  sizeChart: string | null;
  categoryId: string;
  category?: { name: string };
  isActive: boolean;
  isNew: boolean;
  sortOrder: number;
  soldCount: number;
  variants: Variant[];
  createdAt: string;
}

export type ProductInput = Pick<AdminProduct,
  'name' | 'slug' | 'description' | 'price' | 'images' | 'sizeChart' | 'categoryId' | 'isActive' | 'isNew' | 'sortOrder'
> & { variants: { size: string; stock: number }[] };

export type AdminOrderRow = Omit<Order, 'items'> & { _count: { items: number } };

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  totalProducts: number;
  totalCustomers: number;
  unreadMessages: number;
  recentOrders: Omit<Order, 'items'>[];
  daily: DailyStat[];
  periodRevenue: number;
  prevPeriodRevenue: number;
  statusCounts: Record<OrderStatus, number>;
  topProducts: { productId: string | null; name: string; quantity: number; image: string | null }[];
  lowStock: { variantId: string; productId: string; name: string; image: string | null; size: string; stock: number }[];
  lowStockCount: number;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
}

export interface AdminCustomer extends User {
  orderCount: number;
  spent: number;
  lastOrderAt: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}
