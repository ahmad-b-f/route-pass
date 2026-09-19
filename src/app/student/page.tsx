"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { findStudentByPhone, getBusById, NotConfiguredError } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { setCachedStudent, setCachedBus, getCachedStudent } from "@/lib/session";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StudentIcon } from "@/components/icons";

export default function StudentLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getCachedStudent()) router.replace("/student/pass");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const student = await findStudentByPhone(phone.trim());
      if (!student) {
        setError("No account with that phone number.");
        return;
      }
      const hash = await hashPassword(password);
      if (hash !== student.password_hash) {
        setError("Incorrect password.");
        return;
      }
      setCachedStudent(student);
      if (student.bus_id) {
        try {
          const bus = await getBusById(student.bus_id);
          if (bus) setCachedBus(bus);
        } catch {
          // Bus lookup failing shouldn't block login — the pass page
          // will show "no bus cached yet" and retry when online.
        }
      }
      router.push("/student/pass");
    } catch (err) {
      setError(err instanceof NotConfiguredError ? "The app isn't connected yet — ask your admin to finish setup." : "Sign-in failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center mb-3">
            <StudentIcon size={22} />
          </div>
          <div className="font-mono text-[11px] text-ink-soft">ROUTE PASS</div>
          <h1 className="text-xl font-bold text-ink">Student sign-in</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-paper-soft border border-line rounded-card p-5">
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" autoComplete="tel" />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
            />
          </Field>
          {error && <p className="text-sm text-signal-denied">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Signing in\u2026" : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-xs text-ink-soft mt-4 font-mono">
          Credentials are issued by your transport admin.
        </p>
      </div>
    </main>
  );
}
