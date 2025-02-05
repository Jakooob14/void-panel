import type { NextConfig } from 'next';
import '@/app/jobs/file-expiration';

const nextConfig: NextConfig = {
  images: {
    // loader: 'custom',
    // loaderFile: './app/utilities/loader.ts',
    localPatterns: [
      {
        pathname: '/assets/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gravatar.com',
        pathname: '/avatar/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
