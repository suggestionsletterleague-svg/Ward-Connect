import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Files copied as-is into the build output.
      includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'offline.html'],
      manifest: {
        name: 'Greenfield 1st Ward',
        short_name: 'Greenfield',
        description: 'Greenfield 1st Ward — connect, serve, and stay informed.',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        theme_color: '#1e3a5f',
        background_color: '#ffffff',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        // Precache the built assets.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Serve offline.html when a navigation request fails and nothing is cached.
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/admin/],
        runtimeCaching: [
          {
            // Cache Supabase GET responses so public content is readable offline.
            urlPattern: ({ url }) => url.pathname.includes('/rest/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        // Keep the SW disabled in dev to avoid caching headaches while developing.
        enabled: false
      }
    })
  ],
  server: {
    port: 5173,
    host: true // expose on local network so phones can preview during dev
  }
})
