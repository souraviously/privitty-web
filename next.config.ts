import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Server Component caching (Next.js 15+)
  cacheComponents: true,

  productionBrowserSourceMaps: false,
  compress: true,
  // Partial prefetching for faster client-side navigation (Next.js 15+)
  partialPrefetching: true,

  images: {
    remotePatterns: [
      // S3 bucket direct access
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
