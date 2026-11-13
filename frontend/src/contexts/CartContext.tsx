import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '@/types';

const STORAGE_KEY = 'vacession_cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // trình duyệt chặn localStorage -> giỏ hàng chỉ tồn tại trong phiên
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const clamp = (qty: number, max: number) => Math.max(0, Math.min(qty, max));
    return {
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (item, quantity) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.variantId === item.variantId);
          if (!existing) return [...prev, { ...item, quantity: clamp(quantity, item.maxStock) }];
          return prev.map((i) =>
            i.variantId === item.variantId
              ? { ...i, ...item, quantity: clamp(i.quantity + quantity, item.maxStock) }
              : i,
          );
        }),
      updateQuantity: (variantId, quantity) =>
        setItems((prev) =>
          prev
            .map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(quantity, i.maxStock) } : i))
            .filter((i) => i.quantity > 0),
        ),
      removeItem: (variantId) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return ctx;
}
