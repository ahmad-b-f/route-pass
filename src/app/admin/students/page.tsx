"use client";

import { useEffect, useState } from "react";
import {
  listStudents,
  listBuses,
  createStudent,
  updateStudent,
  deleteStudent,
  NotConfiguredError
} from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { Bus, Student, WEEK_DAYS, WeekDay } from "@/lib/types";
import { formatWeekDayList } from "@/lib/days";
import { Panel, DayChip, Pill } from "@/components/ui/Surfaces";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PlusIcon, TrashIcon, EditIcon } from "@/components/icons";

interface FormState {
  id: string | null;
  name: string;
  roll_no: string;
  phone: string;
  password: string;
  bus_id: string;
  paid_days: WeekDay[];
  fee_active: boolean;
}

const emptyForm: FormState = {
  id: null,
  name: "",
  roll_no: "",
  phone: "",
  password: "",
  bus_id: "",
  paid_days: [],
  fee_active: true
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const [s, b] = await Promise.all([listStudents(), listBuses()]);
      setStudents(s);
      setBuses(b);
      setError(null);
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not load students.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function toggleDay(day: WeekDay) {
    setForm((f) => ({
      ...f,
      paid_days: f.paid_days.includes(day) ? f.paid_days.filter((d) => d !== day) : [...f.paid_days, day]
    }));
  }

  function startEdit(s: Student) {
    setForm({
      id: s.id,
      name: s.name,
      roll_no: s.roll_no,
      phone: s.phone,
      password: "",
      bus_id: s.bus_id ?? "",
      paid_days: s.paid_days,
      fee_active: s.fee_active
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || (!form.id && !form.password)) {
      setError("Name, phone, and (for new students) a password are required.");
      return;
    }
    setBusy(true);
    try {
      if (form.id) {
        const patch: Partial<Student> = {
          name: form.name,
          roll_no: form.roll_no,
          phone: form.phone,
          bus_id: form.bus_id || null,
          paid_days: form.paid_days,
          fee_active: form.fee_active
        };
        if (form.password) patch.password_hash = await hashPassword(form.password);
        await updateStudent(form.id, patch);
      } else {
        await createStudent({
          name: form.name,
          roll_no: form.roll_no,
          phone: form.phone,
          password_hash: await hashPassword(form.password),
          bus_id: form.bus_id || null,
          paid_days: form.paid_days,
          fee_active: form.fee_active
        });
      }
      setForm(emptyForm);
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not save student.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this student?")) return;
    try {
      await deleteStudent(id);
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not remove student.");
    }
  }

  async function toggleFee(s: Student) {
    try {
      await updateStudent(s.id, { fee_active: !s.fee_active });
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not update fee status.");
    }
  }

  function busLabel(id: string | null) {
    if (!id) return "\u2014";
    return buses.find((b) => b.id === id)?.label ?? "\u2014";
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] text-ink-soft">ROSTER</div>
        <h1 className="text-2xl font-bold text-ink">Students</h1>
      </div>

      {error && <p className="mb-4 text-sm text-signal-denied">{error}</p>}

      <Panel title={form.id ? "Edit student" : "Add student"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ayesha Khan" />
            </Field>
            <Field label="Roll no.">
              <Input value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} placeholder="BSCS24011" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03xx-xxxxxxx" />
            </Field>
            <Field label={form.id ? "New password (optional)" : "Password"}>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={form.id ? "leave blank to keep current" : "set a password"}
              />
            </Field>
          </div>

          <Field label="Assigned bus">
            <select
              value={form.bus_id}
              onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
              className="w-full rounded-card border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              <option value="">Unassigned</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Paid travel days">
            <div className="flex gap-1.5 flex-wrap">
              {WEEK_DAYS.map((d) => (
                <DayChip key={d} day={d} active={form.paid_days.includes(d)} onClick={() => toggleDay(d)} />
              ))}
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.fee_active}
              onChange={(e) => setForm({ ...form, fee_active: e.target.checked })}
            />
            Fee active
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              <PlusIcon size={14} />
              {form.id ? "Save changes" : "Add student"}
            </Button>
            {form.id && (
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Roster">
        {students.length === 0 ? (
          <p className="text-sm text-ink-soft">No students yet — add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left font-mono text-[11px] text-ink-soft border-b border-ink">
                  <th className="py-1.5">Student</th>
                  <th className="py-1.5">Bus</th>
                  <th className="py-1.5">Paid days</th>
                  <th className="py-1.5">Fee</th>
                  <th className="py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-line">
                    <td className="py-2">
                      <div className="font-medium">{s.name}</div>
                      <div className="font-mono text-[11px] text-ink-soft">
                        {s.roll_no} &middot; {s.phone}
                      </div>
                    </td>
                    <td className="py-2">{busLabel(s.bus_id)}</td>
                    <td className="py-2 font-mono text-[11px] text-ink-soft">{formatWeekDayList(s.paid_days)}</td>
                    <td className="py-2">
                      <button onClick={() => toggleFee(s)}>
                        <Pill tone={s.fee_active ? "granted" : "denied"}>{s.fee_active ? "active" : "suspended"}</Pill>
                      </button>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(s)} className="text-ink-soft hover:text-ink" aria-label="Edit">
                          <EditIcon size={15} />
                        </button>
                        <button onClick={() => onDelete(s.id)} className="text-ink-soft hover:text-signal-denied" aria-label="Remove">
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
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
