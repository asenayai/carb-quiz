import { formatBuildTime, getBuildInfo } from "@/lib/build-info";

export function AdminVersionSignature() {
  const { commit, builtAt } = getBuildInfo();

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-4 z-40 select-none font-mono text-[10px] leading-tight text-slate-300/75"
      aria-hidden
    >
      <span className="tabular-nums">{commit}</span>
      <span className="mx-1 opacity-50">·</span>
      <span className="tabular-nums">{formatBuildTime(builtAt)}</span>
    </div>
  );
}
