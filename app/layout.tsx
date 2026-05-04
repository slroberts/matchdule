import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

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
    <html lang='en' className='bg-surface-base'>
      <body className='antialiased min-h-screen'>{children}</body>
    </html>
  );
}
