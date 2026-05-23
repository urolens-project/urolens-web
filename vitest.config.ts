import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    css: true,
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
      VITE_APP_ENV: 'test',
      VITE_SESSION_TIMEOUT_MINUTES: '30',
    },
  },
});
