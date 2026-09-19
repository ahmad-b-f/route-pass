export type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export const WEEK_DAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface Route {
  id: string;
  name: string;
  created_at?: string;
}

export interface Bus {
  id: string;
  label: string;
  route_id: string | null;
  driver_name: string | null;
  qr_secret: string;
  created_at?: string;
}

export interface Student {
  id: string;
  name: string;
  roll_no: string;
  phone: string;
  password_hash: string;
  bus_id: string | null;
  paid_days: WeekDay[];
  fee_active: boolean;
  created_at?: string;
}

export interface DayPass {
  student_id: string;
  date: string; // YYYY-MM-DD
  allowed: boolean;
  signature: string;
  expires_at: string;
}

export type ScanResult = "granted" | "denied";

export interface ScanLog {
  id: string;
  student_id: string;
  student_name: string;
  bus_id: string;
  bus_label: string;
  route_name: string | null;
  timestamp: string;
  result: ScanResult;
  reason: string;
  day_color: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
