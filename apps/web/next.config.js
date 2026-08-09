/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    // Requires NEXT_PUBLIC_API_URL to be set in Vercel for production!
    const apiTarget = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false };
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-web': false,
      };
    }
    return config;
  },
};
module.exports = nextConfig;
