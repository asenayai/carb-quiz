import { execSync } from "child_process";
import type { NextConfig } from "next";

function gitShortHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "dev";
  }
}

const buildCommit = (
  process.env.VERCEL_GIT_COMMIT_SHA || gitShortHash()
).slice(0, 7);

const buildTime = new Date().toISOString();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_COMMIT: buildCommit,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
