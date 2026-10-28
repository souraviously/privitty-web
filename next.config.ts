import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Server Component caching (Next.js 15+)
  cacheComponents: true,

  // Partial prefetching for faster client-side navigation (Next.js 15+)
  partialPrefetching: true,

  // NOTE: Do NOT add turbopack.rules for CSS here.
  // Next.js 16 uses Turbopack for BOTH dev and production builds.
  // Tailwind v4 (@import "tailwindcss") is handled natively by Next.js 16 +
  // Turbopack — no custom loaders or PostCSS config required.
};

export default nextConfig;
