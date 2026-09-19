"use client";

import { useEffect, useState } from "react";
import { listBuses, listRoutes, createBus, updateBus, deleteBus, NotConfiguredError } from "@/lib/db";
import { createBusQrPayload } from "@/lib/verification";
import { qrDataUrl, downloadDataUrl, generateSecret } from "@/lib/qr";
import { Bus, Route } from "@/lib/types";
import { Panel } from "@/components/ui/Surfaces";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PlusIcon, TrashIcon, QrIcon } from "@/components/icons";

interface FormState {
  id: string | null;
  label: string;
  route_id: string;
  driver_name: string;
}

const emptyForm: FormState = { id: null, label: "", route_id: "", driver_name: "" };

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<{ busId: string; url: string } | null>(null);

  async function refresh() {
    try {
      const [b, r] = await Promise.all([listBuses(), listRoutes()]);
      setBuses(b);
      setRoutes(r);
      setError(null);
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not load buses.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label) {
      setError("Bus label is required.");
      return;
    }
    try {
      if (form.id) {
        await updateBus(form.id, {
          label: form.label,
          route_id: form.route_id || null,
          driver_name: form.driver_name || null
        });
      } else {
        await createBus({
          label: form.label,
          route_id: form.route_id || null,
          driver_name: form.driver_name || null,
          qr_secret: generateSecret()
        });
      }
      setForm(emptyForm);
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not save bus.");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this bus? Its printed QR will stop working.")) return;
    try {
      await deleteBus(id);
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not remove bus.");
    }
  }

  function startEdit(b: Bus) {
    setForm({ id: b.id, label: b.label, route_id: b.route_id ?? "", driver_name: b.driver_name ?? "" });
  }

  async function generateQr(bus: Bus) {
    const payload = await createBusQrPayload(bus.id, bus.qr_secret);
    const url = await qrDataUrl(payload);
    setQrPreview({ busId: bus.id, url });
  }

  function routeName(id: string | null) {
    if (!id) return "\u2014";
    return routes.find((r) => r.id === id)?.name ?? "\u2014";
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] text-ink-soft">FLEET</div>
        <h1 className="text-2xl font-bold text-ink">Buses</h1>
      </div>

      {error && <p className="mb-4 text-sm text-signal-denied">{error}</p>}

      <Panel title={form.id ? "Edit bus" : "Add bus"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Label">
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Bus 7" />
            </Field>
            <Field label="Route">
              <select
                value={form.route_id}
                onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                className="w-full rounded-card border border-line bg-paper px-3 py-2 text-sm text-ink"
              >
                <option value="">Unassigned</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Driver">
              <Input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} placeholder="optional" />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <PlusIcon size={14} />
              {form.id ? "Save changes" : "Add bus"}
            </Button>
            {form.id && (
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Fleet">
        {buses.length === 0 ? (
          <p className="text-sm text-ink-soft">No buses yet — add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left font-mono text-[11px] text-ink-soft border-b border-ink">
                  <th className="py-1.5">Bus</th>
                  <th className="py-1.5">Route</th>
                  <th className="py-1.5">Driver</th>
                  <th className="py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {buses.map((b) => (
                  <tr key={b.id} className="border-b border-line">
                    <td className="py-2 font-medium">{b.label}</td>
                    <td className="py-2">{routeName(b.route_id)}</td>
                    <td className="py-2">{b.driver_name || "\u2014"}</td>
                    <td className="py-2">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => generateQr(b)} className="flex items-center gap-1 text-navy hover:underline text-xs font-mono">
                          <QrIcon size={15} />
                          QR
                        </button>
                        <button onClick={() => startEdit(b)} className="text-xs font-mono text-ink-soft hover:text-ink">
                          Edit
                        </button>
                        <button onClick={() => onDelete(b.id)} className="text-ink-soft hover:text-signal-denied">
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

      {qrPreview && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-6 z-50" onClick={() => setQrPreview(null)}>
          <div className="bg-paper rounded-card p-6 max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <div className="font-mono text-[11px] text-ink-soft mb-2">PRINT &amp; MOUNT ON BUS</div>
            <img src={qrPreview.url} alt="Bus QR code" className="w-full rounded" />
            <div className="mt-4 flex gap-2 justify-center">
              <Button onClick={() => downloadDataUrl(qrPreview.url, `bus-qr-${qrPreview.busId}.png`)}>Download</Button>
              <Button variant="ghost" onClick={() => setQrPreview(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
