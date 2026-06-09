export type BuildInfo = {
  commit: string;
  builtAt: string;
};

export function getBuildInfo(): BuildInfo {
  const commit =
    process.env.NEXT_PUBLIC_BUILD_COMMIT?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    "dev";

  const builtAt =
    process.env.NEXT_PUBLIC_BUILD_TIME?.trim() ||
    new Date().toISOString();

  return { commit, builtAt };
}

export function formatBuildTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return iso;
  }
}
