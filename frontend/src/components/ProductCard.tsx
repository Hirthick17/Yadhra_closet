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
      className="group block bg-white border border-border-grey rounded-[18px] overflow-hidden transition-all duration-[350ms] [transition-timing-function:var(--ease-spring)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(13,26,99,0.25)] hover:border-transparent"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary-bg">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white ${
              product.badge === "new" ? "bg-deep-blue" : "bg-sale"
            }`}
          >
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8.5 h-8.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-sale text-sale" : "text-accent-blue"}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/55 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
          <span className="flex-1 text-center text-[12px] font-medium py-2 rounded-full border border-white/40 text-white bg-white/15 backdrop-blur">Cart</span>
          <span className="flex-1 text-center text-[12px] font-semibold py-2 rounded-full bg-white text-deep-blue">Buy Now</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[9px] uppercase tracking-[0.14em] text-text-muted">{product.categoryLabel}</p>
        <h3 className="font-serif text-[17px] font-semibold mt-1 leading-tight">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-text-muted">
          <span className="text-gold">{"★".repeat(Math.round(product.rating))}</span>
          <span>({product.ratingCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-mono font-bold text-[17px]">₹{product.price}</span>
          {product.oldPrice && (
            <>
              <span className="font-mono text-[12px] line-through text-text-muted">₹{product.oldPrice}</span>
              <span className="text-[10px] font-semibold text-success">{discount}% off</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
