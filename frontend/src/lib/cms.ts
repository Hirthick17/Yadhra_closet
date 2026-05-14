// Lightweight frontend CMS: localStorage-persisted site content + admin auth.
// Admin auth uses the real backend JWT — no hardcoded credentials.
import { useSyncExternalStore } from "react";
import { apiFetch, setAccessToken } from "./api";
import { PRODUCTS as SEED_PRODUCTS, type Product } from "./store";

export type NavLink = { label: string; to: string };
export type FooterColumn = { title: string; links: string[] };
export type HeroStat = { n: string; l: string };
export type Review = { name: string; city: string; product: string; initial: string; text: string };
export type FAQItem = { q: string; a: string };

export type SectionToggles = {
  categories: boolean;
  newArrivals: boolean;
  highlyRated: boolean;
  reviews: boolean;
  brandStory: boolean;
};

export type CmsContent = {
  ticker: { enabled: boolean; messages: string[] };
  nav: { brand: string; links: NavLink[] };
  footer: { tagline: string; columns: FooterColumn[]; copyright: string };
  home: {
    hero: {
      eyebrow: string;
      titleTop: string;
      titleBottom: string;
      body: string;
      cta1: string;
      cta2: string;
      stats: HeroStat[];
    };
    sections: SectionToggles;
    brandStory: {
      eyebrow: string;
      quote: string;
      body: string;
      founderName: string;
      founderRole: string;
      yearsBadge: string;
    };
    reviews: Review[];
  };
  faq: { title: string; items: FAQItem[] };
  products: Product[];
};

const DEFAULT: CmsContent = {
  ticker: {
    enabled: true,
    messages: ["✨ New Summer Collection", "Free Delivery ₹599+", "Festive 30% Off", "FRIEND5 — 5% Off"],
  },
  nav: {
    brand: "Yadhra Closet",
    links: [
      { label: "Categories", to: "/#categories" },
      { label: "All Kurtis", to: "/catalog" },
      { label: "Hot Sales 🔥", to: "/#hot" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  footer: {
    tagline: "Editorial kurtis for the modern Indian woman. Made with love in Chennai.",
    columns: [
      { title: "Shop",  links: ["New Arrivals", "Everyday Wear", "Festive Collection", "Hot Sales"] },
      { title: "Help",  links: ["FAQ", "Returns"] },
      { title: "About", links: ["Our Story", "Contact"] },
    ],
    copyright: "© 2026 Yadhra Closet. All rights reserved.",
  },
  home: {
    hero: {
      eyebrow: "Summer 2026 Collection",
      titleTop: "Effortless kurtis,",
      titleBottom: "made for you.",
      body: "Editorial silhouettes, breathable fabrics, and prints inspired by Chennai's coastal mornings.",
      cta1: "Shop Now",
      cta2: "Learn More",
      stats: [
        { n: "1.2k+", l: "Customers" },
        { n: "4.9★", l: "Avg Rating" },
        { n: "85+", l: "Designs" },
      ],
    },
    sections: { categories: true, newArrivals: true, highlyRated: true, reviews: true, brandStory: true },
    brandStory: {
      eyebrow: "Our Story",
      quote: "\"Born from a simple question — why can't everyday wear just feel good?\"",
      body: "Yadhra Closet started in a small Chennai studio with one rule: every kurti must feel as good as it looks. We work with breathable fabrics, small-batch tailoring, and prints that nod to South Indian summers.",
      founderName: "Yadhra",
      founderRole: "Founder & Chief Designer · Chennai",
      yearsBadge: "3",
    },
    reviews: [
      { name: "Priya S.", city: "Chennai", product: "Blossom Linen Kurti", initial: "P", text: "The fabric is so breathable and the cut is just perfect for office. I've already ordered three more!" },
      { name: "Ananya R.", city: "Bangalore", product: "Indigo Embroidered Kurta", initial: "A", text: "Genuinely premium. The embroidery is delicate and the colour is true to the photos." },
      { name: "Meera K.", city: "Hyderabad", product: "Sage Garden Kurti", initial: "M", text: "Loved the packaging. Felt like opening a gift to myself. Will buy again for festive season." },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      { q: "What is your return policy?", a: "Easy 7-day returns on all unworn items with original tags. Reach out via WhatsApp or email and we'll arrange a free pickup." },
      { q: "How long does delivery take?", a: "Standard delivery is 4–6 business days across India. Choose Fast Delivery at checkout for 1–2 day shipping (+₹150)." },
      { q: "Do you have a size guide?", a: "Yes — every product page includes detailed measurements. When in doubt, size up; our cuts are designed for ease of movement." },
      { q: "Do you ship internationally?", a: "Currently we ship within India only. International shipping is on the roadmap for late 2026." },
      { q: "How do I care for my kurti?", a: "We recommend a gentle cold-water hand wash and air drying in shade. Iron on low heat. Avoid harsh detergents to preserve color and fabric." },
    ],
  },
  products: SEED_PRODUCTS,
};

const KEY_CONTENT = "yc_cms_content_v2";  // bumped v1→v2: footer columns updated (T-02)
const KEY_AUTH = "yc_cms_auth_v1";

function load(): CmsContent {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY_CONTENT);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<CmsContent>;
    // Merge with defaults so new fields don't break.
    return { ...DEFAULT, ...parsed, products: parsed.products ?? DEFAULT.products };
  } catch {
    return DEFAULT;
  }
}

function loadAuth(): boolean {
  // isAdmin is never derived from localStorage — it must come from a valid JWT.
  // This stub returns false unconditionally; the real session is restored
  // via cms.restoreSession() called from the root component on mount.
  return false;
}

type State = { content: CmsContent; isAdmin: boolean; sessionChecked: boolean };
// isAdmin always starts false — restored via restoreSession() on app mount,
// never from localStorage, so a console trick cannot grant admin access.
// sessionChecked starts false — admin.index.tsx waits for this before enforcing redirect.
let state: State = { content: load(), isAdmin: false, sessionChecked: false };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_CONTENT, JSON.stringify(state.content));
  } catch {}
}

export const cms = {
  get: () => state,
  setContent: (updater: (c: CmsContent) => CmsContent) => {
    state = { ...state, content: updater(state.content) };
    persist();
    emit();
  },
  reset: () => {
    state = { ...state, content: DEFAULT };
    persist();
    emit();
  },
  // ── Real backend login ─────────────────────────────────────────────────
  // WHY async: must await the POST /api/auth/login network call.
  // Returns true if login succeeded AND user has admin role.
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiFetch<{
        success: boolean;
        accessToken: string;
        user: { id: string; name: string; email: string; role: string };
      }>('/auth/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
      });

      if (!data.success || data.user.role !== 'admin') {
        // Logged in but not an admin account — reject silently
        return false;
      }

      setAccessToken(data.accessToken);    // Store in module memory via api.ts
      state = { ...state, isAdmin: true }; // Derived from real JWT role
      // WHY no localStorage: removing the flag means console tricks cannot
      // grant admin access — isAdmin only becomes true via this code path.
      emit();
      return true;
    } catch {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with client-side cleanup even if server call fails
    }
    setAccessToken(null);
    state = { ...state, isAdmin: false };
    emit();
  },

  // ── Restore admin session on page load ─────────────────────────────────
  // Called from the root component on mount. Silently exchanges the
  // httpOnly refreshToken cookie for a new accessToken. If the cookie is
  // absent or expired, isAdmin stays false — no login prompt is forced.
  restoreSession: async (): Promise<void> => {
    try {
      const data = await apiFetch<{
        success: boolean;
        accessToken: string;
        user: { id: string; name: string; email: string; role: string };
      }>('/auth/refresh', { method: 'POST' });

      if (data.success && data.user.role === 'admin') {
        setAccessToken(data.accessToken);
        state = { ...state, isAdmin: true, sessionChecked: true };
        emit();
        return;
      }
    } catch {
      // No valid session — state.isAdmin stays false. Normal for public users.
    }
    // Always mark session check as done — success or failure.
    // The guard in admin.index.tsx relies on this to know it can redirect.
    state = { ...state, sessionChecked: true };
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useCms<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => cms.subscribe(cb),
    () => selector(cms.get()),
    () => selector(state)
  );
}

export const CMS_DEFAULT = DEFAULT;
