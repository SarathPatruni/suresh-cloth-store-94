import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "suresh.cart.v1";

const keyOf = (i: Pick<CartItem, "id" | "size" | "color">) =>
  `${i.id}__${i.size ?? ""}__${i.color ?? ""}`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const k = keyOf(item);
      const existing = prev.find((p) => keyOf(p) === k);
      if (existing) {
        return prev.map((p) =>
          keyOf(p) === k ? { ...p, quantity: p.quantity + qty } : p,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (key) =>
    setItems((prev) => prev.filter((p) => keyOf(p) !== key));

  const updateQty: CartContextValue["updateQty"] = (key, qty) =>
    setItems((prev) =>
      prev
        .map((p) => (keyOf(p) === key ? { ...p, quantity: Math.max(1, qty) } : p))
        .filter((p) => p.quantity > 0),
    );

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, removeItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const cartItemKey = keyOf;
