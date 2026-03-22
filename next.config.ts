import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.json$/,
      type: 'asset/resource'
    });
    return config;
  },
};

export default nextConfig;
