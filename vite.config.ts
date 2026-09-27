import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: true,
      resolvers: [],
    }),
  ],
  //Forward API calls to the backend so the browser (on any machine) talks to
  //the frontend's origin only - no CORS and no localhost URL on LAN clients.
  server: {
    host: true, // expose dev server to the local network
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true, // expose `vite preview` to the local network too
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://iain-pc:5000',
        changeOrigin: true,
      },
    },
  },
})
