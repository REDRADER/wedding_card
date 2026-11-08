import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Photos are served as-is; sharp isn't installed (see pnpm-workspace.yaml).
  images: { unoptimized: true },
  turbopack: {
    rules: {
      // Only the global sheet uses Tailwind; CSS modules keep their own pipeline.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
