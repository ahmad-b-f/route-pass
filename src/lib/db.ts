import { getSupabase } from "./supabaseClient";
import { Bus, Route, ScanLog, Student, WeekDay } from "./types";

export class NotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured yet. Add your project URL and anon key in Settings.");
    this.name = "NotConfiguredError";
  }
}

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new NotConfiguredError();
  return supabase;
}

/* ---------------------------- Routes ---------------------------- */

export async function listRoutes(): Promise<Route[]> {
  const { data, error } = await client().from("routes").select("*").order("name");
  if (error) throw error;
  return data as Route[];
}

export async function createRoute(name: string): Promise<Route> {
  const { data, error } = await client().from("routes").insert({ name }).select().single();
  if (error) throw error;
  return data as Route;
}

export async function updateRoute(id: string, name: string): Promise<void> {
  const { error } = await client().from("routes").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteRoute(id: string): Promise<void> {
  const { error } = await client().from("routes").delete().eq("id", id);
  if (error) throw error;
}

/* ----------------------------- Buses ----------------------------- */

export async function listBuses(): Promise<Bus[]> {
  const { data, error } = await client().from("buses").select("*").order("label");
  if (error) throw error;
  return data as Bus[];
}

export async function createBus(input: {
  label: string;
  route_id: string | null;
  driver_name: string | null;
  qr_secret: string;
}): Promise<Bus> {
  const { data, error } = await client().from("buses").insert(input).select().single();
  if (error) throw error;
  return data as Bus;
}

export async function updateBus(id: string, patch: Partial<Bus>): Promise<void> {
  const { error } = await client().from("buses").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteBus(id: string): Promise<void> {
  const { error } = await client().from("buses").delete().eq("id", id);
  if (error) throw error;
}

export async function getBusById(id: string): Promise<Bus | null> {
  const { data, error } = await client().from("buses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Bus) ?? null;
}

/* ---------------------------- Students ---------------------------- */

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await client().from("students").select("*").order("name");
  if (error) throw error;
  return data as Student[];
}

export async function createStudent(input: {
  name: string;
  roll_no: string;
  phone: string;
  password_hash: string;
  bus_id: string | null;
  paid_days: WeekDay[];
  fee_active: boolean;
}): Promise<Student> {
  const { data, error } = await client().from("students").insert(input).select().single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: string, patch: Partial<Student>): Promise<void> {
  const { error } = await client().from("students").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await client().from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function findStudentByPhone(phone: string): Promise<Student | null> {
  const { data, error } = await client().from("students").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  return (data as Student) ?? null;
}

/* --------------------------- Scan logs ---------------------------- */

export async function insertScanLog(entry: Omit<ScanLog, "id">): Promise<void> {
  const { error } = await client().from("scan_logs").insert(entry);
  if (error) throw error;
}

export async function listScanLogs(filters?: {
  studentId?: string;
  busId?: string;
  from?: string;
  to?: string;
}): Promise<ScanLog[]> {
  let query = client().from("scan_logs").select("*").order("timestamp", { ascending: false });
  if (filters?.studentId) query = query.eq("student_id", filters.studentId);
  if (filters?.busId) query = query.eq("bus_id", filters.busId);
  if (filters?.from) query = query.gte("timestamp", filters.from);
  if (filters?.to) query = query.lte("timestamp", filters.to);
  const { data, error } = await query;
  if (error) throw error;
  return data as ScanLog[];
}

/**
 * Has this student already checked in today for this bus? Used to
 * enforce "one scan per day per bus" even if the local device state
 * is lost, by asking Supabase for today's logs. The boarding-time
 * flow still applies the offline-cached day-pass first; this is the
 * backing check once connectivity is available (see Student PWA
 * module for the fully-offline local-flag flow).
 */
export async function hasCheckedInToday(studentId: string, busId: string, isoDate: string): Promise<boolean> {
  const { data, error } = await client()
    .from("scan_logs")
    .select("id")
    .eq("student_id", studentId)
    .eq("bus_id", busId)
    .eq("result", "granted")
    .gte("timestamp", `${isoDate}T00:00:00`)
    .lte("timestamp", `${isoDate}T23:59:59`);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
