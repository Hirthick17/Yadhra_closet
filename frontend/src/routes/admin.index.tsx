import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { cms, useCms, CMS_DEFAULT, type CmsContent } from "@/lib/cms";
import {
  LayoutDashboard, Home, HelpCircle, Package, Megaphone, Navigation as NavIcon,
  Link2, LogOut, Eye, Plus, Trash2, RotateCcw, Save, ExternalLink,
  Upload, Pencil, X, ImageIcon, Loader2, Menu
} from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product } from "@/hooks/useProducts";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useImageUpload } from "@/hooks/useUpload";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/")({
  component: AdminPortal,
  head: () => ({ meta: [{ title: "CMS — Yadhra Closet" }] }),
});

type Pane = "dashboard" | "orders" | "homepage" | "faq" | "products" | "ticker" | "navigation" | "footer";

function AdminPortal() {
  const navigate = useNavigate();
  const isAdmin = useCms((s) => s.isAdmin);
  const sessionChecked = useCms((s) => s.sessionChecked);
  const [pane, setPane] = useState<Pane>("dashboard");
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (sessionChecked && !isAdmin) navigate({ to: "/admin/login" });
  }, [sessionChecked, isAdmin, navigate]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-deep-blue/20 border-t-deep-blue animate-spin" />
          <p className="text-[12px] text-text-muted font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  if (!isAdmin) return null;

  const items: { id: Pane; label: string; icon: typeof Home; section: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
    { id: "orders", label: "Orders", icon: Package, section: "Overview" },
    { id: "homepage", label: "Homepage", icon: Home, section: "Page Content" },
    { id: "faq", label: "FAQ Page", icon: HelpCircle, section: "Page Content" },
    { id: "products", label: "Products", icon: Package, section: "Catalog" },
    { id: "ticker", label: "Announcement Bar", icon: Megaphone, section: "Global" },
    { id: "navigation", label: "Navigation", icon: NavIcon, section: "Global" },
    { id: "footer", label: "Footer", icon: Link2, section: "Global" },
  ];
  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.section] ||= []).push(it);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-secondary-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-deep-blue h-14 flex items-center justify-between px-3 md:px-6 text-white shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 touch-manipulation">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="hidden md:flex w-8 h-8 rounded-lg bg-white/15 font-serif text-sm font-bold items-center justify-center">YC</span>
          <span className="font-serif text-[15px] md:text-[18px]">Yadhra <em className="italic font-light opacity-70 hidden md:inline">Closet</em></span>
          <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-[0.12em] bg-white/10 px-2.5 py-1 rounded-full opacity-70">CMS Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/15 rounded-full px-2.5 py-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
          </Link>
          <button
            onClick={() => { cms.logout(); navigate({ to: "/" }); }}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white text-deep-blue rounded-full px-2.5 py-1.5 touch-manipulation"
          >
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {menuOpen && (
          <div className="fixed inset-0 bg-deep-blue/40 z-30 md:hidden backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        )}
        {/* Sidebar */}
        <aside className={`${menuOpen ? 'fixed inset-y-0 left-0 mt-14 z-40 w-[280px] shadow-2xl' : 'hidden'} md:static md:block md:w-[240px] lg:w-[260px] md:mt-0 flex-shrink-0 bg-white border-r border-border-grey py-5 overflow-y-auto`}>
          {Object.entries(grouped).map(([section, list]) => (
            <div key={section} className="px-3.5 mb-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-text-muted px-2.5 py-2">{section}</p>
              {list.map((it) => {
                const Icon = it.icon;
                const active = pane === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => { setPane(it.id); setMenuOpen(false); }}
                    className={`relative w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] text-[13px] font-medium transition-colors ${
                      active ? "bg-deep-blue/[0.06] text-deep-blue font-bold" : "text-accent-blue hover:bg-secondary-bg"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-deep-blue rounded-full" />}
                    <Icon className="w-4 h-4" /> {it.label}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="px-5 mt-4 pt-4 border-t border-border-grey">
            <button
              onClick={() => { if (confirm("Reset all content to defaults?")) { cms.reset(); showToast("Reset to defaults"); } }}
              className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-[9px] text-[12px] text-sale hover:bg-sale/5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Content
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full p-4 md:p-6 lg:p-8">
          {pane === "dashboard" && <DashboardPane go={setPane} />}
          {pane === "orders" && <OrdersPane />}
          {pane === "homepage" && <HomepagePane onChange={() => showToast("Saved")} />}
          {pane === "faq" && <FaqPane onChange={() => showToast("Saved")} />}
          {pane === "products" && <ProductsPane onChange={() => showToast("Saved")} />}
          {pane === "ticker" && <TickerPane onChange={() => showToast("Saved")} />}
          {pane === "navigation" && <NavPane onChange={() => showToast("Saved")} />}
          {pane === "footer" && <FooterPane onChange={() => showToast("Saved")} />}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-deep-blue text-white text-[13px] font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-[100]">
          <Save className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- Reusable form atoms ---------------- */
function PageHeader({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-7">
      <div>
        <h1 className="font-serif text-3xl text-deep-blue leading-tight">{title}</h1>
        <p className="text-[13px] text-text-muted mt-1">{sub}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border-grey rounded-xl shadow-sm p-6 mb-5">
      {title && <h3 className="text-[13px] font-bold text-deep-blue mb-4 uppercase tracking-wider">{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] md:text-[11px] font-bold uppercase tracking-[0.1em] text-accent-blue">{label}</span>
      {children}
      {hint && <span className="text-[12px] md:text-[11px] text-text-muted">{hint}</span>}
    </label>
  );
}

const inputCls = "px-4 py-3 md:py-2.5 border-2 border-border-grey rounded-[9px] bg-secondary-bg focus:border-deep-blue focus:bg-white outline-none text-[15px] md:text-[13px] text-accent-blue w-full font-sans touch-manipulation";

function Toggle({ on, onClick, label, sub }: { on: boolean; onClick: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-secondary-bg rounded-[9px] border-[1.5px] border-border-grey">
      <div>
        <p className="text-[13px] font-semibold text-accent-blue">{label}</p>
        {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={onClick}
        className={`relative w-10 h-[22px] rounded-full transition-colors ${on ? "bg-deep-blue" : "bg-border-grey"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-[21px]" : "left-[3px]"}`} />
      </button>
    </div>
  );
}

/* ---------------- Panes ---------------- */
function DashboardPane({ go }: { go: (p: Pane) => void }) {
  const c = useCms((s) => s.content);
  const stats = [
    { v: String(c.products.length), l: "Products", icon: "📦" },
    { v: String(c.faq.items.length), l: "FAQ Items", icon: "❓" },
    { v: String(c.ticker.messages.length), l: "Ticker Messages", icon: "📢" },
    { v: String(Object.values(c.home.sections).filter(Boolean).length) + "/5", l: "Active Sections", icon: "✨" },
  ];
  const quick: { id: Pane; label: string; sub: string }[] = [
    { id: "homepage", label: "Edit Homepage", sub: "Hero, sections & story" },
    { id: "products", label: "Manage Products", sub: "Add, edit & remove" },
    { id: "ticker", label: "Announcement Bar", sub: "Top scrolling messages" },
    { id: "footer", label: "Footer Links", sub: "Bottom site links" },
  ];
  return (
    <div>
      <PageHeader title="Welcome back 👋" sub="Manage your store's content from one place." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.l} className="bg-white border border-border-grey rounded-xl p-5 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-serif text-3xl font-semibold text-deep-blue leading-none">{s.v}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted mt-1.5">{s.l}</div>
          </div>
        ))}
      </div>
      <Card title="Quick actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quick.map((q) => (
            <button
              key={q.id}
              onClick={() => go(q.id)}
              className="text-left p-4 rounded-[10px] border border-border-grey bg-secondary-bg hover:border-deep-blue hover:bg-deep-blue/[0.04] transition-colors"
            >
              <p className="text-[14px] font-bold text-deep-blue">{q.label}</p>
              <p className="text-[12px] text-text-muted mt-0.5">{q.sub}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ----- Homepage ----- */
function HomepagePane({ onChange }: { onChange: () => void }) {
  const home = useCms((s) => s.content.home);
  const update = (patch: Partial<CmsContent["home"]>) => {
    cms.setContent((c) => ({ ...c, home: { ...c.home, ...patch } }));
    onChange();
  };
  const updateHero = (patch: Partial<CmsContent["home"]["hero"]>) =>
    update({ hero: { ...home.hero, ...patch } });
  const updateStory = (patch: Partial<CmsContent["home"]["brandStory"]>) =>
    update({ brandStory: { ...home.brandStory, ...patch } });

  return (
    <div>
      <PageHeader title="Homepage Editor" sub="Customise the hero, sections, story and reviews." />

      <Card title="Hero Section">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Eyebrow tag"><input className={inputCls} value={home.hero.eyebrow} onChange={(e) => updateHero({ eyebrow: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title (line 1)"><input className={inputCls} value={home.hero.titleTop} onChange={(e) => updateHero({ titleTop: e.target.value })} /></Field>
            <Field label="Title (line 2, italic)"><input className={inputCls} value={home.hero.titleBottom} onChange={(e) => updateHero({ titleBottom: e.target.value })} /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Body copy"><textarea rows={3} className={inputCls} value={home.hero.body} onChange={(e) => updateHero({ body: e.target.value })} /></Field>
          </div>
          <Field label="Primary button"><input className={inputCls} value={home.hero.cta1} onChange={(e) => updateHero({ cta1: e.target.value })} /></Field>
          <Field label="Secondary button"><input className={inputCls} value={home.hero.cta2} onChange={(e) => updateHero({ cta2: e.target.value })} /></Field>
        </div>
        <p className="mt-5 mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-accent-blue">Stat strip</p>
        <div className="grid md:grid-cols-3 gap-3">
          {home.hero.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 p-3 bg-secondary-bg rounded-[9px] border border-border-grey">
              <input className={inputCls} placeholder="Value" value={s.n} onChange={(e) => {
                const stats = home.hero.stats.slice(); stats[i] = { ...s, n: e.target.value }; updateHero({ stats });
              }} />
              <input className={inputCls} placeholder="Label" value={s.l} onChange={(e) => {
                const stats = home.hero.stats.slice(); stats[i] = { ...s, l: e.target.value }; updateHero({ stats });
              }} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Section Visibility">
        <p className="text-[12px] text-text-muted mb-4">Toggle which sections appear on the homepage.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {([
            ["categories", "Shop by Category", "Grid of category tiles"],
            ["newArrivals", "New Arrivals", "Horizontal product carousel"],
            ["highlyRated", "Highly Rated (Dark)", "Featured top-rated products"],
            ["reviews", "Customer Reviews", "Verified review cards"],
            ["brandStory", "Brand Story", "Founder story section"],
          ] as const).map(([key, label, sub]) => (
            <Toggle
              key={key}
              label={label}
              sub={sub}
              on={home.sections[key]}
              onClick={() => update({ sections: { ...home.sections, [key]: !home.sections[key] } })}
            />
          ))}
        </div>
      </Card>

      <Card title="Brand Story">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Eyebrow"><input className={inputCls} value={home.brandStory.eyebrow} onChange={(e) => updateStory({ eyebrow: e.target.value })} /></Field>
          <Field label="Years badge"><input className={inputCls} value={home.brandStory.yearsBadge} onChange={(e) => updateStory({ yearsBadge: e.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Quote"><textarea rows={2} className={inputCls} value={home.brandStory.quote} onChange={(e) => updateStory({ quote: e.target.value })} /></Field></div>
          <div className="md:col-span-2"><Field label="Body"><textarea rows={4} className={inputCls} value={home.brandStory.body} onChange={(e) => updateStory({ body: e.target.value })} /></Field></div>
          <Field label="Founder name"><input className={inputCls} value={home.brandStory.founderName} onChange={(e) => updateStory({ founderName: e.target.value })} /></Field>
          <Field label="Founder role"><input className={inputCls} value={home.brandStory.founderRole} onChange={(e) => updateStory({ founderRole: e.target.value })} /></Field>
        </div>
      </Card>

      <Card title="Customer Reviews">
        <div className="space-y-3">
          {home.reviews.map((r, i) => (
            <div key={i} className="p-4 border border-border-grey rounded-[10px] bg-secondary-bg">
              <div className="grid md:grid-cols-3 gap-2 mb-2">
                <input className={inputCls} placeholder="Name" value={r.name} onChange={(e) => {
                  const reviews = home.reviews.slice(); reviews[i] = { ...r, name: e.target.value, initial: e.target.value.charAt(0).toUpperCase() }; update({ reviews });
                }} />
                <input className={inputCls} placeholder="City" value={r.city} onChange={(e) => {
                  const reviews = home.reviews.slice(); reviews[i] = { ...r, city: e.target.value }; update({ reviews });
                }} />
                <input className={inputCls} placeholder="Product" value={r.product} onChange={(e) => {
                  const reviews = home.reviews.slice(); reviews[i] = { ...r, product: e.target.value }; update({ reviews });
                }} />
              </div>
              <textarea rows={2} className={inputCls} placeholder="Review" value={r.text} onChange={(e) => {
                const reviews = home.reviews.slice(); reviews[i] = { ...r, text: e.target.value }; update({ reviews });
              }} />
              <button
                onClick={() => update({ reviews: home.reviews.filter((_, j) => j !== i) })}
                className="mt-2 text-[11px] font-bold text-sale hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => update({ reviews: [...home.reviews, { name: "New Customer", city: "City", product: "Product", initial: "N", text: "Wonderful!" }] })}
            className="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border-grey text-[12px] font-bold text-deep-blue hover:bg-deep-blue/[0.04] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add review
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ----- FAQ ----- */
function FaqPane({ onChange }: { onChange: () => void }) {
  const faq = useCms((s) => s.content.faq);
  const update = (patch: Partial<CmsContent["faq"]>) => {
    cms.setContent((c) => ({ ...c, faq: { ...c.faq, ...patch } }));
    onChange();
  };
  return (
    <div>
      <PageHeader title="FAQ Editor" sub="Add, edit, or remove frequently asked questions." />
      <Card title="Page heading">
        <Field label="Title (HTML supported in defaults)"><input className={inputCls} value={faq.title} onChange={(e) => update({ title: e.target.value })} /></Field>
      </Card>
      <Card title={`Questions (${faq.items.length})`}>
        <div className="space-y-3">
          {faq.items.map((it, i) => (
            <div key={i} className="p-4 border border-border-grey rounded-[10px] bg-secondary-bg">
              <Field label={`Question ${i + 1}`}>
                <input className={inputCls} value={it.q} onChange={(e) => {
                  const items = faq.items.slice(); items[i] = { ...it, q: e.target.value }; update({ items });
                }} />
              </Field>
              <div className="mt-2"><Field label="Answer">
                <textarea rows={2} className={inputCls} value={it.a} onChange={(e) => {
                  const items = faq.items.slice(); items[i] = { ...it, a: e.target.value }; update({ items });
                }} />
              </Field></div>
              <button
                onClick={() => update({ items: faq.items.filter((_, j) => j !== i) })}
                className="mt-2 text-[11px] font-bold text-sale hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => update({ items: [...faq.items, { q: "New question?", a: "Answer here." }] })}
            className="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border-grey text-[12px] font-bold text-deep-blue hover:bg-deep-blue/[0.04] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add question
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ----- Products — live MongoDB CRUD ----- */
const CATS = ["everyday", "festive", "floral", "minimal"] as const;
const CAT_LABELS: Record<string, string> = {
  everyday: "Everyday Wear", festive: "Festive", floral: "Floral Prints", minimal: "Minimal",
};

type EditProduct = Partial<Product> & { _id?: string };

function ProductsPane({ onChange }: { onChange: () => void }) {
  const { data, isLoading } = useProducts();
  const products = data?.data ?? [];
  const { mutate: deleteProduct } = useDeleteProduct();
  const [editing, setEditing] = useState<EditProduct | null>(null);
  const [showNew, setShowNew] = useState(false);

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct(id, { onSuccess: onChange });
  };

  return (
    <div>
      <PageHeader title="Products" sub="Live catalog — all changes sync to MongoDB instantly.">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] bg-deep-blue text-white text-[12px] font-bold uppercase tracking-wider hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </PageHeader>

      <Card>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse h-48 bg-secondary-bg rounded-lg" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-[13px]">No products yet. Click Add Product to get started.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p._id} className="bg-white border border-border-grey rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-40 bg-secondary-bg">
                  {p.images?.[0] || p.image ? (
                    <img src={p.images?.[0] || p.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-text-muted" />
                    </div>
                  )}
                  {/* Badge */}
                  {p.badge && (
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badge === "new" ? "bg-deep-blue text-white" : "bg-sale text-white"}`}>
                      {p.badge.toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-3">
                  <p className="font-bold text-deep-blue text-[14px] truncate">{p.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{p.slug}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[13px] font-bold text-deep-blue">₹{p.price?.toLocaleString("en-IN")}</span>
                    {p.oldPrice && (
                      <span className="text-[11px] text-text-muted line-through">₹{p.oldPrice}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.stock === 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                      {p.stock === 0 ? "Out of Stock" : `${p.stock} in stock`}
                    </span>
                    <span className="text-[11px] text-text-muted">{p.categoryLabel}</span>
                  </div>
                  
                  {/* Action Buttons - Always Visible */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border-grey">
                    <button 
                      onClick={() => setEditing(p)} 
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-deep-blue text-deep-blue text-[12px] font-bold hover:bg-deep-blue/5 touch-manipulation"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => remove(p._id, p.name)} 
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-sale text-sale text-[12px] font-bold hover:bg-sale/5 touch-manipulation"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {(editing !== null || showNew) && (
        <ProductModal
          initial={editing?._id ? editing as Product : null}
          onClose={() => { setEditing(null); setShowNew(false); }}
          onSave={() => { setEditing(null); setShowNew(false); onChange(); }}
        />
      )}
    </div>
  );
}

/* ----- Product Edit/Create Modal with Cloudinary image upload ----- */
// 8 common kurti / ethnic palette presets (S3-04 spec)
const KURTI_PRESETS = [
  { hex: '#C9A96E', label: 'Gold' },
  { hex: '#E8C4B8', label: 'Blush' },
  { hex: '#6B8E6E', label: 'Sage' },
  { hex: '#2E4057', label: 'Navy' },
  { hex: '#8B3A52', label: 'Maroon' },
  { hex: '#D4A7C7', label: 'Mauve' },
  { hex: '#F5E6CC', label: 'Ivory' },
  { hex: '#4A4A4A', label: 'Charcoal' },
];

const isValidHex = (s: string) => /^#[0-9A-Fa-f]{6}$/.test(s);
const normaliseHex = (s: string) => {
  const t = s.trim();
  if (!t.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(t)) return '#' + t;
  return t;
};

type ProductFormData = {
  name: string; slug: string; description: string; subtitle: string;
  category: typeof CATS[number]; categoryLabel: string;
  price: string; oldPrice: string; stock: string;
  rating: number; ratingCount: number;
  badge: "new" | "sale" | "";
  images: string[];          // Cloudinary URLs stored in MongoDB
  colors: string[];          // Hex codes array, e.g. ["#D9C2A7", "#4A5568"]
  newColorInput: string;     // Staging field for the hex text / picker input
  sizes: string;             // Comma-separated: "S, M, L, XL"
  outOfStockSizes: string;
};

function ProductModal({ initial, onClose, onSave }: {
  initial: Product | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!initial;
  const { mutate: create, isPending: creating } = useCreateProduct();
  const { mutate: update, isPending: updating  } = useUpdateProduct();
  const { upload, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormData>({
    name:           initial?.name          ?? "",
    slug:           initial?.slug          ?? "",
    description:    initial?.description   ?? "",
    subtitle:       initial?.subtitle      ?? "",
    category:       (initial?.category as typeof CATS[number]) ?? "everyday",
    categoryLabel:  initial?.categoryLabel ?? "Everyday Wear",
    price:          initial?.price != null ? String(initial.price) : "",
    oldPrice:       initial?.oldPrice != null ? String(initial.oldPrice) : "",
    stock:          initial?.stock != null ? String(initial.stock) : "0",
    rating:         initial?.rating        ?? 4.5,
    ratingCount:    initial?.ratingCount   ?? 0,
    badge:          (initial?.badge as "new"|"sale"|"") ?? "",
    images:         initial?.images        ?? [],
    colors:         initial?.colors        ?? [],
    newColorInput:  '#',
    sizes:          (initial?.sizes  ?? ["XS","S","M","L","XL","XXL"]).join(", "),
    outOfStockSizes:(initial?.outOfStockSizes ?? []).join(", "),
  });
  const [colorError, setColorError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const set = (patch: Partial<ProductFormData>) => setForm(f => ({ ...f, ...patch }));

  const setCat = (cat: typeof CATS[number]) => set({ category: cat, categoryLabel: CAT_LABELS[cat] });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const result = await upload(file);
    if (result) {
      set({ images: [...form.images, result.url] });
    } else {
      setUploadError("Upload failed. Check file size (max 5MB) and format (JPG/PNG/WebP).");
    }
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    set({ images: form.images.filter((_, i) => i !== idx) });
  };

  const submit = () => {
    if (!form.name || !form.slug || !form.price) {
      alert("Name, slug, and price are required.");
      return;
    }
    const payload = {
      name:            form.name,
      slug:            form.slug,
      description:     form.description,
      subtitle:        form.subtitle,
      category:        form.category,
      categoryLabel:   form.categoryLabel,
      price:           Number(form.price),
      oldPrice:        form.oldPrice !== "" ? Number(form.oldPrice) : undefined,
      stock:           Number(form.stock),
      rating:          Number(form.rating),
      ratingCount:     Number(form.ratingCount),
      badge:           (form.badge || null) as "new"|"sale"|null,
      images:          form.images,
      image:           form.images[0] ?? "",
      colors:          form.colors,
      sizes:           form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      outOfStockSizes: form.outOfStockSizes.split(",").map(s => s.trim()).filter(Boolean),
    };

    if (isEdit && initial?._id) {
      update({ id: initial._id, data: payload }, { onSuccess: onSave });
    } else {
      create(payload, { onSuccess: onSave });
    }
  };

  const isBusy = creating || updating || uploading;

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-deep-blue/40 backdrop-blur flex items-stretch md:items-center justify-center">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[92vh] md:rounded-2xl max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border-grey flex items-center justify-between flex-shrink-0 bg-white">
          <h2 className="font-serif text-xl md:text-2xl text-deep-blue">{isEdit ? "Edit product" : "Add product"}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full border-2 border-border-grey text-text-muted hover:border-sale hover:text-sale flex items-center justify-center touch-manipulation">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-5">
          {/* Images section */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-accent-blue mb-3">Product Images</p>
            <div className="flex flex-wrap gap-3 mb-3">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-28 h-32 rounded-xl overflow-hidden bg-secondary-bg border-2 border-border-grey group flex-shrink-0" style={i === 0 ? {borderColor:'var(--deep-blue)'} : {}}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {/* MAIN badge - always visible */}
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-deep-blue text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-10">MAIN</span>
                  )}
                  {/* Action overlay - always visible on mobile */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 flex items-center justify-around py-2 z-10">
                    {i !== 0 && (
                      <button
                        type="button"
                        title="Set as main"
                        onClick={() => set({ images: [url, ...form.images.filter((_, j) => j !== i)] })}
                        className="text-white text-[10px] font-bold uppercase flex flex-col items-center gap-0.5 touch-manipulation p-1"
                      >
                        <span className="text-[16px]">★</span>
                        <span>Main</span>
                      </button>
                    )}
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() => removeImage(i)}
                      className="text-red-300 text-[10px] font-bold uppercase flex flex-col items-center gap-0.5 touch-manipulation p-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-28 h-32 rounded-xl border-2 border-dashed border-border-grey bg-secondary-bg flex flex-col items-center justify-center gap-2 text-text-muted hover:border-deep-blue hover:text-deep-blue transition disabled:opacity-50 touch-manipulation"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                <span className="text-[11px] font-semibold">{uploading ? "Uploading..." : "Upload"}</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            {uploadError && <p className="text-[13px] text-red-500 mt-2 font-medium">{uploadError}</p>}
            <p className="text-[12px] text-text-muted mt-2">JPG, PNG, or WebP • Max 5 MB • First image is main photo</p>
          </div>

          {/* Basic info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Product name">
                <input className={inputCls} value={form.name} onChange={e => {
                  const name = e.target.value;
                  const slug = !isEdit ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : form.slug;
                  set({ name, slug });
                }} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Slug (URL ID)" hint="Used in product URLs: /product/your-slug-here">
                <input className={inputCls} value={form.slug} onChange={e => set({ slug: e.target.value })} disabled={isEdit} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description (required)">
                <textarea rows={3} className={inputCls} value={form.description} onChange={e => set({ description: e.target.value })} />
              </Field>
            </div>
            <Field label="Subtitle (optional)">
              <input className={inputCls} value={form.subtitle} onChange={e => set({ subtitle: e.target.value })} placeholder="Summer Edition 2026" />
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={e => setCat(e.target.value as typeof CATS[number])}>
                {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </Field>
            <Field label="Price (₹)">
              <input type="number" className={inputCls} value={form.price} onChange={e => set({ price: e.target.value })} />
            </Field>
            <Field label="Old / MRP price (optional)">
              <input type="number" className={inputCls} value={form.oldPrice} onChange={e => set({ oldPrice: e.target.value })} placeholder="Leave blank if no discount" />
            </Field>
            <Field label="Stock quantity">
              <input type="number" className={inputCls} value={form.stock} onChange={e => set({ stock: e.target.value })} />
            </Field>
            <Field label="Badge">
              <select className={inputCls} value={form.badge} onChange={e => set({ badge: e.target.value as "new"|"sale"|"" })}>
                <option value="">None</option>
                <option value="new">NEW</option>
                <option value="sale">SALE</option>
              </select>
            </Field>
            <Field label="Rating (0–5)">
              <input type="number" step="0.1" min="0" max="5" className={inputCls} value={form.rating} onChange={e => set({ rating: Number(e.target.value) })} />
            </Field>
            <Field label="Rating count">
              <input type="number" className={inputCls} value={form.ratingCount} onChange={e => set({ ratingCount: Number(e.target.value) })} />
            </Field>
            {/* ── Colour Variants ──────────────────────────────────────── */}
            <div className="md:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-blue mb-3">Colour Variants</p>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {KURTI_PRESETS.map(p => (
                  <button
                    key={p.hex}
                    type="button"
                    title={p.label}
                    onClick={() => set({ newColorInput: p.hex })}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span
                      className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-deep-blue transition"
                      style={{ backgroundColor: p.hex }}
                    />
                    <span className="text-[9px] text-text-muted font-medium">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Hex input row */}
              <div className="flex items-center gap-3 mb-2">
                {/* Live preview circle */}
                <span
                  className="w-8 h-8 flex-shrink-0 rounded-full border border-border-grey"
                  style={{ backgroundColor: isValidHex(form.newColorInput) ? form.newColorInput : '#e5e7eb' }}
                />
                {/* Text input */}
                <input
                  className={`${inputCls} flex-1 font-mono`}
                  value={form.newColorInput}
                  maxLength={7}
                  placeholder="#RRGGBB"
                  onChange={e => {
                    set({ newColorInput: e.target.value });
                    setColorError('');
                  }}
                />
                {/* Native colour picker */}
                <input
                  type="color"
                  value={isValidHex(form.newColorInput) ? form.newColorInput : '#000000'}
                  onChange={e => { set({ newColorInput: e.target.value }); setColorError(''); }}
                  className="w-9 h-9 rounded cursor-pointer border border-border-grey p-0.5 bg-white"
                  title="Pick colour"
                />
                {/* Add button */}
                <button
                  type="button"
                  disabled={form.colors.length >= 10}
                  onClick={() => {
                    const hex = normaliseHex(form.newColorInput);
                    if (!isValidHex(hex)) { setColorError('Enter a valid hex colour e.g. #C9A96E'); return; }
                    if (form.colors.includes(hex)) { setColorError('Colour already added'); return; }
                    set({ colors: [...form.colors, hex], newColorInput: '#' });
                    setColorError('');
                  }}
                  className="px-4 py-2 rounded-[9px] bg-deep-blue text-white text-[12px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 flex-shrink-0"
                >
                  Add
                </button>
              </div>
              {colorError && <p className="text-[11px] text-sale mb-2">{colorError}</p>}

              {/* Added colour swatches */}
              {form.colors.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3 p-3 bg-secondary-bg rounded-[10px] border border-border-grey">
                  {form.colors.map((hex, i) => (
                    <div key={hex} className="relative group" title={hex}>
                      <span
                        className="w-8 h-8 rounded-full block border-2 border-white shadow"
                        style={{ backgroundColor: hex }}
                      />
                      <button
                        type="button"
                        onClick={() => set({ colors: form.colors.filter((_, j) => j !== i) })}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sale text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        aria-label={`Remove ${hex}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Field label="Available sizes" hint="Comma-separated: XS, S, M, L, XL, XXL">
                <input className={inputCls} value={form.sizes} onChange={e => set({ sizes: e.target.value })} placeholder="XS, S, M, L, XL, XXL" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Out of stock sizes" hint="Leave blank if all sizes available">
                <input className={inputCls} value={form.outOfStockSizes} onChange={e => set({ outOfStockSizes: e.target.value })} placeholder="XS, XXL" />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer - sticky on mobile */}
        <div className="p-4 md:p-5 border-t border-border-grey flex justify-between gap-3 flex-shrink-0 bg-white sticky bottom-0">
          <button onClick={onClose} className="flex-1 md:flex-none px-5 py-3 md:py-2.5 rounded-[9px] border-2 border-border-grey text-[14px] md:text-[12px] font-bold uppercase tracking-wider hover:border-deep-blue touch-manipulation">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isBusy}
            className="flex-1 md:flex-none px-5 py-3 md:py-2.5 rounded-[9px] bg-deep-blue text-white text-[14px] md:text-[12px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
          >
            {isBusy && <Loader2 className="w-4 h-4 md:w-3.5 h-3.5 animate-spin" />}
            {isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----- Ticker ----- */
function TickerPane({ onChange }: { onChange: () => void }) {
  const ticker = useCms((s) => s.content.ticker);
  const update = (patch: Partial<CmsContent["ticker"]>) => {
    cms.setContent((c) => ({ ...c, ticker: { ...c.ticker, ...patch } }));
    onChange();
  };
  return (
    <div>
      <PageHeader title="Announcement Bar" sub="The scrolling ticker at the very top of every page." />
      <Card>
        <Toggle
          label="Show announcement bar"
          sub="Visible across all pages above the navigation"
          on={ticker.enabled}
          onClick={() => update({ enabled: !ticker.enabled })}
        />
      </Card>
      <Card title={`Messages (${ticker.messages.length})`}>
        <div className="space-y-2">
          {ticker.messages.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} value={m} onChange={(e) => {
                const arr = ticker.messages.slice(); arr[i] = e.target.value; update({ messages: arr });
              }} />
              <button
                onClick={() => update({ messages: ticker.messages.filter((_, j) => j !== i) })}
                className="px-3 rounded-[9px] border border-border-grey text-sale hover:bg-sale/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => update({ messages: [...ticker.messages, "New announcement"] })}
            className="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border-grey text-[12px] font-bold text-deep-blue hover:bg-deep-blue/[0.04] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add message
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ----- Navigation ----- */
function NavPane({ onChange }: { onChange: () => void }) {
  const nav = useCms((s) => s.content.nav);
  const update = (patch: Partial<CmsContent["nav"]>) => {
    cms.setContent((c) => ({ ...c, nav: { ...c.nav, ...patch } }));
    onChange();
  };
  return (
    <div>
      <PageHeader title="Navigation" sub="Brand name and top navigation links." />
      <Card title="Brand">
        <Field label="Brand name"><input className={inputCls} value={nav.brand} onChange={(e) => update({ brand: e.target.value })} /></Field>
      </Card>
      <Card title={`Nav links (${nav.links.length})`}>
        <p className="text-[11px] text-text-muted mb-3">Use <span className="font-mono">/path</span> for routes or <span className="font-mono">/#section</span> for in-page anchors.</p>
        <div className="space-y-2">
          {nav.links.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={inputCls} placeholder="Label" value={l.label} onChange={(e) => {
                const links = nav.links.slice(); links[i] = { ...l, label: e.target.value }; update({ links });
              }} />
              <input className={inputCls} placeholder="/path or /#anchor" value={l.to} onChange={(e) => {
                const links = nav.links.slice(); links[i] = { ...l, to: e.target.value }; update({ links });
              }} />
              <button
                onClick={() => update({ links: nav.links.filter((_, j) => j !== i) })}
                className="px-3 rounded-[9px] border border-border-grey text-sale hover:bg-sale/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => update({ links: [...nav.links, { label: "New", to: "/" }] })}
            className="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border-grey text-[12px] font-bold text-deep-blue hover:bg-deep-blue/[0.04] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add link
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ----- Footer ----- */
function FooterPane({ onChange }: { onChange: () => void }) {
  const footer = useCms((s) => s.content.footer);
  const update = (patch: Partial<CmsContent["footer"]>) => {
    cms.setContent((c) => ({ ...c, footer: { ...c.footer, ...patch } }));
    onChange();
  };
  return (
    <div>
      <PageHeader title="Footer" sub="Tagline, link columns, and copyright." />
      <Card title="About column">
        <div className="grid gap-3">
          <Field label="Tagline"><textarea rows={2} className={inputCls} value={footer.tagline} onChange={(e) => update({ tagline: e.target.value })} /></Field>
          <Field label="Copyright"><input className={inputCls} value={footer.copyright} onChange={(e) => update({ copyright: e.target.value })} /></Field>
        </div>
      </Card>
    </div>
  );
}

// touch CMS_DEFAULT to ensure it remains exported / referenced
void CMS_DEFAULT;

/* ---------------- Orders Pane ---------------- */
function OrdersPane() {
  const { data, isLoading } = useAllOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const orders = data?.data || [];

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-deep-blue" /></div>;

  return (
    <div className="max-w-5xl mx-auto animation-fade-in pb-20">
      <PageHeader title="Orders Management" sub="Track and manage customer WhatsApp orders" />

      <div className="bg-white rounded-2xl border border-border-grey overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border-grey bg-secondary-bg text-[11px] uppercase tracking-wider text-text-muted">
              <th className="px-5 py-4 font-semibold">Order ID & Time</th>
              <th className="px-5 py-4 font-semibold">Customer & Phone</th>
              <th className="px-5 py-4 font-semibold">Items</th>
              <th className="px-5 py-4 font-semibold text-right">Total</th>
              <th className="px-5 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-grey text-[13px]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-text-muted">No orders found.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="hover:bg-secondary-bg/50 transition">
                  <td className="px-5 py-4 align-top">
                    <p className="font-semibold text-deep-blue">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{new Date(o.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-semibold">{o.address?.firstName} {o.address?.lastName}</p>
                    <p className="text-text-muted mt-0.5 font-mono text-[12px]">{o.address?.phone || "No phone"}</p>
                    {(o.referralCode || o.socialApplied) && (
                      <div className="mt-2 flex flex-col gap-1">
                        {o.referralCode && <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sale/10 text-sale uppercase tracking-wider">Ref: {o.referralCode}</span>}
                        {o.socialApplied && <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-deep-blue/10 text-deep-blue uppercase tracking-wider">Social 5% Off</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top max-w-[200px]">
                    <div className="space-y-1">
                      {o.items.map((item, i) => (
                        <p key={i} className="truncate" title={item.name}>
                          {item.quantity}x {item.name} {item.size ? `(${item.size})` : ''}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-right font-mono font-semibold">
                    ₹{o.total.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    <select
                      className="text-[12px] px-2 py-1 rounded border border-border-grey bg-white focus:outline-none focus:border-deep-blue"
                      value={o.status}
                      onChange={(e) => updateStatus({ id: o._id, status: e.target.value as any })}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
