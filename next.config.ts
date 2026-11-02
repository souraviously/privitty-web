import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Server Component caching (Next.js 15+)
  cacheComponents: true,

  productionBrowserSourceMaps: false,
  compress: true,
  // Partial prefetching for faster client-side navigation (Next.js 15+)
  partialPrefetching: true,
};

export default nextConfig;
