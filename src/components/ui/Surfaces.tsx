import { ReactNode } from "react";

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-paper-soft border border-line rounded-card p-5 mb-5">
      <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  return (
    <div className="bg-paper-soft border border-line rounded-card p-4 flex items-center gap-3">
      {icon && <div className="text-ink-soft">{icon}</div>}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</div>
        <div className="text-2xl font-semibold text-ink leading-tight">{value}</div>
      </div>
    </div>
  );
}

export function DayChip({
  day,
  active,
  onClick
}: {
  day: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-xs px-2.5 py-1.5 rounded border ${
        active ? "bg-navy text-white border-navy" : "bg-paper border-line text-ink-soft"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {day}
    </button>
  );
}

export function Pill({ tone, children }: { tone: "granted" | "denied" | "neutral"; children: ReactNode }) {
  const tones: Record<string, string> = {
    granted: "bg-signal-granted/15 text-signal-granted",
    denied: "bg-signal-denied/15 text-signal-denied",
    neutral: "bg-navy/10 text-navy"
  };
  return (
    <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full inline-block ${tones[tone]}`}>{children}</span>
  );
}
