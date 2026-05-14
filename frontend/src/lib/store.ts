// Ephemeral global frontend state (no backend, no persistence)
import { useSyncExternalStore } from "react";
import blossomImg from "@/assets/kurti-blossom-linen.jpg";
import indigoImg from "@/assets/kurti-indigo-embroidered.jpg";
import sageImg from "@/assets/kurti-sage-garden.jpg";
import goldenImg from "@/assets/kurti-golden-thread.jpg";
import clayImg from "@/assets/kurti-clay-cotton.jpg";
import coralImg from "@/assets/kurti-coral-silk.jpg";

export type Product = {
  id: string;
  name: string;
  subtitle?: string;
  category: "everyday" | "festive" | "floral" | "minimal";
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  rating: number;
  ratingCount: number;
  badge?: "new" | "sale";
  image: string;
  images?: string[];
  colors?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "blossom-linen",
    name: "Blossom Linen Kurti",
    subtitle: "Summer Edition 2026",
    category: "everyday",
    categoryLabel: "Everyday Wear",
    price: 699,
    oldPrice: 999,
    rating: 4.9,
    ratingCount: 128,
    badge: "new",
    image: blossomImg,
    images: [blossomImg, sageImg, clayImg, coralImg],
    colors: ["#D9C2A7", "#0D1A63", "#7E8C5A", "#C95C5C", "#2B3642"],
  },
  {
    id: "indigo-embroidered",
    name: "Indigo Embroidered Kurta",
    category: "festive",
    categoryLabel: "Festive",
    price: 1099,
    oldPrice: 1499,
    rating: 4.7,
    ratingCount: 86,
    badge: "sale",
    image: indigoImg,
    colors: ["#0D1A63", "#1B2B7A"],
  },
  {
    id: "sage-garden",
    name: "Sage Garden Kurti",
    category: "floral",
    categoryLabel: "Floral Prints",
    price: 849,
    rating: 4.8,
    ratingCount: 73,
    image: sageImg,
    colors: ["#7E8C5A", "#D9C2A7"],
  },
  {
    id: "golden-thread",
    name: "Golden Thread Kurti",
    category: "festive",
    categoryLabel: "Festive",
    price: 1299,
    oldPrice: 1799,
    rating: 4.6,
    ratingCount: 54,
    badge: "sale",
    image: goldenImg,
    colors: ["#C9A96E", "#0D1A63"],
  },
  {
    id: "clay-cotton",
    name: "Clay Cotton Kurti",
    category: "minimal",
    categoryLabel: "Minimal",
    price: 599,
    rating: 4.8,
    ratingCount: 91,
    image: clayImg,
    colors: ["#C95C5C", "#D9C2A7"],
  },
  {
    id: "coral-silk",
    name: "Coral Silk Kurti",
    category: "festive",
    categoryLabel: "Festive",
    price: 1499,
    oldPrice: 1999,
    rating: 4.7,
    ratingCount: 47,
    badge: "new",
    image: coralImg,
    colors: ["#E08A8A", "#C9A96E"],
  },
];

// --- Tiny store ---
type State = {
  cartCount: number;
  currentStep: 1 | 2 | 3 | 4;
  deliveryExtra: 0 | 150;
  refApplied: boolean;
  socialApplied: boolean;
};

let state: State = {
  cartCount: 0,
  currentStep: 1,
  deliveryExtra: 0,
  refApplied: false,
  socialApplied: false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const store = {
  get: () => state,
  set: (patch: Partial<State>) => {
    state = { ...state, ...patch };
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => selector(store.get()),
    () => selector(state)
  );
}

export const ITEM_SUBTOTAL = 1798; // PRD: items total 1798

export function calcTotals() {
  const s = store.get();
  const base = ITEM_SUBTOTAL + s.deliveryExtra;
  const refDisc = s.refApplied ? Math.floor(ITEM_SUBTOTAL * 0.05) : 0;
  const socDisc = s.socialApplied ? Math.floor(ITEM_SUBTOTAL * 0.05) : 0;
  const disc = refDisc + socDisc;
  return { items: ITEM_SUBTOTAL, delivery: s.deliveryExtra, disc, total: base - disc };
}
