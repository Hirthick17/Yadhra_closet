// Return Policy page — All sales are final, no returns or exchanges
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
        <h1 className="font-serif text-[clamp(32px,5vw,52px)] leading-tight text-deep-blue mb-6">
          Return Policy
        </h1>

        {/* Prominent no-return banner */}
        <div className="mb-10 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex gap-4 items-start">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div>
            <p className="font-bold text-amber-900 text-[16px]">No Returns or Exchanges</p>
            <p className="text-amber-800 text-[13px] mt-1 leading-relaxed">
              All sales at Yadhra Closet are final. We do not accept returns or exchanges
              under any circumstances. Please read the full policy below.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-[14px] leading-[1.9] text-text-muted">
          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">All Sales Are Final</h2>
            <p>
              We appreciate your trust in Yadhra Closet. Please note that{" "}
              <strong className="text-deep-blue">we do not accept returns or exchanges</strong>{" "}
              on any orders once they have been placed and confirmed. All purchases are considered
              final at the time of order.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">No Returns or Exchanges</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not offer returns for any reason, including change of mind.</li>
              <li>We do not offer size or colour exchanges after an order is confirmed.</li>
              <li>Customised or made-to-order items cannot be returned or cancelled.</li>
              <li>Sale items are final sale and are strictly non-returnable.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Please Shop Carefully</h2>
            <p>
              We strongly encourage you to review product descriptions, size guides, and images
              carefully before placing your order. If you have any questions about a product,
              please contact us on WhatsApp before purchasing — we are happy to help you make
              the right choice.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Damaged or Wrong Items</h2>
            <p>
              In the rare event that you receive a damaged item or an incorrect product, please
              contact us within 24 hours of delivery with clear photos of the item and
              packaging. We will assess each case individually and work towards a fair
              resolution.
            </p>
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
