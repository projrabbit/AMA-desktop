import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    // Proxy /api -> backend AMA-server để né CORS (backend chỉ cho phép origin :8080).
    // Vite (Node) chuyển tiếp phía server nên trình duyệt gọi cùng origin, không phát sinh CORS.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    env: {
      VITE_BYPASS_LOGIN: 'false',
    },
  },
});
