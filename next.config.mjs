/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode in dev to prevent double-invocation of effects
  // which was contributing to duplicate globe initialization attempts.
  // Consider re-enabling once globe component is fully idempotent.
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // Cesium looks for this to resolve its static assets (if using built distribution)
    CESIUM_BASE_URL: '/cesium',
    // Provide optionally an Ion token; user can set in local environment
    NEXT_PUBLIC_CESIUM_ION_TOKEN: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || ''
  },
}

export default nextConfig