import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Matchdule',
  description: 'Soccer Schedule Tracker',
  // add viewport/theme icons here later
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
