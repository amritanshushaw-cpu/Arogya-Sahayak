let withPWA = (config) => config;

try {
  const pwaInit = require('@ducanh2912/next-pwa');
  const pwaPlugin = typeof pwaInit === 'function' ? pwaInit : (pwaInit.default || pwaInit);
  
  if (typeof pwaPlugin === 'function') {
    withPWA = pwaPlugin({
      dest: 'public',
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      reloadOnOnline: true,
      disable: process.env.NODE_ENV === 'development',
      workboxOptions: {
        disableDevLogs: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-assets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^\/models\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ml-models',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      }
    });
  }
} catch (err) {
  console.warn('Warning: @ducanh2912/next-pwa not loaded, continuing with standard Next config:', err.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
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

module.exports = withPWA(nextConfig);
