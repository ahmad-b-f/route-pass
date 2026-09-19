import { WeekDay, WEEK_DAYS } from "./types";

/**
 * JS Date.getDay() returns 0=Sun..6=Sat. We map Mon-Sat only;
 * Sunday resolves to null since it is never a travel day.
 */
export function todayName(date: Date = new Date()): WeekDay | "Sun" {
  const jsDay = date.getDay(); // 0..6
  const map: Record<number, WeekDay | "Sun"> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat"
  };
  return map[jsDay];
}

export function isoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Default day-color palette. Admin can override via settings
 * (stored under the "dayColors" key alongside Supabase config).
 */
export const DEFAULT_DAY_COLORS: Record<WeekDay, string> = {
  Mon: "#3A6EA5",
  Tue: "#4F8F63",
  Wed: "#B2762E",
  Thu: "#7C5CAD",
  Fri: "#B23A2E",
  Sat: "#2C7A7B"
};

export function getDayColors(): Record<WeekDay, string> {
  if (typeof window === "undefined") return DEFAULT_DAY_COLORS;
  try {
    const raw = window.localStorage.getItem("routepass_day_colors");
    if (!raw) return DEFAULT_DAY_COLORS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DAY_COLORS, ...parsed };
  } catch {
    return DEFAULT_DAY_COLORS;
  }
}

export function setDayColor(day: WeekDay, color: string) {
  const current = getDayColors();
  current[day] = color;
  window.localStorage.setItem("routepass_day_colors", JSON.stringify(current));
}

export function isPaidDay(paidDays: WeekDay[], day: WeekDay | "Sun"): boolean {
  if (day === "Sun") return false;
  return paidDays.includes(day);
}

export function formatWeekDayList(days: WeekDay[]): string {
  return WEEK_DAYS.map((d) => (days.includes(d) ? d : "\u00B7")).join(" ");
}
