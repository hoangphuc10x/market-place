import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@threadly/themes', '@threadly/types', '@threadly/db'],
  // Slim production image: bundles only what's needed under .next/standalone
  output: 'standalone',
  // In a monorepo, point Next at the workspace root so file tracing picks up
  // hoisted dependencies from /node_modules and workspace packages.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      // Local upload dev server (multer disk storage)
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      // Google Drive (public files served via googleusercontent CDN)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      // Cloudinary (image CDN — production upload target)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Future: own CDN
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.threadly.example' },
    ],
  },
};

export default withNextIntl(nextConfig);
