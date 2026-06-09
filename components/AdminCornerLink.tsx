import Link from "next/link";

export function AdminCornerLink() {
  return (
    <Link
      href="/admin"
      className="fixed bottom-3 right-4 z-50 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-300/80 transition hover:text-slate-400"
      aria-label="Teacher admin"
      title="ครู"
    >
      ···
    </Link>
  );
}
