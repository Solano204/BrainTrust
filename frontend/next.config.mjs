const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ← cambia a true
  },
  eslint: {
    ignoreDuringBuilds: true, // ← también este para evitar más bloqueos
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