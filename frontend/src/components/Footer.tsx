// T-03: Each footer link now navigates to its correct destination.
// T-02: Sustainability, Careers, Size Guide, Track Order removed from CMS data (cms.ts).
// The footer now hardcodes the link map so routing is correct even if CMS data changes.
import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Lock } from "lucide-react";
import { useCms } from "@/lib/cms";

// Authoritative link destination table (per agent orchestration document T-03)
const LINK_MAP: Record<string, string | { href: string }> = {
  "New Arrivals":       "/#hot",
  "Everyday Wear":      "/catalog",
  "Festive Collection": "/catalog",
  "Hot Sales":          "/#hot",
  "FAQ":                "/faq",
  "Returns":            "/returns",
  "Our Story":          "/#brand",
  "Contact":            "mailto:yadhra.closet@gmail.com",
  "Privacy":            "/privacy",
};

function FooterLink({ label }: { label: string }) {
  const dest = LINK_MAP[label] ?? "#";

  const cls = "hover:text-deep-blue transition-colors";

  if (typeof dest === "string" && dest.startsWith("mailto:")) {
    return <a href={dest} className={cls}>{label}</a>;
  }
  if (typeof dest === "string" && dest.startsWith("/#")) {
    // Anchor on homepage — use plain <a> so browser navigates to / then scrolls
    return <a href={dest} className={cls}>{label}</a>;
  }
  return <Link to={dest as string} className={cls}>{label}</Link>;
}

// T-02: Footer columns are hardcoded — NOT from CMS localStorage.
// WHY: CMS localStorage may have old data. Hardcoding makes T-02 permanent
// and immune to stale cache. Tagline/copyright still come from CMS.
// T-03: All link destinations match the authoritative LINK_MAP above.
const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: ["New Arrivals", "Everyday Wear", "Festive Collection", "Hot Sales"],
  },
  {
    title: "Help",
    links: ["FAQ", "Returns"],
  },
  {
    title: "About",
    links: ["Our Story", "Contact"],
  },
];

export function Footer() {
  const { tagline, copyright } = useCms((s) => s.content.footer);
  const brand   = useCms((s) => s.content.nav.brand);
  const isAdmin = useCms((s) => s.isAdmin);

  return (
    <footer className="bg-secondary-bg mt-24">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-16 grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand column */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-4">
            <span className="w-[38px] h-[38px] rounded-lg bg-deep-blue text-white font-serif font-semibold flex items-center justify-center">YC</span>
            <span className="font-serif text-[22px]">{brand}</span>
          </Link>
          <p className="text-[13px] text-text-muted leading-relaxed max-w-xs">{tagline}</p>
          <div className="flex gap-3 mt-5">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-full border border-border-grey flex items-center justify-center text-accent-blue hover:bg-deep-blue hover:text-white hover:border-deep-blue transition-colors">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Hardcoded columns — T-02 compliant, T-03 links correct */}
        {FOOTER_COLUMNS.map((c) => (
          <div key={c.title}>
            <h4 className="font-serif text-lg mb-4">{c.title}</h4>
            <ul className="space-y-2.5 text-[13px] text-text-muted">
              {c.links.map((l) => (
                <li key={l}><FooterLink label={l} /></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border-grey">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-5 flex flex-col md:flex-row justify-between gap-3 text-[11px] text-text-muted">
          <p>{copyright}</p>
          <div className="flex gap-5 items-center">
            <Link to="/privacy">Privacy</Link>
            <Link to="/returns">Returns</Link>
            <Link
              to={isAdmin ? "/admin" : "/admin/login"}
              className="flex items-center gap-1.5 text-deep-blue/70 hover:text-deep-blue font-semibold transition-colors"
            >
              <Lock className="w-3 h-3" />
              {isAdmin ? "CMS" : "Admin"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
