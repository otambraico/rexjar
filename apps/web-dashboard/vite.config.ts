import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5174,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'cn': path.resolve(__dirname, './src/lib/utils')
    }
  }
});
