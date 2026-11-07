import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Darunnisa Hajj & Umrah Travel',
    short_name: 'Darunnisa',
    description: 'Aplikasi Resmi Layanan Haji Khusus & Umrah Yayasan Darunnisa Berizin Kemenag RI',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#051712',
    theme_color: '#051712',
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
