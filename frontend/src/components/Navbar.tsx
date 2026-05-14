import { Link, useLocation } from "@tanstack/react-router";
import { useCms } from "@/lib/cms";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function Navbar() {
  const { count: cartCount } = useCart();
  const { brand, links } = useCms((s) => s.content.nav);
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-sm border-b border-border-grey">
      <nav className="max-w-[1400px] mx-auto h-[60px] px-5 md:px-10 flex items-center justify-between">
        {/* Logo — wordmark only, clean editorial */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-serif text-[36px] tracking-tight text-deep-blue">
            {brand}
          </span>
        </Link>

        {/* Nav links — minimal, spaced */}
        <div className="hidden md:flex items-center gap-10 text-[16px] text-text-muted font-semibold uppercase tracking-[0.1em]">
          {links.map((l) =>
            l.to.startsWith("/#") ? (
              <a key={l.label} href={l.to} className="nav-underline hover:text-deep-blue transition-colors">
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className="nav-underline hover:text-deep-blue transition-colors"
                data-active={pathname === l.to}
              >
                {l.label}
              </Link>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5 text-deep-blue">
          <Link to="/catalog" aria-label="Search">
            <Search className="w-[25px] h-[25px]" />
          </Link>
          <Link to="/checkout" aria-label="Cart" className="relative">
            <ShoppingBag className="w-[25px] h-[25px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-deep-blue text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
