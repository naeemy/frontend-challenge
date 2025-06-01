/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'openweathermap.org',
      'cdn.weatherapi.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
        pathname: '/weather/**',
      }
    ]
  },
  env: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    PLACES_API_KEY: process.env.PLACES_API_KEY,
  },
  // Enable source maps in development
  productionBrowserSourceMaps: false,

  // Optimize builds
  swcMinify: true,

  // Enable React strict mode
  reactStrictMode: true,

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {

            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Webpack configuration for aliases (backup)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    }
    return config
  }
}

export default nextConfig
