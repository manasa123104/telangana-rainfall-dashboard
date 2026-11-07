import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(githubPages
    ? { output: "export" as const, basePath: "/telangana-rainfall-dashboard", trailingSlash: true }
    : { cacheComponents: true, partialPrefetching: true }),
  // Local hosts for Next.js 16 dev resource checks. Add a Cloudflare
  // quick-tunnel hostname here when testing through cloudflared + `next dev`.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
