import { SupabaseConfig } from "./types";

const CONFIG_KEY = "routepass_supabase_config";

/**
 * Supabase credentials are entered by the admin via the Settings page
 * (rather than baked in as build-time env vars) so the same static
 * build can be pointed at any Supabase project. They are stored in
 * this browser's localStorage only, never sent anywhere else.
 *
 * Security note: only the anon (public) key should ever be entered
 * here. The anon key is safe to expose client-side as long as Row
 * Level Security policies on the Supabase tables are configured
 * correctly (see supabase/schema.sql). Never paste a service_role
 * key into this field.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.url && parsed?.anonKey) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function setSupabaseConfig(config: SupabaseConfig) {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig() {
  window.localStorage.removeItem(CONFIG_KEY);
}

export function isConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
