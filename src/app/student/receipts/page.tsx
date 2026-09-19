"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLocalReceipts, LocalReceipt } from "@/lib/session";
import { ReceiptIcon, CheckSignalIcon, DenySignalIcon } from "@/components/icons";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<LocalReceipt[]>([]);

  useEffect(() => {
    setReceipts(getLocalReceipts());
  }, []);

  return (
    <main className="min-h-screen px-5 py-6 max-w-sm mx-auto">
      <div className="mb-6">
        <Link href="/student/pass" className="font-mono text-[11px] text-ink-soft">
          &larr; Back to pass
        </Link>
        <h1 className="text-xl font-bold text-ink mt-1">My receipts</h1>
      </div>

      {receipts.length === 0 ? (
        <p className="text-sm text-ink-soft">No check-ins yet — scan a bus QR to get started.</p>
      ) : (
        <div className="space-y-3">
          {receipts.map((r, i) => (
            <div key={i} className="rounded-card p-4 border border-line" style={{ backgroundColor: `${r.color}1A` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {r.result === "granted" ? (
                    <CheckSignalIcon size={16} className="text-signal-granted" />
                  ) : (
                    <DenySignalIcon size={16} className="text-signal-denied" />
                  )}
                  <span className="font-semibold text-sm text-ink">{r.busLabel}</span>
                </div>
                <span className="font-mono text-[11px] text-ink-soft">{r.weekDay}</span>
              </div>
              <div className="font-mono text-[11px] text-ink-soft">
                {new Date(r.timestamp).toLocaleString()}
              </div>
              <div className="text-xs text-ink-soft mt-1">{r.reason}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-2 text-ink-soft">
        <ReceiptIcon size={14} />
        <span className="font-mono text-[11px]">Stored on this device only</span>
      </div>
    </main>
  );
}
