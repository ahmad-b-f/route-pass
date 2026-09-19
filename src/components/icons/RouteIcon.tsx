import { IconProps } from "./types";

export function RouteIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="6" r="2.1" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="19" cy="18" r="2.1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.6 7.6C9 10 8 13.4 12 14.4C16 15.4 15 15.8 17.3 16.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="2.4 2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
