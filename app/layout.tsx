import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Matchdule',
  description: 'Know who plays when—always.',
  icons: {
    icon: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Matchdule',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className='h-full' suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          'min-h-screen bg-[#F0F2F5] text-foreground antialiased',
        ].join(' ')}
      >
        {children}
      </body>
    </html>
  );
}
