import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'; // 1. Import the plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      // Proxy /api requests to your Flask backend
      '/api': {
        target: 'http://127.0.0.1:5000', // Your Flask server address
        changeOrigin: true,
      },
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
});
