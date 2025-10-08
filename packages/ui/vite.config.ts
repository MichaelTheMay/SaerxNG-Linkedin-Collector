import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Server configuration with strict port management
  server: {
    port: 5173,
    strictPort: true, // Fail if port is already in use instead of trying next available port
    host: true, // Listen on all addresses

    // Hot Module Replacement configuration
    hmr: {
      overlay: true, // Show error overlay
    },

    // Force optimize deps on startup to avoid stale cache issues
    force: true,

    // Open browser on startup
    open: true,

    // Proxy API requests to Node.js backend (port 3001)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Clear output directory before build
    emptyOutDir: true,
  },

  // Resolve configuration for proper module resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../../shared'),
    },
  },

  // Clear cache on startup
  cacheDir: '.vite',

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'axios',
    ],
  },
})
