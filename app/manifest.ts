import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Matchdule Soccer',
    short_name: 'Matchdule',
    description: 'Track your soccer schedule with ease.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e27',
    theme_color: '#0a0e27',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
