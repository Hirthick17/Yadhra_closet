// T-03: Privacy Policy page — stub so /privacy route resolves (no 404 on footer click)
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy Policy — Yadhra Closet" }] }),
});

function PrivacyPage() {
  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-3">
          Legal
        </p>
        <h1 className="font-serif text-[clamp(32px,5vw,52px)] leading-tight text-deep-blue mb-10">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-[14px] leading-[1.9] text-text-muted">
          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Information We Collect</h2>
            <p>
              When you place an order via WhatsApp, we collect your name, phone number, and
              delivery address. This information is used solely to fulfil your order and
              communicate with you about your purchase.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">How We Use Your Information</h2>
            <p>
              Your personal details are used only for order processing, delivery coordination,
              and post-purchase support. We do not sell or share your data with any third party
              for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Data Storage</h2>
            <p>
              Order records are stored securely in our internal system. WhatsApp conversations
              are subject to WhatsApp's own privacy policy. We retain order data for a minimum
              of 12 months for dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Your Rights</h2>
            <p>
              You may request deletion of your personal data at any time by messaging us on
              WhatsApp or emailing us. We will process your request within 7 business days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-deep-blue mb-3">Contact</h2>
            <p>
              Questions? Reach us at{" "}
              <a
                href="mailto:yadhra.closet@gmail.com"
                className="text-deep-blue font-semibold hover:underline"
              >
                yadhra.closet@gmail.com
              </a>
              .
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
