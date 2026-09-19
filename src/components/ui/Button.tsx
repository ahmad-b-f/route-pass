import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-card text-sm font-semibold px-4 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<string, string> = {
  primary: "bg-ink text-paper hover:bg-navy",
  ghost: "bg-transparent text-ink border border-line hover:border-ink",
  danger: "bg-transparent text-signal-denied border border-signal-denied/40 hover:border-signal-denied"
};

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
