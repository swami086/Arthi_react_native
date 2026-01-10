import type { NextConfig } from 'next';
import RollbarSourceMapPlugin from 'rollbar-sourcemap-webpack-plugin';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pqjwldzyogmdangllnlr.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new RollbarSourceMapPlugin({
          accessToken: process.env.ROLLBAR_POST_SERVER_ITEM_TOKEN,
          version: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || '1.0.0',
          publicPath: 'https://safespace-web.vercel.app/_next/',
        })
      );
    }
    return config;
  },
};

export default nextConfig;
