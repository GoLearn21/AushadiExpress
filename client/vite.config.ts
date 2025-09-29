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
    port: 3001,
    strictPort: true,
    proxy: {
      // Handle all API requests with /api prefix
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        // Keep the /api prefix when forwarding to backend
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy Error]', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Vite Proxy] Request:', {
              method: req.method,
              url: req.url,
              path: req.path,
              headers: req.headers
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Vite Proxy] Response:', {
              statusCode: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              method: req.method,
              url: req.url
            });
          });
        }
      },
      // Handle non-prefixed API requests (temporary for backward compatibility)
      '^/(products|stock|sales|documents)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy Legacy Error]', err);
          });
        }
      }
    },
    fs: {
      allow: ['..']
    },
    hmr: {
      clientPort: 3001,
      overlay: true
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    }
  },
  // Add build configuration for production
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    sourcemap: true
  }
});
