import { useCms } from "@/lib/cms";

export function Ticker() {
  const { enabled, messages } = useCms((s) => s.content.ticker);
  if (!enabled || messages.length === 0) return null;
  const all = [...messages, ...messages, ...messages, ...messages];
  return (
    <div className="bg-deep-blue text-white overflow-hidden h-9 flex items-center">
      <div className="flex gap-12 ticker-track whitespace-nowrap text-[11px] font-semibold tracking-[0.12em] uppercase pl-12">
        {all.map((m, i) => (
          <span key={i} className="flex items-center gap-3">
            {m} <span className="opacity-40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
