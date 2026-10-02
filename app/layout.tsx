import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SerwistProvider } from '@serwist/next/react';
import { AppleSplashScreens } from '@/components/system/AppleSplashScreens';
import '@/styles/globals.css'; // single entry: Tailwind + tokens + base + utilities

/* Font variables consumed by the tokens: --font-sans / --font-display / --font-mono */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // No maximumScale / userScalable: pinch-zoom must stay available (WCAG 1.4.4).
  // Inputs avoid iOS focus-zoom by using ≥16px text, not by disabling zoom.
  themeColor: '#03040A', // = --color-chrome-base → Safari status bar matches the header
  viewportFit: 'cover', // header draws under the status bar; safe-area insets become real
};

const DESCRIPTION =
  'Youth soccer schedules for parents — the next game at a glance, conflicts and tight gaps flagged, every team’s season in seconds.';

/*
 * Link previews (Messages, Slack, iOS share sheet) are built from this metadata.
 * Images use Next file conventions: app/opengraph-image.png + app/twitter-image.png
 * (with .alt.txt), app/apple-icon.png. The manifest comes from app/manifest.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://matchdule.vercel.app'), // absolute URLs for preview images
  title: 'Matchdule',
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Matchdule',
    title: 'Matchdule',
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matchdule',
    description: DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Matchdule',
  },
  other: {
    // Next emits `mobile-web-app-capable`; older iOS versions only read the apple- prefix
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      // No background class here — global.css paints <html> (dark above the header, light below)
      className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <AppleSplashScreens />
      </head>
      {/* global.css sets the canvas background, font smoothing and min-height: 100dvh */}
      <body>
        {/* Offline support: registers /sw.js (built by `serwist build`, see serwist.config.mjs).
            Off in dev so a cached worker never hides your code changes.
            reloadOnOnline: when signal returns, the page refreshes with live data. */}
        <SerwistProvider
          swUrl='/sw.js'
          disable={process.env.NODE_ENV === 'development'}
          reloadOnOnline
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
