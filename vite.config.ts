import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolveApiOrigin } from './src/lib/apiBaseUrl.ts';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Fail `vite build` (not dev, not test) on a missing/malformed
  // VITE_API_BASE_URL instead of shipping a bundle that cannot start.
  if (command === 'build' && mode !== 'test') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    resolveApiOrigin(env.VITE_API_BASE_URL);
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
