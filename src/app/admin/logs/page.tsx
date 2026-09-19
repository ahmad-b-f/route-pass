"use client";

import { useEffect, useMemo, useState } from "react";
import { listScanLogs, NotConfiguredError } from "@/lib/db";
import { ScanLog } from "@/lib/types";
import { Panel, Pill } from "@/components/ui/Surfaces";

export default function LogsPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listScanLogs()
      .then(setLogs)
      .catch((e) => setError(e instanceof NotConfiguredError ? e.message : "Could not load scan log."));
  }, []);

  const anomalies = useMemo(() => {
    const byStudentDay = new Map<string, Set<string>>();
    logs
      .filter((l) => l.result === "granted")
      .forEach((l) => {
        const day = l.timestamp.slice(0, 10);
        const key = `${l.student_id}:${day}`;
        if (!byStudentDay.has(key)) byStudentDay.set(key, new Set());
        byStudentDay.get(key)!.add(l.bus_id);
      });
    const flagged: { studentName: string; day: string; busCount: number }[] = [];
    byStudentDay.forEach((buses, key) => {
      if (buses.size > 1) {
        const [studentId, day] = key.split(":");
        const example = logs.find((l) => l.student_id === studentId);
        flagged.push({ studentName: example?.student_name ?? studentId, day, busCount: buses.size });
      }
    });
    return flagged;
  }, [logs]);

  if (error) {
    return (
      <Panel title="Scan log">
        <p className="text-sm text-ink-soft">{error}</p>
      </Panel>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] text-ink-soft">AUDIT</div>
        <h1 className="text-2xl font-bold text-ink">Scan log</h1>
      </div>

      {anomalies.length > 0 && (
        <Panel title="Anomalies">
          <ul className="space-y-1.5">
            {anomalies.map((a, i) => (
              <li key={i} className="text-sm text-signal-denied">
                {a.studentName} was granted on {a.busCount} different buses on {a.day} — review.
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="All scans">
        {logs.length === 0 ? (
          <p className="text-sm text-ink-soft">No scans recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left font-mono text-[11px] text-ink-soft border-b border-ink">
                  <th className="py-1.5">Time</th>
                  <th className="py-1.5">Student</th>
                  <th className="py-1.5">Bus</th>
                  <th className="py-1.5">Result</th>
                  <th className="py-1.5">Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-line">
                    <td className="py-2 font-mono text-[11px] text-ink-soft">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2">{l.student_name}</td>
                    <td className="py-2">{l.bus_label}</td>
                    <td className="py-2">
                      <Pill tone={l.result === "granted" ? "granted" : "denied"}>{l.result}</Pill>
                    </td>
                    <td className="py-2 text-ink-soft">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
