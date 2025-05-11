/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3009', '222.237.212.154:3009']
    }
  }
};

module.exports = nextConfig; 