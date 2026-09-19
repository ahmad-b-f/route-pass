import Link from "next/link";
import { BusIcon, StudentIcon, SettingsIcon } from "@/components/icons";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-paper">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="font-mono text-[11px] tracking-wide text-ink-soft mb-1">TRANSPORT VERIFICATION</div>
          <h1 className="text-3xl font-bold text-ink">Route Pass</h1>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 border border-line rounded-card bg-paper-soft px-5 py-4 hover:border-ink transition-colors"
          >
            <SettingsIcon size={22} className="text-navy" />
            <div>
              <div className="font-semibold text-ink">Admin Portal</div>
              <div className="text-xs text-ink-soft">Students, buses, routes, analytics</div>
            </div>
          </Link>

          <Link
            href="/student"
            className="flex items-center gap-3 border border-line rounded-card bg-navy text-white px-5 py-4 hover:bg-navy-soft transition-colors"
          >
            <StudentIcon size={22} />
            <div>
              <div className="font-semibold">Student Site</div>
              <div className="text-xs text-white/70">Sign in and board with your pass</div>
            </div>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-ink-soft">
          <BusIcon size={16} />
          <span className="font-mono text-[11px]">Works offline once your day-pass is cached</span>
        </div>
      </div>
    </main>
  );
}
