"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { findStudentByIdentifier, getBusById, NotConfiguredError } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import {
  setCachedStudent,
  setCachedBus,
  getCachedStudent,
  isAdminAuthenticated,
  setAdminAuth
} from "@/lib/session";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BusIcon, StudentIcon } from "@/components/icons";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace("/admin");
    } else if (getCachedStudent()) {
      router.replace("/student/pass");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name or username.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // 1. Check for Admin Credentials
      if (trimmedName.toLowerCase() === "blackwood" && password === "cropee@12354") {
        setAdminAuth(true);
        router.push("/admin");
        return;
      }

      // 2. Check for Student Credentials in DB
      let student = null;
      try {
        student = await findStudentByIdentifier(trimmedName);
      } catch (err) {
        if (err instanceof NotConfiguredError) {
          setError(
            "Supabase isn't connected yet. Admin can sign in with BlackWood to configure settings."
          );
          return;
        }
        throw err;
      }

      if (!student) {
        setError("Invalid name/username or password.");
        return;
      }

      const hash = await hashPassword(password);
      if (hash !== student.password_hash) {
        setError("Invalid name/username or password.");
        return;
      }

      // Successful student login
      setCachedStudent(student);
      if (student.bus_id) {
        try {
          const bus = await getBusById(student.bus_id);
          if (bus) setCachedBus(bus);
        } catch {
          // Bus caching failure is non-blocking
        }
      }
      router.push("/student/pass");
    } catch {
      setError("Sign-in failed. Please check your network connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center mb-3 shadow-md">
            <StudentIcon size={24} />
          </div>
          <div className="font-mono text-[11px] tracking-widest text-ink-soft uppercase">
            TRANSPORT VERIFICATION
          </div>
          <h1 className="text-2xl font-bold text-ink mt-0.5">Route Pass</h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 bg-paper-soft border border-line rounded-card p-6 shadow-sm"
        >
          <Field label="Name / Username">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name, username, or phone"
              autoComplete="username"
              required
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </Field>

          {error && <p className="text-xs text-signal-denied font-medium mt-1">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full mt-2 py-2.5">
            {busy ? "Signing in\u2026" : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-ink-soft">
          <BusIcon size={16} />
          <span className="font-mono text-[11px]">Route Pass Unified Portal</span>
        </div>
      </div>
    </main>
  );
}
