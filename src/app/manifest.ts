import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediKiosk — AI Clinical Intake Platform',
    short_name: 'MediKiosk',
    description: 'Multimodal clinical intake and medical document digitization station for hospital OPDs and AIIA',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAF9',
    theme_color: '#047857',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ]
  };
}
