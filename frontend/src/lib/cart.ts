// src/lib/cart.ts
// Cart state using the same useSyncExternalStore pattern as the existing store.ts
// Persisted to localStorage so cart survives page refresh.
// Separate from store.ts to avoid coupling checkout step state with cart items.

import { useSyncExternalStore } from 'react';

export interface CartItem {
  productId:     string;    // MongoDB _id
  slug:          string;    // For navigation links
  name:          string;
  price:         number;
  image?:        string;
  quantity:      number;
  size?:         string;
  color?:        string;
  categoryLabel: string;
}

type CartState = { items: CartItem[] };

const CART_KEY = 'yc_cart_v1';

function loadCart(): CartState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [] };
    return JSON.parse(raw) as CartState;
  } catch { return { items: [] }; }
}

let state: CartState = loadCart();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

function persist() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(state));
}

export const cartStore = {
  get: () => state,

  // Add or increment quantity
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    const existing = state.items.find(
      i => i.productId === item.productId && i.size === item.size && i.color === item.color
    );
    if (existing) {
      state = {
        items: state.items.map(i =>
          i === existing ? { ...i, quantity: i.quantity + qty } : i
        ),
      };
    } else {
      state = { items: [...state.items, { ...item, quantity: qty }] };
    }
    persist(); emit();
  },

  // Decrement quantity — removes item if quantity reaches 0
  removeItem: (productId: string, size?: string, color?: string) => {
    state = {
      items: state.items
        .map(i =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0),
    };
    persist(); emit();
  },

  // Set quantity directly (e.g. typing in input field)
  setQuantity: (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      state = {
        items: state.items.filter(
          i => !(i.productId === productId && i.size === size && i.color === color)
        ),
      };
    } else {
      state = {
        items: state.items.map(i =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        ),
      };
    }
    persist(); emit();
  },

  // Remove entire line item
  deleteLine: (productId: string, size?: string, color?: string) => {
    state = {
      items: state.items.filter(
        i => !(i.productId === productId && i.size === size && i.color === color)
      ),
    };
    persist(); emit();
  },

  clearCart: () => { state = { items: [] }; persist(); emit(); },

  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
};

// ── React hook ─────────────────────────────────────────────────────────
export function useCart() {
  const items = useSyncExternalStore(
    cb => cartStore.subscribe(cb),
    () => cartStore.get().items,
    () => [] as CartItem[]
  );

  const count    = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return { items, count, subtotal };
}
