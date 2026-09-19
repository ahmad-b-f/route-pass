"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isConfigured } from "@/lib/config";
import { SettingsIcon } from "@/components/icons";

export function ConfigBanner() {
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    setConfigured(isConfigured());
  }, []);

  if (configured) return null;

  return (
    <Link
      href="/admin/settings"
      className="mb-5 flex items-center gap-2 border border-amber/50 bg-amber/10 text-ink px-4 py-3 rounded-card text-sm"
    >
      <SettingsIcon size={16} className="text-amber" />
      Supabase isn&apos;t connected yet — add your project URL and anon key in Settings to enable live data.
    </Link>
  );
}
