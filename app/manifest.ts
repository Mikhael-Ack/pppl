import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mitra Umroh Mandiri',
    short_name: 'Mitra Umroh',
    description: 'Aplikasi Resmi Layanan Haji Khusus & Umroh Berizin Kemenag RI',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#022c22',
    theme_color: '#064e3b',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
