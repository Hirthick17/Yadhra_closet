// src/routes/catalog.tsx
// Products now fetched from MongoDB via useProducts hook.
// Filter tabs, search, loading skeletons, and error state all included.

import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useProducts } from "@/hooks/useProducts";
import { cartStore } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";

const searchSchema = z.object({
  cat: z.enum(["all", "everyday", "festive", "floral", "minimal"]).optional(),
});

export const Route = createFileRoute("/catalog")({
  component: Catalog,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "All Kurtis — Yadhra Closet" }] }),
});

const FILTERS = [
  { id: "all",      label: "All" },
  { id: "everyday", label: "Everyday Wear" },
  { id: "festive",  label: "Festive" },
  { id: "floral",   label: "Floral Prints" },
  { id: "minimal",  label: "Minimal" },
] as const;

// ── Loading skeleton ─────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-secondary-bg rounded-[18px] aspect-[3/4] mb-3" />
          <div className="h-3 bg-secondary-bg rounded w-3/4 mb-2" />
          <div className="h-3 bg-secondary-bg rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

function Catalog() {
  const search = useSearch({ from: "/catalog" });
  const [active, setActive] = useState<string>(search.cat ?? "all");
  useEffect(() => { if (search.cat) setActive(search.cat); }, [search.cat]);

  const category = active === "all" ? undefined : active;
  const { data, isLoading, isError, error } = useProducts({ category });
  const products = data?.data ?? [];

  return (
    <SiteShell>
      <section className="max-w-[1400px] mx-auto px-5 md:px-10 pt-12 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
          {isLoading ? "Loading..." : `${data?.pagination?.total ?? products.length} Designs`}
        </p>
        <h1 className="font-serif text-5xl mt-2 text-deep-blue">
          All <span className="italic">Kurtis</span>
        </h1>
      </section>

      {/* Filter tabs */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-10 pb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-5 py-2.5 rounded-full text-[12px] font-semibold border transition-all ${
                active === f.id
                  ? "bg-deep-blue text-white border-deep-blue"
                  : "bg-white text-text-muted border-border-grey hover:border-deep-blue hover:text-deep-blue"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-10 pb-20">
        {isLoading && <ProductSkeleton />}

        {isError && (
          <div className="text-center py-20">
            <p className="text-text-muted">
              Could not load products. {(error as Error)?.message}
            </p>
            <Link to="/catalog" className="inline-block mt-4 px-6 py-2 rounded-full bg-deep-blue text-white text-sm">
              Retry
            </Link>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <div key={p._id} className="group relative">
                  <Link to="/product/$id" params={{ id: p.slug || p._id }}>
                    <div className="relative rounded-[18px] overflow-hidden bg-secondary-bg aspect-[3/4]">
                      <img
                        src={p.images?.[0] || p.image || "/images/placeholder.jpg"}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.badge && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.badge === "new" ? "bg-deep-blue text-white" : "bg-gold text-white"
                        }`}>
                          {p.badge}
                        </span>
                      )}
                      {p.stock === 0 && (
                        <span className="absolute inset-0 bg-white/60 flex items-center justify-center text-[12px] font-semibold text-text-muted rounded-[18px]">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="mt-3 px-1">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-text-muted font-semibold">{p.categoryLabel}</p>
                      <h3 className="font-serif text-[17px] mt-0.5 text-deep-blue leading-snug">{p.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-mono font-semibold text-[15px]">₹{p.price.toLocaleString("en-IN")}</span>
                        {p.oldPrice && <span className="font-mono text-[12px] line-through text-text-muted">₹{p.oldPrice.toLocaleString("en-IN")}</span>}
                      </div>
                      {p.rating > 0 && (
                        <p className="text-[11px] text-text-muted mt-1">⭐ {p.rating} · {p.ratingCount} ratings</p>
                      )}
                    </div>
                  </Link>

                  {/* Quick add to cart */}
                  <button
                    disabled={p.stock === 0}
                    onClick={() => cartStore.addItem({
                      productId: p._id, slug: p.slug, name: p.name,
                      price: p.price, image: p.images?.[0] || p.image,
                      categoryLabel: p.categoryLabel,
                    })}
                    className="absolute bottom-[76px] right-3 w-9 h-9 rounded-full bg-deep-blue text-white flex items-center justify-center shadow-lg
                               opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 disabled:opacity-30"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <p className="text-center text-text-muted py-20">
                No kurtis in this category yet.
              </p>
            )}
          </>
        )}
      </section>
    </SiteShell>
  );
}
