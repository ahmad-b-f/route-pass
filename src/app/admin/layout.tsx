import Link from "next/link";
import {
  BusIcon,
  RouteIcon,
  StudentIcon,
  ChartIcon,
  ReceiptIcon,
  SettingsIcon
} from "@/components/icons";
import { ConfigBanner } from "@/components/admin/ConfigBanner";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: ChartIcon },
  { href: "/admin/students", label: "Students", icon: StudentIcon },
  { href: "/admin/buses", label: "Buses", icon: BusIcon },
  { href: "/admin/routes", label: "Routes", icon: RouteIcon },
  { href: "/admin/logs", label: "Scan log", icon: ReceiptIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-56 border-r border-line bg-paper-soft px-4 py-6 hidden md:flex md:flex-col">
        <div className="mb-8 px-2">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft">ROUTE PASS</div>
          <div className="font-semibold text-ink">Admin Portal</div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-card text-sm text-ink hover:bg-navy hover:text-white transition-colors"
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <Link href="/" className="font-mono text-[11px] text-ink-soft hover:text-ink">
            &larr; Back to role select
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden border-b border-line bg-paper-soft px-4 py-3 flex items-center gap-2">
          <span className="font-semibold text-ink">Route Pass — Admin</span>
        </div>
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <ConfigBanner />
          {children}
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper-soft border-t border-line flex justify-between px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2 py-1 text-ink-soft">
                <Icon size={18} />
                <span className="text-[10px] font-mono">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
