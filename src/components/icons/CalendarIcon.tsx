import { IconProps } from "./types";

export function CalendarIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 3.5V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="6.6" y="12" width="3.4" height="3.4" rx="0.6" fill="currentColor" />
    </svg>
  );
}
