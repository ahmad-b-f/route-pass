import { Bus, Student } from "./types";

const SESSION_KEY = "routepass_student_session";
const BUS_KEY = "routepass_student_bus";
const ADMIN_AUTH_KEY = "routepass_admin_auth";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminAuth(authenticated: boolean) {
  if (typeof window === "undefined") return;
  if (authenticated) {
    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
  } else {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}


/**
 * Caches the logged-in student's own record locally so the boarding
 * flow (paid days / fee status) can run fully offline after the
 * first successful login. Refreshed opportunistically whenever the
 * app has connectivity.
 */
export function getCachedStudent(): Student | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Student;
  } catch {
    return null;
  }
}

export function setCachedStudent(student: Student) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(student));
}

export function clearCachedStudent() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(BUS_KEY);
}

/** The student's assigned bus, cached at login (including its QR
 * signing secret) so boarding-time signature checks work offline. */
export function getCachedBus(): Bus | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BUS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Bus;
  } catch {
    return null;
  }
}

export function setCachedBus(bus: Bus) {
  window.localStorage.setItem(BUS_KEY, JSON.stringify(bus));
}

function usedKey(studentId: string, busId: string, date: string) {
  return `routepass_used_${studentId}_${busId}_${date}`;
}

export function hasUsedLocally(studentId: string, busId: string, date: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(usedKey(studentId, busId, date)) === "1";
}

export function markUsedLocally(studentId: string, busId: string, date: string) {
  window.localStorage.setItem(usedKey(studentId, busId, date), "1");
}

/* ---------------------------- Receipts ---------------------------- */

export interface LocalReceipt {
  date: string;
  weekDay: string;
  busLabel: string;
  studentName: string;
  color: string;
  result: "granted" | "denied";
  reason: string;
  timestamp: string;
}

const RECEIPTS_KEY = "routepass_receipts";

export function getLocalReceipts(): LocalReceipt[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RECEIPTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalReceipt[];
  } catch {
    return [];
  }
}

export function addLocalReceipt(receipt: LocalReceipt) {
  const current = getLocalReceipts();
  current.unshift(receipt);
  window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify(current.slice(0, 50)));
}
