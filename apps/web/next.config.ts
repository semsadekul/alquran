import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for Cloudflare Pages — generates static HTML at build time.
  // All surah pages are pre-rendered via generateStaticParams.
  output: 'export',
  // Cloudflare Pages needs trailing slashes to resolve directory index files.
  trailingSlash: true,
};

export default nextConfig;
