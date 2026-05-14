// src/routes/checkout.tsx
// Step 1 (Order Review) now uses cartStore — with full +/- qty and remove controls.
// Step 4 (WhatsApp) saves order to MongoDB first, then opens WhatsApp.
// Design: identical tokens to original (deep-blue, rounded-full, Panel, NavBtns).

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { store, useStore } from "@/lib/store";
import { useCart, cartStore } from "@/lib/cart";
import { useState } from "react";
import { Check, Zap, Truck, Instagram, Facebook, Minus, Plus, X } from "lucide-react";
import { usePlaceOrder } from "@/hooks/useOrders";
import { buildWhatsAppURL } from "@/lib/whatsapp";

// Address state shared between Step2 (capture) and Step4 (send to WhatsApp + MongoDB)
type AddressState = {
  firstName: string; lastName: string; phone: string;
  line1: string; line2: string; city: string; pincode: string;
};
function useAddressState() {
  return useState<AddressState>({
    firstName: '', lastName: '', phone: '',
    line1: '', line2: '', city: '', pincode: '',
  });
}

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — Yadhra Closet" }] }),
});

const STEPS = ["Order", "Address", "Discounts", "Pay"] as const;

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 md:gap-3 mb-10 flex-wrap">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={label} className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                  done
                    ? "bg-deep-blue text-white"
                    : active
                    ? "bg-deep-blue text-white shadow-[0_0_0_6px_rgba(13,26,99,0.15)]"
                    : "bg-secondary-bg text-text-muted border-[1.5px] border-border-grey"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-[12px] font-semibold ${active || done ? "text-deep-blue" : "text-text-muted"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`hidden md:block w-12 h-[1.5px] ${done ? "bg-deep-blue" : "bg-border-grey"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-border-grey rounded-[20px] p-6 md:p-8">{children}</div>;
}

function NavBtns({
  onBack, onNext, backLabel = "Back", nextLabel = "Continue", nextDisabled = false,
}: {
  onBack: () => void; onNext: () => void;
  backLabel?: string; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 mt-8">
      <button
        onClick={onBack}
        className="px-6 py-3 rounded-full border border-border-grey text-accent-blue text-[13px] font-semibold hover:border-deep-blue transition"
      >
        {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="px-8 py-3 rounded-full bg-deep-blue text-white text-[13px] font-semibold hover:shadow-[0_14px_30px_-12px_rgba(13,26,99,0.55)] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const step = useStore((s) => s.currentStep);
  const setStep = (n: 1 | 2 | 3 | 4) => store.set({ currentStep: n });
  // Address captured in Step2, consumed in Step4 for MongoDB + WhatsApp message
  const [address, setAddress] = useAddressState();

  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-12">
        <h1 className="font-serif text-4xl text-deep-blue text-center mb-2">Checkout</h1>
        <p className="text-center text-text-muted text-[13px] mb-8">
          Almost there, you're going to love it.
        </p>
        <StepBar current={step} />
        {step === 1 && <Step1 onNext={() => setStep(2)} onBack={() => navigate({ to: "/catalog" })} />}
        {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} address={address} setAddress={setAddress} />}
        {step === 3 && <Step3 onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4 onBack={() => setStep(3)} address={address} />}
      </div>
    </SiteShell>
  );
}

// ── Step 1 — Order Review with cart controls ──────────────────────────────
function Step1({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <Panel>
        <h2 className="font-serif text-2xl text-deep-blue mb-5">Your Order</h2>
        <div className="py-10 text-center">
          <p className="text-text-muted">Your cart is empty.</p>
          <Link to="/catalog" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-deep-blue text-white text-[13px] font-semibold">
            Shop Now
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <h2 className="font-serif text-2xl text-deep-blue mb-5">Your Order</h2>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 items-start">
            {/* Product image */}
            <Link to="/product/$id" params={{ id: item.slug || item.productId }}>
              <div className="w-[72px] h-[84px] rounded-lg overflow-hidden bg-secondary-bg flex-shrink-0">
                <img
                  src={item.image || "/images/placeholder.jpg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-deep-blue truncate">{item.name}</p>
              <p className="text-[12px] text-text-muted mt-0.5">
                {[item.size && `Size ${item.size}`, item.categoryLabel].filter(Boolean).join(" · ")}
              </p>

              {/* +/- quantity stepper */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center border border-border-grey rounded-full overflow-hidden">
                  <button
                    onClick={() => cartStore.removeItem(item.productId, item.size, item.color)}
                    className="w-8 h-8 flex items-center justify-center text-deep-blue hover:bg-deep-blue hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[28px] text-center text-[13px] font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cartStore.addItem({
                      productId: item.productId, slug: item.slug, name: item.name,
                      price: item.price, image: item.image, size: item.size,
                      color: item.color, categoryLabel: item.categoryLabel,
                    })}
                    className="w-8 h-8 flex items-center justify-center text-deep-blue hover:bg-deep-blue hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => cartStore.deleteLine(item.productId, item.size, item.color)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Line price */}
            <div className="text-right flex-shrink-0">
              <p className="font-mono font-semibold text-[15px]">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </p>
              {item.quantity > 1 && (
                <p className="font-mono text-[11px] text-text-muted">₹{item.price} each</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="mt-6 pt-5 border-t border-border-grey flex justify-between items-baseline">
        <span className="text-[13px] font-semibold text-text-muted">Subtotal</span>
        <span className="font-mono text-[24px] font-semibold text-deep-blue">
          ₹{subtotal.toLocaleString("en-IN")}
        </span>
      </div>

      <NavBtns onBack={onBack} onNext={onNext} />
    </Panel>
  );
}

// ── Step 2 — Address ──────────────────────────────────────────────────────
function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full px-4 py-3 rounded-xl bg-secondary-bg border border-border-grey text-[14px] focus:outline-none focus:border-deep-blue transition"
      />
    </label>
  );
}

function Step2({
  onNext, onBack, address, setAddress
}: {
  onNext: () => void; onBack: () => void;
  address: AddressState; setAddress: React.Dispatch<React.SetStateAction<AddressState>>;
}) {
  const delivery = useStore((s) => s.deliveryExtra);
  const opts = [
    { id: 0,   title: "Standard", sub: "4–6 days · Free",    icon: Truck },
    { id: 150, title: "Fast",     sub: "1–2 days · +₹150",   icon: Zap },
  ] as const;

  const handleNext = () => {
    if (!address.firstName || !address.lastName || !address.phone || !address.line1 || !address.city || !address.pincode) {
      alert("Please fill in all mandatory fields (First Name, Last Name, Phone, Address Line 1, City, Pincode).");
      return;
    }
    onNext();
  };

  const set = (key: keyof AddressState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(a => ({ ...a, [key]: e.target.value }));

  return (
    <Panel>
      <h2 className="font-serif text-2xl text-deep-blue mb-5">Delivery Address</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" placeholder="Priya"  value={address.firstName} onChange={set('firstName')} />
        <Field label="Last Name"  placeholder="Sharma" value={address.lastName}  onChange={set('lastName')} />
      </div>
      <div className="mt-4"><Field label="Phone" placeholder="+91 98765 43210" value={address.phone} onChange={set('phone')} /></div>
      <div className="mt-4"><Field label="Address Line 1" placeholder="Flat / Street"     value={address.line1} onChange={set('line1')} /></div>
      <div className="mt-4"><Field label="Address Line 2" placeholder="Locality / Area" value={address.line2} onChange={set('line2')} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Field label="City"    placeholder="Chennai" value={address.city}    onChange={set('city')} />
        <Field label="Pincode" placeholder="600001"  value={address.pincode} onChange={set('pincode')} />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mt-7">Delivery Speed</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {opts.map((o) => {
          const active = delivery === o.id;
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              onClick={() => store.set({ deliveryExtra: o.id })}
              className={`text-left p-4 rounded-2xl border-2 transition flex items-center gap-4 ${
                active ? "border-deep-blue bg-deep-blue/5" : "border-border-grey bg-white hover:border-deep-blue/40"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-deep-blue" : "text-text-muted"}`} />
              <div className="flex-1">
                <p className="font-semibold text-[14px]">{o.title}</p>
                <p className="text-[12px] text-text-muted">{o.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${active ? "border-deep-blue" : "border-border-grey"}`}>
                {active && <div className="w-2.5 h-2.5 rounded-full bg-deep-blue" />}
              </div>
            </button>
          );
        })}
      </div>
      <NavBtns onBack={onBack} onNext={handleNext} />
    </Panel>
  );
}


// ── Step 3 — Discounts ────────────────────────────────────────────────────
function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const refApplied    = useStore((s) => s.refApplied);
  const socialApplied = useStore((s) => s.socialApplied);
  const [code, setCode]   = useState(refApplied ? "FRIEND5" : "");
  const [refMsg, setRefMsg] = useState(refApplied);

  const apply = () => {
    if (code.trim().length >= 4) { store.set({ refApplied: true }); setRefMsg(true); }
  };
  const toggleSocial = () => store.set({ socialApplied: !socialApplied });

  return (
    <Panel>
      <h2 className="font-serif text-2xl text-deep-blue mb-2">Discounts</h2>
      <p className="text-[13px] text-text-muted mb-5">Got a referral? Follow us for an extra treat.</p>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Referral Code</p>
      <div className="flex gap-2 mt-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-3 rounded-xl bg-secondary-bg border border-border-grey text-[14px] focus:outline-none focus:border-deep-blue uppercase tracking-wider"
        />
        <button onClick={apply} className="px-6 rounded-xl bg-deep-blue text-white font-semibold text-[13px]">
          Apply
        </button>
      </div>
      {refMsg && refApplied && <p className="text-success text-[12px] font-semibold mt-2">✓ 5% referral discount applied!</p>}

      <div className="mt-7 p-5 rounded-2xl border border-border-grey flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 flex gap-4 items-center">
          <div className="flex gap-2">
            <a href="https://instagram.com/yadhra.closet" target="_blank" rel="noreferrer" onClick={toggleSocial} className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center hover:bg-deep-blue hover:text-white transition group">
              <Instagram className="w-5 h-5 text-deep-blue group-hover:text-white transition" />
            </a>
            <a href="https://facebook.com/yadhra.closet" target="_blank" rel="noreferrer" onClick={toggleSocial} className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center hover:bg-deep-blue hover:text-white transition group">
              <Facebook className="w-5 h-5 text-deep-blue group-hover:text-white transition" />
            </a>
          </div>
          <div>
            <p className="font-semibold text-[14px]">Follow us for 5% off</p>
            <p className="text-[12px] text-text-muted">Tap an icon to visit and toggle discount.</p>
          </div>
        </div>
        <div className={`w-12 h-7 rounded-full relative transition cursor-pointer ${socialApplied ? "bg-deep-blue" : "bg-border-grey"}`} onClick={toggleSocial}>
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${socialApplied ? "left-[22px]" : "left-0.5"}`} />
        </div>
      </div>
      {socialApplied && <p className="text-success text-[12px] font-semibold mt-2">✓ 5% social discount applied!</p>}

      <NavBtns onBack={onBack} onNext={onNext} />
    </Panel>
  );
}

// ── Step 4 — WhatsApp Checkout ────────────────────────────────────────────
// T-01: Payment gateway replaced with WhatsApp redirect.
// ORDER IS SAVED TO MONGODB FIRST — only then does WhatsApp open.
// If API call fails → error shown, WhatsApp does NOT open.
function Step4({ onBack, address }: { onBack: () => void; address: AddressState }) {
  const refApplied    = useStore((s) => s.refApplied);
  const socialApplied = useStore((s) => s.socialApplied);
  const delivery      = useStore((s) => s.deliveryExtra);
  const { items, subtotal } = useCart();
  const { mutate: placeOrder, isPending } = usePlaceOrder();
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  const discPct = (refApplied ? 0.05 : 0) + (socialApplied ? 0.05 : 0);
  const disc    = Math.floor(subtotal * discPct);
  const total   = subtotal + delivery - disc;

  const discLabel = [refApplied && "Referral 5%", socialApplied && "Social 5%"]
    .filter(Boolean).join(" + ");

  const handleWhatsAppCheckout = () => {
    setErr(null);
    placeOrder(
      {
        items: items.map(i => ({
          productId: i.productId,
          name:      i.name,
          price:     i.price,
          quantity:  i.quantity,
          size:      i.size,
          color:     i.color,
        })),
        address: {
          firstName: address.firstName,
          lastName:  address.lastName,
          phone:     address.phone,
          line1:     address.line1,
          city:      address.city,
          pincode:   address.pincode,
        },
        referralCode: refApplied ? "FRIEND5" : undefined,
        socialApplied,
        total,
      },
      {
        onSuccess: (data) => {
          const addrStr = [address.line1, address.city, address.pincode].filter(Boolean).join(', ');
          const url = buildWhatsAppURL({
            orderId:  data.data._id,
            customer: `${address.firstName} ${address.lastName}`.trim() || 'Customer',
            items:    items.map(i => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
            total,
            address:  addrStr || 'Address not provided',
          });
          // Open WhatsApp in new tab — must stay inside onClick handler
          window.open(url, '_blank', 'noopener,noreferrer');
          cartStore.clearCart();
          store.set({ currentStep: 1 });
          // T-01: Navigate to /success (public page) not /orders (requires auth)
          // WhatsApp is already open in a new tab — the seller manages from there.
          navigate({ to: '/success' });
        },
        onError: (e) => {
          setErr(`Could not place order: ${(e as Error).message}. Please try again.`);
        },
      }
    );
  };

  return (
    <Panel>
      <h2 className="font-serif text-2xl text-deep-blue mb-5">Review & Complete</h2>

      {/* Order summary */}
      <div className="bg-secondary-bg rounded-2xl p-5 space-y-2.5 text-[14px]">
        <Row label="Items"    value={`₹${subtotal.toLocaleString("en-IN")}`} />
        <Row label="Delivery" value={delivery === 0 ? "Free" : `+₹${delivery}`} />
        {disc > 0 && <Row label={`Discount (${discLabel})`} value={`−₹${disc}`} valueClass="text-success" />}
        <div className="border-t border-border-grey pt-3 flex justify-between items-baseline">
          <span className="text-[13px] uppercase tracking-wider font-semibold text-text-muted">Total</span>
          <span className="font-mono text-[32px] font-semibold text-deep-blue">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* WhatsApp info banner */}
      <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="text-[13px] text-emerald-800 font-medium leading-relaxed">
          💬 Your order will be sent to our WhatsApp. We will confirm and share payment details within a few minutes.
          <span className="block mt-1 text-[12px] text-emerald-600 font-normal">Cash on delivery · Bank transfer · As agreed with seller</span>
        </p>
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">{err}</p>
      )}

      {/* WhatsApp CTA button */}
      <button
        onClick={handleWhatsAppCheckout}
        disabled={isPending || items.length === 0}
        className="w-full mt-6 py-4 rounded-full font-semibold text-white text-[15px] flex items-center justify-center gap-2.5 transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#25D366' }}
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            Placing Order...
          </>
        ) : (
          <>💬 Complete Order on WhatsApp</>
        )}
      </button>

      <div className="mt-5">
        <button onClick={onBack} className="text-[13px] font-semibold text-text-muted hover:text-deep-blue transition-colors">
          ← Back to Discounts
        </button>
      </div>
    </Panel>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      {/* font-mono: all line-item values are prices/numbers — tabular spacing for alignment */}
      <span className={`font-mono font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
