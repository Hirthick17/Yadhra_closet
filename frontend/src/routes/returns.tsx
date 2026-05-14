// T-03: Return Policy page — stub so /returns route resolves (no 404 on footer click)
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
  head: () => ({ meta: [{ title: "Return Policy — Yadhra Closet" }] }),
});

function ReturnsPage() {
  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-3">
          Customer Care
        </p>
        <h1 className="font-serif text-[clamp(32px,5vw,52px)] leading-tight text-deep-blue mb-10">
          Return Policy
        </h1>

        <div className="space-y-8 text-[14px] leading-[1.9] text-text-muted">
          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">7-Day Easy Returns</h2>
            <p>
              Not happy with your purchase? We offer hassle-free returns within 7 days of
              delivery on all unworn items with original tags attached. Simply message us on
              WhatsApp and we will arrange a free pickup.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Eligible Items</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Item must be unworn, unwashed, and in original condition.</li>
              <li>All original tags must be attached.</li>
              <li>Items must be returned in their original packaging where possible.</li>
              <li>Sale items are final sale and not eligible for returns.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Refund Process</h2>
            <p>
              Once we receive and inspect your return, we will process your refund within 3–5
              business days. Refunds are issued to the original payment method or as store
              credit — your choice.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Exchanges</h2>
            <p>
              Want a different size or colour? We are happy to exchange your item. Message us
              on WhatsApp with your order details and we will sort it out personally.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Message us on WhatsApp with your order number and reason for return.</li>
              <li>We'll confirm eligibility and send you a pickup slot.</li>
              <li>Pack the item securely and hand it to our delivery partner.</li>
              <li>Refund or exchange processed within 3–5 days of receipt.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Contact Us</h2>
            <p>
              Questions? Reach us at{" "}
              <a
                href="mailto:yadhra.closet@gmail.com"
                className="text-deep-blue font-semibold hover:underline"
              >
                yadhra.closet@gmail.com
              </a>{" "}
              or WhatsApp us directly from any product page.
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t border-border-grey">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-deep-blue hover:opacity-70 transition-opacity"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
