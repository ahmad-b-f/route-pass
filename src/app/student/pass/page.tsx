"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCachedStudent,
  getCachedBus,
  clearCachedStudent,
  hasUsedLocally,
  markUsedLocally,
  addLocalReceipt
} from "@/lib/session";
import { verifyBusQrPayload, evaluateCheckInForStudent } from "@/lib/verification";
import { insertScanLog } from "@/lib/db";
import { getDayColors, isoDate, todayName } from "@/lib/days";
import { Bus, Student } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { CheckSignalIcon, DenySignalIcon, QrIcon, ReceiptIcon, LogoutIcon } from "@/components/icons";

type ScanState = "idle" | "scanning" | "result";

export default function StudentPassPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<{ granted: boolean; reason: string; color: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const s = getCachedStudent();
    if (!s) {
      router.replace("/student");
      return;
    }
    setStudent(s);
    setBus(getCachedBus());
  }, [router]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // scanner may already be stopped
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setScanError(null);
    setState("scanning");
    const { Html5Qrcode } = await import("html5-qrcode");
    const instance = new Html5Qrcode("qr-reader");
    scannerRef.current = instance;
    try {
      await instance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decodedText: string) => {
          await stopScanner();
          await handleScan(decodedText);
        },
        () => {
          // per-frame decode miss — expected while searching, ignore
        }
      );
    } catch {
      setScanError("Camera access failed. Check permissions and try again.");
      setState("idle");
    }
  }, [stopScanner]);

  async function handleScan(decodedText: string) {
    if (!student) return;
    const today = todayName();
    const date = isoDate();
    const colors = getDayColors();

    if (!bus) {
      setResult({ granted: false, reason: "no bus assigned to your account yet", color: "#B23A2E" });
      setState("result");
      return;
    }

    let signatureValid = false;
    try {
      const decodedBusId = await verifyBusQrPayload(decodedText, bus.qr_secret);
      signatureValid = decodedBusId === bus.id;
    } catch {
      signatureValid = false;
    }

    const alreadyUsed = hasUsedLocally(student.id, bus.id, date);
    const decision = evaluateCheckInForStudent(student, today, alreadyUsed, signatureValid);
    const dayColor = today === "Sun" ? "#B23A2E" : colors[today];

    setResult({ granted: decision.granted, reason: decision.reason, color: decision.granted ? dayColor : "#B23A2E" });
    setState("result");

    if (decision.granted) {
      markUsedLocally(student.id, bus.id, date);
    }

    addLocalReceipt({
      date,
      weekDay: today,
      busLabel: bus.label,
      studentName: student.name,
      color: dayColor,
      result: decision.granted ? "granted" : "denied",
      reason: decision.reason,
      timestamp: new Date().toISOString()
    });

    // Best-effort sync — boarding never waits on this.
    insertScanLog({
      student_id: student.id,
      student_name: student.name,
      bus_id: bus.id,
      bus_label: bus.label,
      route_name: null,
      timestamp: new Date().toISOString(),
      result: decision.granted ? "granted" : "denied",
      reason: decision.reason,
      day_color: dayColor
    }).catch(() => {
      // Offline — log will simply not sync this time; local receipt still stands.
    });
  }

  function resetScan() {
    setResult(null);
    setState("idle");
  }

  function logout() {
    clearCachedStudent();
    router.replace("/student");
  }

  if (!student) return null;

  const today = todayName();
  const isPaidToday = today !== "Sun" && student.paid_days.includes(today);

  return (
    <main className="min-h-screen flex flex-col px-5 py-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono text-[11px] text-ink-soft">ROUTE PASS</div>
          <div className="font-semibold text-ink">{student.name}</div>
        </div>
        <button onClick={logout} className="text-ink-soft hover:text-ink" aria-label="Sign out">
          <LogoutIcon size={18} />
        </button>
      </div>

      <div className="bg-navy text-white rounded-card p-5 mb-4">
        <div className="font-mono text-[11px] text-white/60">{student.roll_no}</div>
        <div className="text-lg font-semibold mb-3">{bus ? bus.label : "No bus assigned"}</div>
        <div className="font-mono text-xs text-white/80">
          {today.toUpperCase()} &middot; {isPaidToday ? "scheduled travel day" : "not a paid day"}
        </div>
      </div>

      {state === "idle" && (
        <Button onClick={startScanner} className="w-full py-4 text-base">
          <QrIcon size={18} />
          Scan bus QR
        </Button>
      )}

      {state === "scanning" && (
        <div className="bg-ink rounded-card p-3">
          <div id="qr-reader" className="rounded overflow-hidden" />
          <Button
            variant="ghost"
            className="w-full mt-3 text-paper border-white/30"
            onClick={async () => {
              await stopScanner();
              setState("idle");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {scanError && <p className="text-sm text-signal-denied mt-3">{scanError}</p>}

      {state === "result" && result && (
        <div
          className="rounded-card p-6 text-center text-white flex flex-col items-center gap-2"
          style={{ backgroundColor: result.color }}
        >
          {result.granted ? <CheckSignalIcon size={40} /> : <DenySignalIcon size={40} />}
          <div className="text-xl font-bold">{result.granted ? "VERIFIED" : "DENIED"}</div>
          <div className="font-mono text-xs opacity-85">{result.reason}</div>
          <Button variant="ghost" className="mt-3 text-white border-white/40" onClick={resetScan}>
            Scan again
          </Button>
        </div>
      )}

      <Link
        href="/student/receipts"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft hover:text-ink font-mono"
      >
        <ReceiptIcon size={15} />
        View my receipts
      </Link>
    </main>
  );
}
