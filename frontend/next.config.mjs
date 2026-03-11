import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  turbopack: {},
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);