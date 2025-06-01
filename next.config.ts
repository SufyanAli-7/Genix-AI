import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net'],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
