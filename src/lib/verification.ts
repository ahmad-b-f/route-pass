import { Student, WeekDay } from "./types";
import { isPaidDay } from "./days";

/**
 * --- Signing primitives -----------------------------------------
 * HMAC-SHA256 via the Web Crypto SubtleCrypto API (available in all
 * modern browsers, no extra dependency). Used to sign day-passes and
 * the static bus QR payload so the client can verify authenticity
 * offline instead of trusting raw JSON.
 */

async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signPayload(payload: string, secret: string): Promise<string> {
  return hmacSign(payload, secret);
}

export async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacSign(payload, secret);
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * --- Day-pass ------------------------------------------------------
 * A signed token cached on the student's device once per day,
 * fetched whenever the device has connectivity. Boarding-time checks
 * never need to hit the network because this pass is already local.
 *
 * Note: the current build caches the student's row directly (see
 * lib/session.ts) rather than issuing a separately-signed day-pass,
 * since signing one server-side would require a service_role key
 * that this admin-configurable, anon-key-only build intentionally
 * never touches. These helpers are kept ready for a future module
 * that adds a small signing server/edge function.
 */

export interface DayPassPayload {
  studentId: string;
  date: string; // YYYY-MM-DD
  allowed: boolean;
}

export async function createDayPassToken(
  payload: DayPassPayload,
  secret: string
): Promise<string> {
  const raw = JSON.stringify(payload);
  const signature = await signPayload(raw, secret);
  return JSON.stringify({ raw, signature });
}

export async function verifyDayPassToken(
  token: string,
  secret: string
): Promise<DayPassPayload | null> {
  try {
    const { raw, signature } = JSON.parse(token);
    const valid = await verifySignature(raw, signature, secret);
    if (!valid) return null;
    return JSON.parse(raw) as DayPassPayload;
  } catch {
    return null;
  }
}

/**
 * --- Bus QR payload --------------------------------------------
 * Static per bus: encodes only bus_id + signature, so it never needs
 * to change and can be printed once. It carries no student data.
 */

export async function createBusQrPayload(busId: string, secret: string): Promise<string> {
  const signature = await signPayload(busId, secret);
  return JSON.stringify({ busId, signature });
}

export async function verifyBusQrPayload(
  token: string,
  secret: string
): Promise<string | null> {
  try {
    const { busId, signature } = JSON.parse(token);
    const valid = await verifySignature(busId, signature, secret);
    return valid ? (busId as string) : null;
  } catch {
    return null;
  }
}

/**
 * --- Check-in decision -------------------------------------------
 * Pure function (no crypto, no I/O) so it can be unit tested directly.
 * This is the single source of truth for granted/denied logic, used
 * identically by the student PWA at boarding time.
 */

export interface CheckInInput {
  feeActive: boolean;
  paidDays: WeekDay[];
  today: WeekDay | "Sun";
  alreadyUsedToday: boolean;
  signatureValid: boolean;
}

export interface CheckInDecision {
  granted: boolean;
  reason: string;
}

export function evaluateCheckIn(input: CheckInInput): CheckInDecision {
  if (!input.signatureValid) {
    return { granted: false, reason: "invalid or tampered QR/pass signature" };
  }
  if (!input.feeActive) {
    return { granted: false, reason: "fee suspended" };
  }
  if (input.today === "Sun" || !isPaidDay(input.paidDays, input.today)) {
    return { granted: false, reason: `not a paid day (${input.today})` };
  }
  if (input.alreadyUsedToday) {
    return { granted: false, reason: "already checked in today" };
  }
  return { granted: true, reason: `${input.today} \u00B7 paid day \u00B7 fee active` };
}

export function evaluateCheckInForStudent(
  student: Pick<Student, "fee_active" | "paid_days">,
  today: WeekDay | "Sun",
  alreadyUsedToday: boolean,
  signatureValid: boolean
): CheckInDecision {
  return evaluateCheckIn({
    feeActive: student.fee_active,
    paidDays: student.paid_days,
    today,
    alreadyUsedToday,
    signatureValid
  });
}
