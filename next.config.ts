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
  },
};

export default nextConfig;
