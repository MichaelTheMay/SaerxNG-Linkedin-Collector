import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared'),
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
