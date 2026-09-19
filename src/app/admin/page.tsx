"use client";

import { useEffect, useMemo, useState } from "react";
import { listStudents, listBuses, listRoutes, listScanLogs, NotConfiguredError } from "@/lib/db";
import { Bus, Route, ScanLog, Student, WEEK_DAYS, WeekDay } from "@/lib/types";
import { isoDate } from "@/lib/days";
import { Panel, StatCard, Pill } from "@/components/ui/Surfaces";
import { StudentIcon, BusIcon, RouteIcon, CalendarIcon, CheckSignalIcon } from "@/components/icons";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeekDay>(WEEK_DAYS[0]);

  useEffect(() => {
    async function load() {
      try {
        const [s, b, r, l] = await Promise.all([listStudents(), listBuses(), listRoutes(), listScanLogs()]);
        setStudents(s);
        setBuses(b);
        setRoutes(r);
        setLogs(l);
        setError(null);
      } catch (e) {
        setError(e instanceof NotConfiguredError ? e.message : "Could not load dashboard data.");
      }
    }
    load();
  }, []);

  const today = isoDate();

  const perBus = useMemo(() => {
    return buses.map((bus) => ({
      bus,
      total: students.filter((s) => s.bus_id === bus.id).length,
      checkedInToday: logs.filter(
        (l) => l.bus_id === bus.id && l.result === "granted" && l.timestamp.slice(0, 10) === today
      ).length
    }));
  }, [buses, students, logs, today]);

  const perRoute = useMemo(() => {
    return routes.map((route) => {
      const busIds = buses.filter((b) => b.route_id === route.id).map((b) => b.id);
      return {
        route,
        total: students.filter((s) => s.bus_id && busIds.includes(s.bus_id)).length
      };
    });
  }, [routes, buses, students]);

  const scheduledOnSelectedDay = useMemo(
    () => students.filter((s) => s.paid_days.includes(selectedDay)).length,
    [students, selectedDay]
  );

  const checkedInToday = logs.filter((l) => l.result === "granted" && l.timestamp.slice(0, 10) === today).length;

  if (error) {
    return (
      <Panel title="Dashboard">
        <p className="text-sm text-ink-soft">{error}</p>
      </Panel>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] text-ink-soft">OVERVIEW</div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total students" value={students.length} icon={<StudentIcon size={20} />} />
        <StatCard label="Total buses" value={buses.length} icon={<BusIcon size={20} />} />
        <StatCard label="Total routes" value={routes.length} icon={<RouteIcon size={20} />} />
        <StatCard label="Checked in today" value={checkedInToday} icon={<CheckSignalIcon size={20} />} />
      </div>

      <Panel
        title="Students scheduled by day"
        action={
          <div className="flex gap-1">
            {WEEK_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`font-mono text-[11px] px-2 py-1 rounded ${
                  selectedDay === d ? "bg-navy text-white" : "text-ink-soft border border-line"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={22} className="text-navy" />
          <div>
            <div className="text-2xl font-semibold text-ink">{scheduledOnSelectedDay}</div>
            <div className="text-xs text-ink-soft font-mono">students entitled to ride on {selectedDay}</div>
          </div>
        </div>
      </Panel>

      <Panel title="Per bus">
        {perBus.length === 0 ? (
          <p className="text-sm text-ink-soft">No buses added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] text-ink-soft border-b border-ink">
                <th className="py-1.5">Bus</th>
                <th className="py-1.5">Enrolled</th>
                <th className="py-1.5">Checked in today</th>
              </tr>
            </thead>
            <tbody>
              {perBus.map(({ bus, total, checkedInToday: c }) => (
                <tr key={bus.id} className="border-b border-line">
                  <td className="py-2">{bus.label}</td>
                  <td className="py-2">{total}</td>
                  <td className="py-2">
                    <Pill tone="granted">{c}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Per route">
        {perRoute.length === 0 ? (
          <p className="text-sm text-ink-soft">No routes added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] text-ink-soft border-b border-ink">
                <th className="py-1.5">Route</th>
                <th className="py-1.5">Enrolled students</th>
              </tr>
            </thead>
            <tbody>
              {perRoute.map(({ route, total }) => (
                <tr key={route.id} className="border-b border-line">
                  <td className="py-2">{route.name}</td>
                  <td className="py-2">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
