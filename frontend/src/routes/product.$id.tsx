// src/routes/product.$id.tsx
// Product detail — fetches from MongoDB by slug (or _id).
// Cart: add to cart uses cartStore with quantity controls.
// Follows existing design tokens (deep-blue, secondary-bg, font-serif, rounded-full).

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { useState } from "react";
import { ShoppingBag, Zap, Truck, Minus, Plus } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { cartStore, useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
  head: () => ({ meta: [{ title: "Kurti — Yadhra Closet" }] }),
});

// ── Loading skeleton ──────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <SiteShell>
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-10 grid lg:grid-cols-2 gap-10">
        <div className="animate-pulse bg-secondary-bg rounded-[18px] aspect-[3/4]" />
        <div className="animate-pulse space-y-4 pt-4">
          <div className="h-8 bg-secondary-bg rounded w-3/4" />
          <div className="h-4 bg-secondary-bg rounded w-1/2" />
          <div className="h-12 bg-secondary-bg rounded w-1/3 mt-6" />
          <div className="flex gap-2 mt-4">
            {[1,2,3,4].map(i => <div key={i} className="h-10 w-14 bg-secondary-bg rounded-full" />)}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();

  const { data, isLoading, isError } = useProduct(id);
  const product = data?.data;

  const [activeImg, setActiveImg] = useState(0);
  const [size,      setSize]      = useState("M");
  const [color,     setColor]     = useState("");

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <SiteShell>
        <div className="max-w-xl mx-auto py-32 text-center">
          <h1 className="font-serif text-4xl text-deep-blue">Kurti not found</h1>
          <Link to="/catalog" className="inline-block mt-6 px-6 py-3 rounded-full bg-deep-blue text-white text-sm">
            Back to catalog
          </Link>
        </div>
      </SiteShell>
    );
  }

  // Use product's outOfStockSizes or fallback to empty
  const sizes       = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL","XXL"];
  const oosSet      = new Set(product.outOfStockSizes ?? []);
  const images      = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const selectedColor = color || product.colors?.[0] || "#0D1A63";

  // Check if this product+size already in cart
  const inCart = cartItems.find(i => i.productId === product._id && i.size === size);

  const addToCart = () => {
    cartStore.addItem({
      productId: product._id,
      slug:      product.slug,
      name:      product.name,
      price:     product.price,
      image:     images[0],
      size,
      color:     selectedColor,
      categoryLabel: product.categoryLabel,
    });
  };

  const buyNow = () => {
    addToCart();
    navigate({ to: "/checkout" });
  };

  return (
    <SiteShell>
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-10">
        {/* Breadcrumb */}
        <p className="text-[11px] text-text-muted">
          <Link to="/" className="hover:text-deep-blue">Home</Link> ›{" "}
          <Link to="/catalog" className="hover:text-deep-blue">{product.categoryLabel}</Link> ›{" "}
          <span>{product.name}</span>
        </p>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 mt-6">
          {/* Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-[72px] h-[90px] flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    activeImg === i ? "border-deep-blue" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 rounded-[18px] overflow-hidden bg-secondary-bg" style={{ aspectRatio: "2.5/4" }}>
              <img
                src={images[activeImg] || "/images/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-full px-4 py-2.5 text-[12px] flex items-center gap-2 text-accent-blue">
                <Truck className="w-4 h-4 text-deep-blue" /> Free delivery · Price includes GST & all taxes
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="font-serif text-[36px] leading-tight text-deep-blue">{product.name}</h1>
            {product.subtitle && (
              <p className="font-serif italic text-lg text-text-muted mt-1">{product.subtitle}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              {product.rating > 0 && (
                <span className="bg-deep-blue text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                  ⭐ {product.rating}
                </span>
              )}
              <span className="text-[12px] text-text-muted">{product.ratingCount} ratings</span>
            </div>

            {/* Price */}
            <div className="bg-secondary-bg rounded-[14px] p-5 mt-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[32px] font-semibold text-deep-blue">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.oldPrice && (
                  <span className="font-mono text-[15px] line-through text-text-muted">
                    ₹{product.oldPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {product.oldPrice && (
                  <span className="text-[12px] text-success font-semibold">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% off
                  </span>
                )}
              </div>
              <p className="text-[12px] text-success font-medium mt-2">
                ✓ Inclusive of delivery, GST & all taxes
              </p>
            </div>

            {/* Color */}
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted font-semibold">Color</p>
                <div className="flex gap-3 mt-3">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition ${
                        selectedColor === c ? "ring-2 ring-deep-blue ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted font-semibold">Size</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {sizes.map((s) => {
                  const oos = oosSet.has(s);
                  return (
                    <button
                      key={s}
                      disabled={oos}
                      onClick={() => setSize(s)}
                      className={`min-w-[48px] px-4 py-2.5 rounded-full text-[13px] font-semibold border transition ${
                        oos
                          ? "line-through text-text-muted border-border-grey cursor-not-allowed"
                          : size === s
                          ? "bg-deep-blue text-white border-deep-blue"
                          : "bg-white text-accent-blue border-border-grey hover:border-deep-blue"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cart quantity control — shown when item is already in cart */}
            {inCart ? (
              <div className="mt-7 flex items-center gap-4">
                <div className="flex items-center gap-0 border border-deep-blue rounded-full overflow-hidden">
                  <button
                    onClick={() => cartStore.removeItem(product._id, size, selectedColor)}
                    className="w-11 h-11 flex items-center justify-center text-deep-blue hover:bg-deep-blue hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-[36px] text-center text-[15px] font-semibold text-deep-blue">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={() => cartStore.addItem({ productId: product._id, slug: product.slug, name: product.name, price: product.price, image: images[0], size, color: selectedColor, categoryLabel: product.categoryLabel })}
                    className="w-11 h-11 flex items-center justify-center text-deep-blue hover:bg-deep-blue hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => navigate({ to: "/checkout" })}
                  className="flex-1 px-6 py-3.5 rounded-full bg-deep-blue text-white font-semibold text-[13px] flex items-center justify-center gap-2 hover:shadow-[0_14px_30px_-12px_rgba(13,26,99,0.55)] transition-shadow"
                >
                  <Zap className="w-4 h-4" /> Go to Checkout
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-7">
                <button
                  disabled={product.stock === 0}
                  onClick={addToCart}
                  className="flex-1 px-6 py-3.5 rounded-full border border-deep-blue text-deep-blue font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-deep-blue hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  disabled={product.stock === 0}
                  onClick={buyNow}
                  className="flex-[1.5] px-6 py-3.5 rounded-full bg-deep-blue text-white font-semibold text-[13px] flex items-center justify-center gap-2 hover:shadow-[0_14px_30px_-12px_rgba(13,26,99,0.55)] transition-shadow disabled:opacity-40"
                >
                  <Zap className="w-4 h-4" /> Buy Now
                </button>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="mt-6 text-[14px] leading-[1.8] text-text-muted">{product.description}</p>
            )}

            {/* Mini reviews */}
            <div className="mt-8 space-y-3">
              {[
                { n: "Aarti M.", t: "Fits beautifully and the fabric is a dream in Chennai heat." },
                { n: "Divya P.", t: "Pictures don't do justice — the colour is even prettier in person." },
              ].map((r, i) => (
                <div key={i} className="bg-secondary-bg rounded-xl p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-deep-blue text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {r.n[0]}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold">{r.n} <span className="text-gold ml-1">★★★★★</span></p>
                    <p className="text-[12px] text-text-muted mt-0.5">{r.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
