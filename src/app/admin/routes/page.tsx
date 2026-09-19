"use client";

import { useEffect, useState } from "react";
import { listRoutes, listBuses, createRoute, updateRoute, deleteRoute, NotConfiguredError } from "@/lib/db";
import { Bus, Route } from "@/lib/types";
import { Panel } from "@/components/ui/Surfaces";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PlusIcon, TrashIcon } from "@/components/icons";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [r, b] = await Promise.all([listRoutes(), listBuses()]);
      setRoutes(r);
      setBuses(b);
      setError(null);
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not load routes.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingId) {
        await updateRoute(editingId, name.trim());
      } else {
        await createRoute(name.trim());
      }
      setName("");
      setEditingId(null);
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not save route.");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this route? Buses on it will become unassigned.")) return;
    try {
      await deleteRoute(id);
      await refresh();
    } catch (e) {
      setError(e instanceof NotConfiguredError ? e.message : "Could not remove route.");
    }
  }

  function busCount(routeId: string) {
    return buses.filter((b) => b.route_id === routeId).length;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] text-ink-soft">NETWORK</div>
        <h1 className="text-2xl font-bold text-ink">Routes</h1>
      </div>

      {error && <p className="mb-4 text-sm text-signal-denied">{error}</p>}

      <Panel title={editingId ? "Edit route" : "Add route"}>
        <form onSubmit={onSubmit} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Field label="Route name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="North Campus Loop" />
            </Field>
          </div>
          <Button type="submit">
            <PlusIcon size={14} />
            {editingId ? "Save" : "Add route"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setName("");
              }}
            >
              Cancel
            </Button>
          )}
        </form>
      </Panel>

      <Panel title="All routes">
        {routes.length === 0 ? (
          <p className="text-sm text-ink-soft">No routes yet — add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] text-ink-soft border-b border-ink">
                <th className="py-1.5">Route</th>
                <th className="py-1.5">Buses on route</th>
                <th className="py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2">{busCount(r.id)}</td>
                  <td className="py-2">
                    <div className="flex gap-3 justify-end">
                      <button
                        className="text-xs font-mono text-ink-soft hover:text-ink"
                        onClick={() => {
                          setEditingId(r.id);
                          setName(r.name);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => onDelete(r.id)} className="text-ink-soft hover:text-signal-denied">
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
