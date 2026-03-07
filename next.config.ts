import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  crossOrigin: 'anonymous',
  allowedDevOrigins: ['*', '*.*],
  experimental: {
    //allowDevelopmentBuild: true,
    serverActions: {
      allowedOrigins: ["*/*"]
    }
  },
  productionBrowserSourceMaps: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
