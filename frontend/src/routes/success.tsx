import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Package } from "lucide-react";

export const Route = createFileRoute("/success")({
  component: Success,
  head: () => ({ meta: [{ title: "Order Confirmed — Yadhra Closet" }] }),
});

function Success() {
  return (
    <SiteShell>
      <div className="max-w-xl mx-auto px-5 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-[88px] h-[88px] rounded-full border-2 border-success bg-success/10 flex items-center justify-center text-[42px] pop-in">
          ✅
        </div>
        <h1 className="font-serif text-5xl mt-6 text-deep-blue">Order Placed! 🎉</h1>
        <p className="text-[15px] text-text-muted mt-3 max-w-md">
          Thank you for contacting Yadhra creations you made a wonderful decision of selecting us. Our team will connect with you in whatsapp.
        </p>

        <div className="mt-8 inline-flex items-center gap-3 bg-secondary-bg rounded-2xl px-5 py-4">
          <Package className="w-5 h-5 text-deep-blue" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Next Steps</p>
            <p className="font-semibold text-[14px]">Await our WhatsApp message</p>
          </div>
        </div>

        <p className="text-[13px] text-text-muted mt-4">Order #YC2026051203 · Confirmation sent to your phone</p>

        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          <Link to="/" className="px-7 py-3.5 rounded-full bg-deep-blue text-white text-[13px] font-semibold hover:shadow-[0_14px_30px_-12px_rgba(13,26,99,0.55)] transition">🏠 Back to Home</Link>
          <Link to="/catalog" className="px-7 py-3.5 rounded-full border border-deep-blue text-deep-blue text-[13px] font-semibold hover:bg-deep-blue hover:text-white transition-colors">👗 Continue Shopping</Link>
        </div>
      </div>
    </SiteShell>
  );
}
