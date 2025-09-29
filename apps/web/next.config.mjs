/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true
  },
  transpilePackages: ['@apptit/graphql', '@apptit/ui', '@apptit/common']
};

export default nextConfig;
