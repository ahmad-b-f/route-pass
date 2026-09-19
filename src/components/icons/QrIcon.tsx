import { IconProps } from "./types";

export function QrIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="6" height="6" rx="0.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="0.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="0.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="6" width="1" height="1" fill="currentColor" />
      <rect x="17" y="6" width="1" height="1" fill="currentColor" />
      <rect x="6" y="17" width="1" height="1" fill="currentColor" />
      <path d="M14.5 15H17V17.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20.5 15V17.5H18.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.5 20.5H16.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 20.5H20.5V18.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
