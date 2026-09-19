import { IconProps } from "./types";

export function SettingsIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 18H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="6" r="1.9" fill="currentColor" />
      <circle cx="16" cy="12" r="1.9" fill="currentColor" />
      <circle cx="11" cy="18" r="1.9" fill="currentColor" />
    </svg>
  );
}
