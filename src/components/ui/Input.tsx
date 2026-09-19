import { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-card border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-amber focus:ring-1 focus:ring-amber ${
        props.className ?? ""
      }`}
    />
  );
}
