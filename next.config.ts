import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    allowDevelopmentBuild: true,
    serverActions: {
      allowedOrigins: ["localhost:3000", "portalos.ru", "www.portalos.ru", "*"]
    }
  },
  productionBrowserSourceMaps: true,
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
