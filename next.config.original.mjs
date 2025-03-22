/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    serverComponentsExternalPackages: ['jstat'],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    AD_ANALYTICS_ENABLED: process.env.AD_ANALYTICS_ENABLED,
    AD_MAX_SLOTS_PER_PAGE: process.env.AD_MAX_SLOTS_PER_PAGE,
    AD_REFRESH_INTERVAL: process.env.AD_REFRESH_INTERVAL,
    AD_MIN_CONFIDENCE_THRESHOLD: process.env.AD_MIN_CONFIDENCE_THRESHOLD,
  },
  // Used to improve performance in production environments
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
