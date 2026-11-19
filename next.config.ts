import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export architecture for Cloudflare Pages
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Ensure strict react rendering in development
  reactStrictMode: true,
  // Disable dev indicator badge in development so it does not overlap UI buttons
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['@hugeicons/core-free-icons', '@hugeicons/react'],
  },
};

export default nextConfig;
