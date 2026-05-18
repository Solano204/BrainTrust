import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    missingSuspenseWithCSRBailout: false,
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);