import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Alias configuration
const aliases = {
  '@': path.resolve(__dirname, 'src'),
  '@shared': path.resolve(__dirname, '../shared')
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: aliases,
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      port: 5000,
      overlay: true
    },
    fs: {
      allow: ['..']
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  // Add build configuration for production
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    sourcemap: true
  }
});
