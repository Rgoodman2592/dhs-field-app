import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'DHS Field App',
        short_name: 'DHS Field',
        description: 'Commercial Door, Hardware & Access Control Field Survey',
        theme_color: '#0F2B5B',
        background_color: '#0E1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/xj2c.*\.xano\.io\/api/,
            handler: 'NetworkFirst',
            options: { cacheName: 'xano-api', expiration: { maxEntries: 100, maxAgeSeconds: 3600 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api/ec2': {
        target: 'http://3.147.205.68',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ec2/, '/api'),
      },
    },
  },
});
