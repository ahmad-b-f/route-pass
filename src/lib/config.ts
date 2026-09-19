import { SupabaseConfig } from "./types";

const CONFIG_KEY = "routepass_supabase_config";

/**
 * Supabase credentials come from one of two places:
 *
 * 1. Build-time env vars (NEXT_PUBLIC_SUPABASE_URL /
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY) — set once in Vercel, baked into
 *    every device automatically. This is what makes the Student PWA
 *    work out of the box on a student's own phone, since there's no
 *    Settings screen for them to fill in.
 * 2. The Admin Settings page, stored in that browser's localStorage
 *    only. This is optional and only needed if you want *this*
 *    browser to point at a different Supabase project than the one
 *    baked in — it overrides the env vars when present.
 *
 * Security note: only the anon (public) key should ever be used
 * here, in either place. The anon key is safe to expose client-side
 * as long as Row Level Security policies on the Supabase tables are
 * configured correctly (see supabase/schema.sql). Never use a
 * service_role key for either of these.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const fromEnv: SupabaseConfig | null =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? { url: process.env.NEXT_PUBLIC_SUPABASE_URL, anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
      : null;

  if (typeof window === "undefined") return fromEnv;

  const raw = window.localStorage.getItem(CONFIG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.url && parsed?.anonKey) return parsed;
    } catch {
      // fall through to env default below
    }
  }
  return fromEnv;
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