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
  addLocalReceipt,
  LocalReceipt
} from "@/lib/session";
import { verifyBusQrPayload, evaluateCheckInForStudent, createBusQrPayload } from "@/lib/verification";
import { insertScanLog } from "@/lib/db";
import { getDayColors, isoDate, todayName } from "@/lib/days";
import { Bus, Student } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { CheckSignalIcon, DenySignalIcon, QrIcon, ReceiptIcon, LogoutIcon } from "@/components/icons";

type ScanState = "idle" | "scanning" | "manual" | "result";

interface ScanResultDetails {
  granted: boolean;
  reason: string;
  color: string;
  busLabel: string;
  studentName: string;
  rollNo: string;
  today: string;
  date: string;
  timestamp: string;
}

export default function StudentPassPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResultDetails | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualQr, setManualQr] = useState("");
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const s = getCachedStudent();
    if (!s) {
      router.replace("/");
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
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const instance = new Html5Qrcode("qr-reader");
      scannerRef.current = instance;
      await instance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decodedText: string) => {
          await stopScanner();
          await handleScan(decodedText);
        },
        () => {
          // per-frame decode miss — expected while searching
        }
      );
    } catch {
      setScanError("Camera access failed or unavailable. Try using the manual test scanner below.");
      setState("idle");
    }
  }, [stopScanner]);

  async function handleScan(decodedText: string) {
    if (!student) return;
    const today = todayName();
    const date = isoDate();
    const colors = getDayColors();
    const timestamp = new Date().toISOString();

    const targetBus = bus;
    const busLabel = targetBus ? targetBus.label : "Unassigned Bus";

    let signatureValid = false;
    if (targetBus && targetBus.qr_secret) {
      try {
        const decodedBusId = await verifyBusQrPayload(decodedText, targetBus.qr_secret);
        signatureValid = decodedBusId === targetBus.id;
      } catch {
        signatureValid = false;
      }
    }

    const alreadyUsed = targetBus ? hasUsedLocally(student.id, targetBus.id, date) : false;
    const decision = targetBus
      ? evaluateCheckInForStudent(student, today, alreadyUsed, signatureValid)
      : { granted: false, reason: "No bus assigned to your student account" };

    const dayColor = today === "Sun" ? "#B23A2E" : colors[today] || "#1E293B";

    const resultDetails: ScanResultDetails = {
      granted: decision.granted,
      reason: decision.reason,
      color: decision.granted ? dayColor : "#B23A2E",
      busLabel,
      studentName: student.name,
      rollNo: student.roll_no,
      today,
      date,
      timestamp
    };

    setResult(resultDetails);
    setState("result");

    if (decision.granted && targetBus) {
      markUsedLocally(student.id, targetBus.id, date);
    }

    // Always generate and persist local receipt
    const receipt: LocalReceipt = {
      date,
      weekDay: today,
      busLabel,
      studentName: student.name,
      color: dayColor,
      result: decision.granted ? "granted" : "denied",
      reason: decision.reason,
      timestamp
    };

    addLocalReceipt(receipt);

    if (targetBus) {
      insertScanLog({
        student_id: student.id,
        student_name: student.name,
        bus_id: targetBus.id,
        bus_label: targetBus.label,
        route_name: null,
        timestamp,
        result: decision.granted ? "granted" : "denied",
        reason: decision.reason,
        day_color: dayColor
      }).catch(() => {
        // Offline sync fails silently
      });
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualQr.trim()) return;
    await handleScan(manualQr.trim());
  }

  async function handleSimulateAssignedBusScan() {
    if (!bus) {
      await handleScan("NO_BUS_ASSIGNED");
      return;
    }
    const payload = await createBusQrPayload(bus.id, bus.qr_secret);
    await handleScan(payload);
  }

  function resetScan() {
    setResult(null);
    setManualQr("");
    setState("idle");
  }

  function logout() {
    clearCachedStudent();
    router.replace("/");
  }

  if (!student) return null;

  const today = todayName();
  const isPaidToday = today !== "Sun" && student.paid_days.includes(today);

  return (
    <main className="min-h-screen flex flex-col px-5 py-6 max-w-sm mx-auto bg-paper">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono text-[11px] text-ink-soft">ROUTE PASS</div>
          <div className="font-semibold text-ink">{student.name}</div>
        </div>
        <button onClick={logout} className="text-ink-soft hover:text-ink flex items-center gap-1 font-mono text-xs" aria-label="Sign out">
          <LogoutIcon size={16} />
          Sign out
        </button>
      </div>

      <div className="bg-navy text-white rounded-card p-5 mb-4 shadow-sm">
        <div className="font-mono text-[11px] text-white/60">{student.roll_no}</div>
        <div className="text-lg font-semibold mb-3">{bus ? bus.label : "No bus assigned"}</div>
        <div className="font-mono text-xs text-white/80">
          {today.toUpperCase()} &middot; {isPaidToday ? "scheduled travel day" : "not a paid day"}
        </div>
      </div>

      {state === "idle" && (
        <div className="space-y-3">
          <Button onClick={startScanner} className="w-full py-4 text-base">
            <QrIcon size={18} />
            Scan bus QR with camera
          </Button>

          <Button variant="ghost" onClick={() => setState("manual")} className="w-full py-2.5 text-xs font-mono">
            Test QR / Manual Code Input
          </Button>
        </div>
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

      {state === "manual" && (
        <form onSubmit={handleManualSubmit} className="bg-paper-soft border border-line rounded-card p-4 space-y-3">
          <div className="font-semibold text-xs text-ink uppercase tracking-wide font-mono">
            Manual / Test QR Input
          </div>
          <Field label="QR Code Payload">
            <Input
              value={manualQr}
              onChange={(e) => setManualQr(e.target.value)}
              placeholder='Paste {"busId": "...", "signature": "..."}'
            />
          </Field>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Verify QR Code
            </Button>
            {bus && (
              <Button type="button" variant="ghost" onClick={handleSimulateAssignedBusScan} className="w-full text-xs">
                Simulate Assigned Bus QR Scan
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => setState("idle")} className="w-full text-xs">
              Back
            </Button>
          </div>
        </form>
      )}

      {scanError && <p className="text-sm text-signal-denied mt-3 font-medium">{scanError}</p>}

      {state === "result" && result && (
        <div className="space-y-4">
          {/* Status Header */}
          <div
            className="rounded-card p-6 text-center text-white flex flex-col items-center gap-2 shadow-md transition-colors"
            style={{ backgroundColor: result.color }}
          >
            {result.granted ? <CheckSignalIcon size={44} /> : <DenySignalIcon size={44} />}
            <div className="text-2xl font-bold tracking-tight">
              {result.granted ? "BOARDING VERIFIED" : "BOARDING DENIED"}
            </div>
            <div className="font-mono text-xs opacity-90">{result.reason}</div>
          </div>

          {/* Official Digital Boarding Receipt */}
          <div className="bg-paper-soft border border-line rounded-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">Official Digital Receipt</span>
              <span className="font-mono text-[11px] font-semibold text-navy">{result.today}</span>
            </div>

            <div className="space-y-1.5 text-xs text-ink font-mono">
              <div className="flex justify-between">
                <span className="text-ink-soft">Passenger:</span>
                <span className="font-semibold">{result.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Roll No:</span>
                <span>{result.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Bus Fleet:</span>
                <span className="font-semibold">{result.busLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Date &amp; Time:</span>
                <span>{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-line/60">
                <span className="text-ink-soft">Receipt Status:</span>
                <span className={`font-semibold ${result.granted ? "text-signal-granted" : "text-signal-denied"}`}>
                  {result.granted ? "Saved to Receipts" : "Denied Log Saved"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/student/receipts" className="w-full">
              <Button variant="primary" className="w-full py-2.5">
                <ReceiptIcon size={16} />
                View All My Receipts
              </Button>
            </Link>

            <Button variant="ghost" onClick={resetScan} className="w-full py-2.5">
              Scan another QR code
            </Button>
          </div>
        </div>
      )}

      <Link
        href="/student/receipts"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft hover:text-ink font-mono"
      >
        <ReceiptIcon size={15} />
        View my receipts history
      </Link>
    </main>
  );
}
