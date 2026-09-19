import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let cached: SupabaseClient | null = null;
let cachedUrl: string | null = null;

/**
 * Returns a Supabase client built from the admin-entered keys in
 * Settings. Returns null (rather than throwing) when not yet
 * configured, so callers can show a clear "connect Supabase first"
 * state instead of crashing the app.
 */
export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (cached && cachedUrl === config.url) return cached;

  cached = createClient(config.url, config.anonKey, {
    auth: { persistSession: false }
  });
  cachedUrl = config.url;
  return cached;
}

export function resetSupabaseClient() {
  cached = null;
  cachedUrl = null;
}
