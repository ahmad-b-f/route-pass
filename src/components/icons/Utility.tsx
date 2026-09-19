import { IconProps } from "./types";

export function PlusIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4.5V19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 12H19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 7H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 7V4.8C9 4.4 9.3 4 9.8 4H14.2C14.7 4 15 4.4 15 4.8V7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 7L7.7 19C7.7 19.6 8.2 20 8.8 20H15.2C15.8 20 16.3 19.6 16.3 19L17 7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.3 10.5V16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.7 10.5V16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function EditIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15.2 4.6L19.4 8.8L8.6 19.6L4 20.5L4.9 15.9L15.2 4.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 6.8L17.2 11" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChartIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 20H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="13" width="2.4" height="5" fill="currentColor" />
      <rect x="11.8" y="9" width="2.4" height="9" fill="currentColor" />
      <rect x="16.6" y="6" width="2.4" height="12" fill="currentColor" />
    </svg>
  );
}

export function LogoutIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 4H6.5C5.7 4 5 4.7 5 5.5V18.5C5 19.3 5.7 20 6.5 20H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.5 8L18 12L13.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
