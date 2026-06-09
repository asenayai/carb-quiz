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
      className={`rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-md border border-zinc-700 bg-zinc-100 px-4 py-2.5 text-sm font-medium tracking-tight text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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
      className={`w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 ${className}`}
      {...props}
    />
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className="h-full bg-zinc-400 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
