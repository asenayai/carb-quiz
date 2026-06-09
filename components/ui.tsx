import { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary:
      "font-heading rounded-xl border-b-4 border-[#46a302] bg-[#58cc02] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:border-b-2 active:translate-y-0.5 disabled:opacity-50",
    secondary:
      "font-heading rounded-xl border-b-4 border-sky-600 bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:border-b-2 active:translate-y-0.5 disabled:opacity-50",
    ghost:
      "font-heading rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700",
  };

  return (
    <button
      className={`${variants[variant]} disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 ${className}`}
      {...props}
    />
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#58cc02] to-emerald-400 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ScienceChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-accent inline-block rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800 ring-1 ring-teal-200">
      {children}
    </span>
  );
}

export const CHOICE_TILE_CLASS = [
  "choice-tile-0",
  "choice-tile-1",
  "choice-tile-2",
  "choice-tile-3",
] as const;
