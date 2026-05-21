/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 'standalone' is for Docker/container deployments only.
  // Remove it for local dev; re-enable when building the Docker image.
  // output: 'standalone',
};

module.exports = nextConfig;
