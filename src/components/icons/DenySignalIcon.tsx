import { IconProps } from "./types";

export function DenySignalIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2.4L20.5 7V17L12 21.6L3.5 17V7L12 2.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.7 8.7L15.3 15.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.3 8.7L8.7 15.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
