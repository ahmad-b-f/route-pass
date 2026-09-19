"use client";

import { useEffect, useState } from "react";
import { getSupabaseConfig, setSupabaseConfig } from "@/lib/config";
import { getDayColors, setDayColor } from "@/lib/days";
import { WEEK_DAYS, WeekDay } from "@/lib/types";
import { Panel } from "@/components/ui/Surfaces";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [colors, setColors] = useState<Record<WeekDay, string>>(getDayColors());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    if (cfg) {
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
    }
    setColors(getDayColors());
  }, []);

  function saveSupabase(e: React.FormEvent) {
    e.preventDefault();
    setSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateColor(day: WeekDay, color: string) {
    setDayColor(day, color);
    setColors({ ...colors, [day]: color });
  }

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] text-ink-soft">CONFIGURATION</div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
      </div>

      <Panel title="Supabase connection">
        <form onSubmit={saveSupabase} className="space-y-4 max-w-md">
          <Field label="Project URL">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
          </Field>
          <Field label="Anon (public) key">
            <Input value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder="eyJhbGciOi..." />
          </Field>
          <p className="text-xs text-ink-soft">
            Only paste the anon/public key here — never the service_role key. Run supabase/schema.sql in your
            project first. Data stays in your Supabase project; keys are stored only in this browser.
          </p>
          <Button type="submit">Save connection</Button>
        </form>
      </Panel>

      <Panel title="Day colors">
        <p className="text-xs text-ink-soft mb-4">
          Shown on the verify/deny screen and on receipts, so a screenshot from a different day looks visibly wrong.
          Each bus signs its own QR automatically (see the QR button on the Buses page) — there is no shared secret
          to manage here.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <input
                type="color"
                value={colors[d]}
                onChange={(e) => updateColor(d, e.target.value)}
                className="w-9 h-9 rounded border border-line cursor-pointer"
              />
              <span className="font-mono text-xs text-ink-soft">{d}</span>
            </div>
          ))}
        </div>
      </Panel>

      {saved && <p className="text-sm text-signal-granted font-mono">Saved.</p>}
    </div>
  );
}

