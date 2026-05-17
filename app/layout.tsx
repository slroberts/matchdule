import type { Metadata, Viewport } from 'next';
import { AppleSplashScreens } from '@/components/AppleSplashScreens';
import '@/styles/globals.css';
import { PortraitLock } from '@/components/ProtraitLock';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0e27',
};

export const metadata: Metadata = {
  title: 'Matchdule',
  description: 'Soccer Schedule Tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Matchdule',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='bg-surface-base' suppressHydrationWarning>
      <head>
        <AppleSplashScreens />
      </head>
      <body className='antialiased min-h-screen'>
        <PortraitLock />
        {children}

        {/* Register the Service Worker for PWA offline caching and installation */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
