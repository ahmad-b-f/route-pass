import { IconProps } from "./types";

export function BusIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5.5" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10.5H21" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 5.5V10.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 5.5V10.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 15.5H5.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18.6 15.5H21" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
