/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled typedRoutes as it causes build errors with dynamic routes
  // experimental: {
  //   typedRoutes: true,
  // },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Games merged in the UX-4 rebuild (docs/GAMES_3D_UPGRADE_PLAN.md): old
  // links go to the game that replaced them.
  async redirects() {
    return [
      {
        source: '/games/number-monster-feeding',
        destination: '/games/counting-carnival',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Allow games and lessons to be embedded in iframes (same origin)
        source: '/(games|lessons)/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // All other pages deny framing
        source: '/((?!games|lessons).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
