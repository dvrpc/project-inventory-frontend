import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@types': path.resolve(__dirname, './src/types.ts'),
      '@utils': path.resolve(__dirname, './src/utils.ts'),
      '@consts': path.resolve(__dirname, './src/consts.ts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
});
