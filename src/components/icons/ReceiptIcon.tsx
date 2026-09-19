import { IconProps } from "./types";

export function ReceiptIcon({ size = 20, className }: IconProps) {
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
        d="M6 3H18V19.5L16 18L14 19.5L12 18L10 19.5L8 18L6 19.5V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 7.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 10.8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 14.1H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
