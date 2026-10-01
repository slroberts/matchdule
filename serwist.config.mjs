// @ts-check
import { serwist } from '@serwist/next/config';

/**
 * Service worker build (Serwist "configurator mode") — runs AFTER `next build`.
 * Works with Turbopack, unlike the old withSerwist() webpack wrapper.
 * Source: app/sw.ts → output: public/sw.js (gitignored, generated every build).
 */
export default serwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
});
