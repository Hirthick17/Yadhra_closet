# Yadhra Closet — Complete Architecture & Coding Patterns Report

## 📋 Executive Summary

**Yadhra Closet** is a modern e-commerce template for Indian fashion (specifically kurtis). It's built as a **full-stack template** using cutting-edge frontend technologies with an intentionally **frontend-only architecture** (no backend currently). This report details:

- Technology stack & build system
- Project architecture patterns
- React component structure & conventions
- State management approach
- Data models & CMS system
- Routing strategy
- Styling methodology
- How to build a backend to complement this frontend

---

## 🏗️ Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js + Bun | Latest | Package manager & runtime |
| **Framework** | TanStack React Router v1 | 1.168.0 | File-based routing & SSR-ready |
| **React** | React + React JSX | 18+ | UI library |
| **Build Tool** | Vite | Latest | Ultra-fast bundler with HMR |
| **Language** | TypeScript | ES2022 | Type-safe development |
| **Styling** | Tailwind CSS v4 | 4.2.1 | Utility-first CSS |
| **Forms** | React Hook Form | 7.0+ | Form state management |
| **UI Components** | Radix UI | Latest | Headless accessible components |
| **Data Queries** | TanStack Query (React Query) | 5.83.0 | Server state management |
| **Icons** | Lucide React | Latest | Icon library |
| **HTTP Client** | TanStack Start built-in | Internal | Fetch wrapper |
| **Deployment** | Cloudflare Workers | Via Vite plugin | Serverless edge deployment |

### Package.json Key Dependencies

```json
{
  "@tanstack/react-router": "^1.168.0",
  "@tanstack/react-start": "^1.167.14",
  "@tanstack/react-query": "^5.83.0",
  "react": "^18+",
  "@tailwindcss/vite": "^4.2.1",
  "@radix-ui/*": "Latest versions",
  "@hookform/resolvers": "^5.2.2",
  "react-hook-form": "^7.0+",
  "@cloudflare/vite-plugin": "^1.25.5"
}
```

---

## 📁 Project Structure

### Directory Layout

```
yadhra-closet-template-main/
├── src/
│   ├── routes/                 # File-based routing (auto-generated)
│   │   ├── __root.tsx         # Root layout & 404 handler
│   │   ├── index.tsx          # Home page
│   │   ├── catalog.tsx        # Product listing
│   │   ├── product.$id.tsx    # Product detail (dynamic)
│   │   ├── checkout.tsx       # Cart & checkout flow
│   │   ├── success.tsx        # Order success page
│   │   ├── faq.tsx            # FAQ page
│   │   ├── admin.login.tsx    # Admin login
│   │   └── admin.index.tsx    # Admin dashboard
│   ├── components/            # React components
│   │   ├── SiteShell.tsx      # Layout wrapper
│   │   ├── Navbar.tsx         # Header/navigation
│   │   ├── Footer.tsx         # Footer
│   │   ├── ProductCard.tsx    # Product card component
│   │   ├── Ticker.tsx         # Top ticker banner
│   │   └── ui/                # Radix UI wrapper components
│   ├── hooks/                 # Custom React hooks
│   │   └── use-mobile.tsx     # Mobile detection hook
│   ├── lib/                   # Utilities & state management
│   │   ├── store.ts           # Frontend state (Zustand-like pattern)
│   │   ├── cms.ts             # CMS system + admin
│   │   └── utils.ts           # Helper functions
│   ├── assets/                # Static images & media
│   ├── styles.css             # Global styles
│   ├── router.tsx             # Router configuration
│   └── routeTree.gen.ts       # Auto-generated route manifest
├── vite.config.ts             # Vite bundler config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
└── wrangler.jsonc             # Cloudflare deployment config
```

---

## 🎯 Application Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │         UI Layer (React Components)               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │ SiteShell  │  │  Navbar    │  │   Footer   │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘ │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │   Page Components (Routes)                 │ │   │
│  │  │   - Home, Catalog, ProductDetail, etc      │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │    State Management Layer                         │   │
│  │  ┌──────────────┐      ┌─────────────────────┐  │   │
│  │  │ store.ts     │      │ cms.ts (CMS + Auth) │  │   │
│  │  │ (Cart, UI)   │      │ (Content, Admin)    │  │   │
│  │  └──────────────┘      └─────────────────────┘  │   │
│  │  └─ useSyncExternalStore (React 18 Hook)       │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Routing Layer (TanStack Router)                │   │
│  │  - File-based routing                            │   │
│  │  - SSR-ready metadata                            │   │
│  │  - Server-side loaders                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │
         │ (Currently localStorage only)
         │
┌─────────────────────────────────────────────────────────┐
│              LOCAL STORAGE (Frontend Data)              │
│  - CMS content (site text, images, sections)            │
│  - Admin auth state                                     │
│  - Cart state (cartCount)                               │
│  - Checkout state (currentStep)                         │
└─────────────────────────────────────────────────────────┘
```

### Current Data Flow

```
User Action (Click) 
    ↓
React Component Event Handler
    ↓
State Update (store.set() or cms.set())
    ↓
localStorage Update
    ↓
useSyncExternalStore Hook Trigger
    ↓
Component Re-render
    ↓
Updated UI
```

---

## 🎨 React Component Architecture

### Component Hierarchy

#### 1. **Layout Components** (Shell/Wrapper)

**File:** [src/components/SiteShell.tsx](src/components/SiteShell.tsx)

```tsx
<SiteShell>
  ├── <Ticker /> (top banner)
  ├── <Navbar /> (header/nav)
  ├── <main> (page content)
  └── <Footer /> (footer)
</SiteShell>
```

**Purpose:** Wraps all pages with consistent layout structure.

#### 2. **Page Components** (Routes)

Located in `src/routes/` with automatic file-based routing:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `index.tsx` | Home page with hero, categories, reviews |
| `/catalog` | `catalog.tsx` | Product listing with filters |
| `/product/$id` | `product.$id.tsx` | Product detail page |
| `/checkout` | `checkout.tsx` | Multi-step checkout flow |
| `/success` | `success.tsx` | Order confirmation |
| `/faq` | `faq.tsx` | FAQ page |
| `/admin/login` | `admin.login.tsx` | Admin authentication |
| `/admin` | `admin.index.tsx` | Admin dashboard (CMS) |

#### 3. **Feature Components**

**ProductCard.tsx** — Reusable product card
- Used in: Home page, Catalog page, Highly Rated section
- Props: `product: Product`
- Features: Wishlist toggle, pricing display, badges

**Navbar.tsx** — Navigation header
- Shows cart count from store
- CMS-driven navigation links
- Responsive mobile detection
- Active link styling

**Footer.tsx** — Footer section
- CMS-driven columns & links
- Brand tagline & copyright

**Ticker.tsx** — Scrolling banner
- CMS-driven messages
- Auto-scroll animation

#### 4. **UI Components** (Radix UI Wrappers)

Located in `src/components/ui/`:

```
accordion.tsx, alert.tsx, badge.tsx, button.tsx,
card.tsx, dialog.tsx, dropdown-menu.tsx, form.tsx,
input.tsx, label.tsx, pagination.tsx, select.tsx,
slider.tsx, tabs.tsx, textarea.tsx, etc.
```

These wrap Radix UI primitives with Tailwind styling for consistency.

---

## 💾 State Management Pattern

### Architecture: Frontend-Only with localStorage

The app uses a **custom lightweight state management** based on **React's `useSyncExternalStore`** hook (React 18+) without external libraries like Redux or Zustand.

### Store Implementation (store.ts)

```typescript
// Type definition
export type StoreState = {
  cartCount: number;
  currentStep: 1 | 2 | 3 | 4;  // Checkout steps
};

// Store state + subscriber management
const storeState: StoreState = {
  cartCount: 0,
  currentStep: 1
};

const subscribers = new Set<() => void>();

// Core methods
export const store = {
  get: () => storeState,
  set: (partial: Partial<StoreState>) => {
    storeState = { ...storeState, ...partial };
    subscribers.forEach(fn => fn());  // Notify all subscribers
  }
};

// Hook for components
export function useStore<T>(
  selector: (state: StoreState) => T
): T {
  return useSyncExternalStore(
    (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    () => selector(storeState)
  );
}

// Usage in components
const cartCount = useStore((s) => s.cartCount);
store.set({ cartCount: 5 });  // Update
```

### CMS System (cms.ts)

A lightweight CMS built on the same pattern:

```typescript
export type CmsContent = {
  ticker: { enabled: boolean; messages: string[] };
  nav: { brand: string; links: NavLink[] };
  footer: { tagline: string; columns: FooterColumn[] };
  home: { hero: HeroData; sections: SectionToggles; ... };
  faq: { title: string; items: FAQItem[] };
  products: Product[];
};

const cms = {
  get: () => ({ content, isAdmin }),
  set: (partial) => { /* ... */ },
  login: (user, pass) => { /* validate */ },
  logout: () => { /* ... */ }
};

const useCms = (selector) => useSyncExternalStore(/* ... */);
```

**Admin Credentials:** `admin / yadhra2026` (hardcoded for demo)

### Data Persistence

- **localStorage Key:** `yadhra-cms-v1`
- **Store Data:** Persists across sessions automatically
- **Admin Auth:** Session-based (cleared on logout or page reload)

---

## 🔀 Routing Architecture

### TanStack Router Configuration

**File:** [src/router.tsx](src/router.tsx)

#### File-Based Routing Convention

Routes automatically generated from file structure:

```
src/routes/
├── __root.tsx           → Root layout
├── index.tsx            → /
├── catalog.tsx          → /catalog
├── product.$id.tsx      → /product/:id
├── checkout.tsx         → /checkout
├── success.tsx          → /success
├── faq.tsx              → /faq
├── admin.login.tsx      → /admin/login
└── admin.index.tsx      → /admin
```

#### Root Route Structure

```tsx
export const Route = createRootRoute({
  head: () => ({
    meta: [/* SEO meta tags */],
    links: [/* fonts, stylesheets */]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
```

#### Dynamic Routes

**Product Detail** — Dynamic ID parameter:

```tsx
export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
  loader: ({ params }) => {
    const product = cms.get().content.products.find(p => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.product.name} — Yadhra Closet` }
    ]
  })
});
```

#### Navigation Methods

```tsx
// Link component
<Link to="/product/$id" params={{ id: "blossom-linen" }}>
  View Product
</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: "/checkout" });

// With search params
<Link to="/catalog" search={{ cat: "festive" }}>
  Festive Collection
</Link>
```

---

## 🎨 Styling System

### Tailwind CSS v4 with Custom Theme

**Configuration:** Defined via Tailwind's built-in customization

#### Color Palette

```css
/* Brand Colors */
--deep-blue: #0D1A63        (Primary)
--accent-blue: #1B3BA6      (Secondary)
--sale: #E63946             (Sale/Alert)
--success: #28A745          (Success)
--gold: #D4AF37             (Rating stars)

/* Neutral Colors */
--background: #FFFFFF
--secondary-bg: #F8F9FB
--border-grey: #E0E0E0
--text-muted: #6B7280
```

#### Utility Classes Used

- **Spacing:** `px-5`, `py-20`, `gap-4`, `mt-6`
- **Typography:** `font-serif`, `text-[22px]`, `tracking-wide`
- **Layout:** `flex`, `grid`, `max-w-[1400px]`, `mx-auto`
- **Responsive:** `md:px-10`, `lg:grid-cols-4`
- **Effects:** `rounded-[18px]`, `shadow-xl`, `hover:scale-105`
- **Transitions:** `transition-transform duration-500`

#### Custom Component Classes

```css
/* Navigation underline effect */
.nav-underline {
  @apply relative;
}
.nav-underline[data-active="true"]::after {
  @apply absolute bottom-0 left-0 right-0 h-0.5 bg-deep-blue;
}

/* Spring animation timing */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 📊 Data Models

### Product Type

```typescript
export type Product = {
  id: string;                    // Unique identifier
  name: string;                  // Product name
  subtitle?: string;             // Optional subtitle
  category: "everyday" | "festive" | "floral" | "minimal";
  categoryLabel: string;         // Display label
  price: number;                 // Current price (₹)
  oldPrice?: number;             // Original price (for discounts)
  rating: number;                // Average rating (0-5)
  ratingCount: number;           // Number of reviews
  badge?: "new" | "sale";        // Badge type
  image: string;                 // Main image URL
  images?: string[];             // Gallery images
  colors?: string[];             // Hex color codes
};

// Example
const blossom = {
  id: "blossom-linen",
  name: "Blossom Linen Kurti",
  category: "everyday",
  price: 699,
  oldPrice: 999,
  rating: 4.9,
  ratingCount: 128,
  badge: "new",
  image: "kurti-blossom-linen.jpg",
  colors: ["#D9C2A7", "#0D1A63", "#7E8C5A"]
};
```

### CMS Content Structure

```typescript
export type CmsContent = {
  // Top ticker
  ticker: {
    enabled: boolean;
    messages: string[];
  };
  
  // Navigation
  nav: {
    brand: string;
    links: Array<{ label: string; to: string }>;
  };
  
  // Footer
  footer: {
    tagline: string;
    columns: Array<{ title: string; links: string[] }>;
    copyright: string;
  };
  
  // Home page sections
  home: {
    hero: {
      eyebrow: string;
      titleTop: string;
      titleBottom: string;
      body: string;
      cta1: string;
      cta2: string;
      stats: Array<{ n: string; l: string }>;
    };
    sections: {
      categories: boolean;
      newArrivals: boolean;
      highlyRated: boolean;
      reviews: boolean;
      brandStory: boolean;
    };
    brandStory: { /* ... */ };
    reviews: Array<{ name, city, product, initial, text }>;
  };
  
  // FAQ page
  faq: {
    title: string;
    items: Array<{ q: string; a: string }>;
  };
  
  // Products catalog
  products: Product[];
};
```

---

## 🔄 Data Flow Examples

### Example 1: Home Page Load

```
User visits /
    ↓
TanStack Router matches index.tsx route
    ↓
Component renders:
  - useCms(s => s.content.home.hero) → Gets hero data
  - useCms(s => s.content.products) → Gets all products
  - useSyncExternalStore notifies subscribers
    ↓
useStore(s => s.cartCount) → Displays cart badge
    ↓
Page renders with CMS data + state
    ↓
If user edits in admin, cms.set() updates both
    - localStorage updates
    - All subscribed components re-render
```

### Example 2: Add to Cart

```
User clicks "Add to Cart" on ProductCard
    ↓
onClick handler → store.set({ cartCount: count + 1 })
    ↓
Zustand-pattern store updates internal state
    ↓
Calls all subscribers (triggers re-renders)
    ↓
Navbar component: useStore(s => s.cartCount) re-renders
    ↓
Cart badge updates with new count
    ↓
State persists in localStorage (for next session)
```

### Example 3: Product Detail Page

```
User navigates to /product/blossom-linen
    ↓
TanStack Router matches product.$id.tsx
    ↓
Loader function runs:
  - cms.get().content.products.find(p => p.id === "blossom-linen")
  - Returns product object
    ↓
Component receives loaderData
    ↓
Renders product gallery, pricing, options
    ↓
User selects size/color → local useState updates
    ↓
Click "Buy Now" → store.set(), navigate to /checkout
```

---

## 🔐 Admin CMS System

### Admin Authentication Flow

**Location:** [src/routes/admin.login.tsx](src/routes/admin.login.tsx)

```tsx
// Demo credentials
Username: admin
Password: yadhra2026

// Flow
1. User submits form
2. cms.login(username, password) validates
3. If valid: cms.set({ isAdmin: true })
4. Redirect to /admin dashboard
5. Admin can edit:
   - Ticker messages
   - Navigation links
   - Footer content
   - Hero section text
   - Section toggles
   - FAQ items
   - Product listings
```

### Admin Dashboard

**Location:** [src/routes/admin.index.tsx](src/routes/admin.index.tsx)

Features:
- Edit site content (hero, footer, nav)
- Toggle sections on/off
- Manage products
- Edit CMS directly
- Changes persist in localStorage

---

## 📦 Component Pattern Examples

### Example 1: ProductCard Component

```tsx
// src/components/ProductCard.tsx
import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/store";
import { useState } from "react";
import { Heart } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block bg-white border border-border-grey rounded-[18px] 
                 overflow-hidden transition-all duration-[350ms] 
                 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(13,26,99,0.25)]"
    >
      {/* Image with badge */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary-bg">
        <img src={product.image} alt={product.name} loading="lazy" 
             className="w-full h-full object-cover transition-transform 
                       duration-500 group-hover:scale-[1.06]" />
        
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] 
                          font-bold uppercase rounded-full text-white 
                          ${product.badge === "new" ? "bg-deep-blue" : "bg-sale"}`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist button (appears on hover) */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 
                     flex items-center justify-center opacity-0 
                     group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-sale text-sale" : "text-accent-blue"}`} />
        </button>
      </div>

      {/* Product info */}
      <div className="p-4">
        <p className="text-[9px] uppercase tracking-[0.14em] text-text-muted">
          {product.categoryLabel}
        </p>
        <h3 className="font-serif text-[17px] font-semibold mt-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
          <span>⭐ {product.rating}</span>
          <span>({product.ratingCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-bold text-[17px]">₹{product.price}</span>
          {product.oldPrice && (
            <>
              <span className="text-[12px] line-through text-text-muted">
                ₹{product.oldPrice}
              </span>
              <span className="text-[10px] font-semibold text-success">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
```

### Example 2: Navbar Component

```tsx
// src/components/Navbar.tsx
import { Link, useLocation } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useCms } from "@/lib/cms";
import { Search, ShoppingBag, User } from "lucide-react";

export function Navbar() {
  const cartCount = useStore((s) => s.cartCount);  // Get state
  const { brand, links } = useCms((s) => s.content.nav);  // Get CMS content
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border-grey">
      <nav className="max-w-[1400px] mx-auto h-16 px-5 md:px-10 
                      flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span className="w-[38px] h-[38px] rounded-lg bg-deep-blue 
                          text-white font-serif text-base font-semibold 
                          flex items-center justify-center">
            YC
          </span>
          <span className="font-serif text-[22px] tracking-tight">
            {brand}
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-9 text-[13px] 
                       text-accent-blue font-medium">
          {links.map((l) =>
            l.to.startsWith("/#") ? (
              <a key={l.label} href={l.to} className="nav-underline">
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className="nav-underline"
                data-active={pathname === l.to}
              >
                {l.label}
              </Link>
            )
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5 text-accent-blue">
          <Link to="/catalog" aria-label="Search">
            <Search className="w-[18px] h-[18px]" />
          </Link>
          
          {/* Cart with badge */}
          <Link to="/checkout" aria-label="Cart" className="relative">
            <ShoppingBag className="w-[18px] h-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 
                             rounded-full bg-deep-blue text-white 
                             text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button aria-label="Account">
            <User className="w-[18px] h-[18px]" />
          </button>
        </div>
      </nav>
    </header>
  );
}
```

### Example 3: Home Page (Index Route)

```tsx
// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { useCms } from "@/lib/cms";

export const Route = createFileRoute("/")({ 
  component: Home 
});

function Home() {
  // Get data from CMS
  const products = useCms((s) => s.content.products);
  const hero = useCms((s) => s.content.home.hero);
  const sections = useCms((s) => s.content.home.sections);

  return (
    <SiteShell>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center">
        <img
          src={heroImg}
          alt="Summer kurti"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 
                        bg-gradient-to-r from-white/95 via-white/70 to-white/10" />
        
        <div className="relative max-w-[1400px] w-full mx-auto px-5 md:px-10">
          <div className="max-w-md">
            <p className="text-[10px] font-bold uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="font-serif text-[clamp(40px,5vw,68px)] mt-4">
              {hero.titleTop}
              <br />
              <span className="italic font-light">{hero.titleBottom}</span>
            </h1>
            <p className="text-[15px] mt-5">{hero.body}</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION (Toggleable) */}
      {sections.categories && (
        <section className="max-w-[1400px] mx-auto px-5 md:px-10 py-20">
          <h2 className="font-serif text-4xl mb-8">
            Shop by <span className="italic">Category</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to="/catalog"
                search={{ cat: c.id }}
                className="relative rounded-[18px] min-h-[220px] overflow-hidden"
              >
                <img src={c.img} alt={c.name} 
                     className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-5 left-5 text-white">
                  <h3 className="font-serif text-2xl">{c.name}</h3>
                  <p className="text-[11px]">{c.count} designs</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {sections.newArrivals && (
        <section className="bg-secondary-bg py-20">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10">
            <h2 className="font-serif text-4xl mb-8">
              New <span className="italic">Arrivals</span>
            </h2>
            <div className="flex gap-5 overflow-x-auto">
              {products.map((p) => (
                <div key={p.id} className="w-[240px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
```

---

## 🚀 Building the Backend

### Current Limitations (Frontend-Only)

The current implementation uses:
- **localStorage** for data persistence
- **Hardcoded products** in `store.ts`
- **Admin auth** with hardcoded credentials
- **No database connection**
- **No API integration**

### Required Backend APIs

To build a production-ready backend, implement these endpoints:

#### 1. **Authentication API**

```
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}
→ { "token": "jwt", "user": {...} }

POST /api/auth/logout
→ { "success": true }

GET /api/auth/me
→ { "user": {...} }
```

#### 2. **Products API**

```
GET /api/products
Query params: ?category=everyday&sort=price&limit=20
→ { "products": [...], "total": 100 }

GET /api/products/:id
→ { "product": {...} }

POST /api/products (admin only)
{
  "name": "New Kurti",
  "price": 999,
  "category": "festive",
  ...
}
→ { "product": {...} }

PUT /api/products/:id (admin only)
PATCH /api/products/:id (admin only)
DELETE /api/products/:id (admin only)
```

#### 3. **CMS API**

```
GET /api/cms/content
→ { "content": { ticker, nav, footer, home, faq, products } }

PUT /api/cms/content (admin only)
{ "ticker": {...}, "nav": {...}, ... }
→ { "content": {...} }

GET /api/cms/sections
→ { "sections": { categories: true, newArrivals: true, ... } }

PUT /api/cms/sections/:sectionName (admin only)
{ "enabled": false }
```

#### 4. **Orders API**

```
POST /api/orders
{
  "items": [{ "productId": "...", "quantity": 1, "size": "M" }],
  "address": {...},
  "paymentMethod": "card"
}
→ { "order": {...}, "paymentUrl": "..." }

GET /api/orders/:orderId
GET /api/orders (admin - all orders)

PUT /api/orders/:orderId/status (admin only)
{ "status": "shipped" }
```

#### 5. **Reviews API**

```
POST /api/products/:id/reviews
{
  "rating": 5,
  "text": "Great product!",
  "name": "John"
}
→ { "review": {...} }

GET /api/products/:id/reviews
→ { "reviews": [...] }
```

### Backend Technology Recommendations

| Aspect | Recommendation | Alternative |
|--------|---|---|
| **Language** | TypeScript | Python, Go, Rust |
| **Framework** | Express.js / Fastify | Nest.js, Hono, Remix |
| **Database** | PostgreSQL + Prisma | MongoDB, Supabase |
| **Auth** | JWT + bcrypt | OAuth2, Sessions |
| **File Storage** | Cloudflare R2 / S3 | Local filesystem |
| **Deployment** | Cloudflare Workers / Hono | Vercel, Railway, Fly.io |
| **API Style** | REST | GraphQL |

### Example Backend Integration (Next.js/Hono)

```typescript
// Backend: /api/products
import { Hono } from 'hono';
import { db } from './db';

const app = new Hono();

app.get('/api/products', async (c) => {
  const category = c.req.query('category');
  const products = await db.product.findMany({
    where: category ? { category } : {},
    take: 20,
  });
  return c.json({ products });
});

export default app;

// Frontend: Update store to use API
import { useQuery } from '@tanstack/react-query';

function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    }
  });
}
```

### Migration Strategy

1. **Phase 1:** Deploy backend API endpoints
2. **Phase 2:** Replace localStorage calls with API calls
3. **Phase 3:** Implement error handling & loading states
4. **Phase 4:** Add real payment integration (Razorpay, Stripe)
5. **Phase 5:** Implement admin content management dashboard

---

## 🔧 Development Workflow

### Environment Setup

```bash
# Install dependencies
bun install

# Development server with HMR
bun run dev

# Production build
bun run build

# Build for dev environment
bun run build:dev

# Linting
bun run lint

# Code formatting
bun run format
```

### File-Based Routing

Routes automatically generated from `src/routes/` directory structure:

```
src/routes/index.tsx → /
src/routes/catalog.tsx → /catalog
src/routes/product.$id.tsx → /product/:id
src/routes/admin.login.tsx → /admin/login
```

### Adding a New Route

1. Create file in `src/routes/`
2. Export route with `createFileRoute`
3. Route automatically available

```tsx
// src/routes/new-page.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/new-page")({
  component: NewPage
});

function NewPage() {
  return <div>New Page</div>;
}
```

### Adding a New Component

1. Create in `src/components/`
2. Import and use in routes

```tsx
// src/components/NewComponent.tsx
export function NewComponent() {
  return <div>Component</div>;
}

// In route:
import { NewComponent } from "@/components/NewComponent";
```

### Testing Practices

The project doesn't have visible test files; tests would typically:
- Use Vitest or Jest
- Test components with React Testing Library
- Test state management (store/cms)
- Integration tests for routes

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile-First Approach

```tsx
// Hidden on mobile, visible on md+
<div className="hidden md:flex">Desktop only</div>

// Different styles per breakpoint
<div className="text-[14px] md:text-[18px] lg:text-[24px]">
  Responsive text
</div>

// Grid adjusts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Mobile Detection Hook

```tsx
// src/hooks/use-mobile.tsx
import { useEffect, useState } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    handler();
    return () => window.removeEventListener('resize', handler);
  }, []);
  
  return isMobile;
}
```

---

## 🔍 Performance Optimizations

### Image Lazy Loading

```tsx
<img 
  src={product.image} 
  alt={product.name}
  loading="lazy"  // Native lazy loading
  className="..."
/>
```

### Virtualization (for large lists)

Products section uses horizontal scroll instead of rendering all items:

```tsx
<div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
  {products.map(p => (
    <div key={p.id} className="w-[240px] flex-shrink-0 snap-start">
      <ProductCard product={p} />
    </div>
  ))}
</div>
```

### Code Splitting

TanStack Router automatically code-splits routes:
- Each route is its own chunk
- Loaded only when route accessed
- Reduces initial bundle size

---

## 🎯 Key Coding Patterns

### 1. Component Composition

```tsx
// Simple presentation component
export function ProductCard({ product }: { product: Product }) {
  return <Link>...</Link>;
}

// Container component with logic
export function CatalogPage() {
  const products = useCms(s => s.content.products);
  return <div>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}
```

### 2. Selective State Subscription

```tsx
// Only re-render if cartCount changes (not all store state)
const cartCount = useStore((s) => s.cartCount);

// Selector prevents unnecessary renders
const brand = useCms((s) => s.content.nav.brand);
```

### 3. Route Loaders

```tsx
export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = cms.get().content.products.find(p => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetail
});

function ProductDetail() {
  const { product } = Route.useLoaderData();  // Type-safe data access
  return <div>{product.name}</div>;
}
```

### 4. Dynamic Navigation

```tsx
// With type-safe params
<Link 
  to="/product/$id" 
  params={{ id: product.id }}
>
  View
</Link>

// With search params (filters)
<Link 
  to="/catalog" 
  search={{ cat: "festive", sort: "price" }}
>
  Filters
</Link>
```

### 5. Conditional Rendering

```tsx
// Toggleable sections (via CMS)
{sections.newArrivals && (
  <section>New Arrivals</section>
)}

// Empty state
{products.length === 0 ? (
  <p>No products found</p>
) : (
  <ProductGrid products={products} />
)}

// Loading state (would use React Query)
{isLoading ? <Spinner /> : <Content />}
```

---

## 🛡️ Security Considerations

### Current Issues (Frontend-Only)

⚠️ **Security Concerns:**
- Credentials hardcoded in code
- No HTTPS/SSL verification needed
- Admin auth stored in localStorage (accessible)
- No rate limiting
- No input validation for CMS edits

### Backend Security Required

✅ **Implement in Backend:**
- JWT tokens with expiration
- Password hashing (bcrypt)
- HTTPS/TLS encryption
- CORS configuration
- Input validation & sanitization
- Rate limiting
- Database query parameterization (prevent SQL injection)
- Environment variables for secrets
- User role-based access control (RBAC)

---

## 📚 Useful Resources

### Documentation

- **TanStack Router:** https://tanstack.com/router/latest
- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Radix UI:** https://radix-ui.com
- **TypeScript:** https://www.typescriptlang.org
- **Vite:** https://vitejs.dev

### Tools & Libraries

- **Lucide Icons:** https://lucide.dev
- **React Hook Form:** https://react-hook-form.com
- **Radix UI:** https://radix-ui.com

---

## 📝 Summary

### Key Takeaways

1. **Architecture:** Modern React + TanStack stack with file-based routing
2. **State:** Custom lightweight pattern using `useSyncExternalStore`
3. **Components:** Composable, reusable, type-safe React components
4. **Styling:** Tailwind CSS v4 with custom design system
5. **Data:** CMS-driven content + localStorage persistence
6. **Routing:** TanStack Router with dynamic routes & loaders
7. **Frontend-Only:** Currently no backend (ready for integration)

### Next Steps for Backend Integration

1. Choose tech stack (recommended: Node.js + TypeScript)
2. Design database schema for Products, Orders, Users, CMS
3. Implement API endpoints (Products, Auth, CMS, Orders)
4. Add authentication (JWT + refresh tokens)
5. Integrate with payment provider (Razorpay for India)
6. Update frontend to call APIs instead of localStorage
7. Add error handling & loading states
8. Deploy backend & connect frontend

### Recommended Backend Stack

```
Runtime:     Node.js 18+
Framework:   Express.js or Fastify
Language:    TypeScript
Database:    PostgreSQL
ORM:         Prisma
Auth:        JWT + bcrypt
File Upload: Cloudflare R2 / AWS S3
Deployment:  Cloudflare Workers, Railway, or Fly.io
```

---

**Generated:** May 10, 2026  
**Project:** Yadhra Closet — Editorial Kurtis E-commerce Template  
**Version:** 1.0.0
