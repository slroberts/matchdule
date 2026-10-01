/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

// Service worker is built separately by `serwist build` (serwist.config.mjs) after
// `next build` — Serwist's configurator mode, which works with Turbopack.
export default nextConfig;
