import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useCms } from "@/lib/cms";

export const Route = createFileRoute("/faq")({
  component: FAQ,
  head: () => ({ meta: [{ title: "FAQ — Yadhra Closet" }] }),
});

function FAQ() {
  const { title, items } = useCms((s) => s.content.faq);
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SiteShell>
      <div className="max-w-[860px] mx-auto px-5 md:px-10 py-16">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Help Center</p>
        <h1 className="text-center font-serif text-5xl mt-2 text-deep-blue">{title}</h1>

        <div className="mt-12 space-y-3">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`bg-white border rounded-[18px] overflow-hidden transition-colors ${isOpen ? "border-deep-blue" : "border-border-grey"}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-[15px]">{f.q}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-deep-blue text-white rotate-45" : "bg-secondary-bg text-deep-blue"}`}>
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                <div className={`grid transition-all duration-400 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[14px] text-text-muted leading-[1.8]">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
