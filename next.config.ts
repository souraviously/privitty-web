import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Server Component caching (Next.js 15+)
  cacheComponents: true,

  // Partial prefetching for faster client-side navigation (Next.js 15+)
  partialPrefetching: true,

  // Turbopack CSS loader — only active during `next dev --turbopack` (ignored in production)
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
