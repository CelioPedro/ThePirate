import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "../types";

interface CartContextValue {
  items: Product[];
  isOpen: boolean;
  itemCount: number;
  totalCents: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    itemCount: items.length,
    totalCents: items.reduce((acc, item) => acc + item.priceCents, 0),
    openCart() {
      setIsOpen(true);
    },
    closeCart() {
      setIsOpen(false);
    },
    addItem(product) {
      setItems((current) => [...current, product]);
      setIsOpen(true);
    },
    removeItem(productId) {
      setItems((current) => {
        const index = current.findIndex((item) => item.id === productId);
        if (index < 0) return current;
        return current.filter((_, itemIndex) => itemIndex !== index);
      });
    },
    clear() {
      setItems([]);
      setIsOpen(false);
    }
  }), [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
