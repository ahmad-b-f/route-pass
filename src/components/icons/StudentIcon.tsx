import { IconProps } from "./types";

export function StudentIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="3.5" width="16" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 16.2C8.4 14.3 10 13.4 12 13.4C14 13.4 15.6 14.3 16.5 16.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 6.2H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
