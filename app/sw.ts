/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkFirst, Serwist } from 'serwist';

/**
 * Service worker — built by `serwist build` (serwist.config.mjs) after `next build`.
 *
 * Offline at the field:
 * - Pages (and their RSC payloads) are NetworkFirst with a 3 s timeout: fresh data when the
 *   signal is good, the last-viewed schedule within 3 s when it isn't (default would hang
 *   on "lie-fi" — one bar that never finishes).
 * - A page never visited while online falls back to /~offline.
 */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const NETWORK_TIMEOUT_SECONDS = 3;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Full page loads (open the app, refresh, week links)
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      }),
    },
    // Client-side navigations (Next.js RSC payloads)
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin && request.headers.get('RSC') === '1',
      handler: new NetworkFirst({
        cacheName: 'pages-rsc',
        networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS,
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
