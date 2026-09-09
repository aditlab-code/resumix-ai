import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  cleanDistDir: true,
  reactStrictMode: true,
  outputFileTracing: false,
  transpilePackages: ['@cv-ats/contracts'],
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './src/lib/empty.js',
        encoding: './src/lib/empty.js',
      },
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    if (isServer) {
      config.externals = [...(config.externals || []), 'mermaid'];
    }
    return config;
  },
};

export default nextConfig;
