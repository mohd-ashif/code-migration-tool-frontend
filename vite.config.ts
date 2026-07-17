import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    // Target modern browsers to enable smaller output and native ESM
    target: 'es2020',
    // Warn on chunks > 500 KB (budget is 250 KB gzipped, ~500 KB raw)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // ── React & core state runtime ──────────────────────────────
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/@reduxjs/toolkit') ||
            id.includes('node_modules/react-redux')
          ) {
            return 'vendor-react';
          }

          // ── React Flow (large graph renderer) ───────────────────────
          if (id.includes('node_modules/reactflow') || id.includes('node_modules/@reactflow')) {
            return 'vendor-reactflow';
          }

          // ── Monaco Editor ────────────────────────────────────────────
          if (id.includes('node_modules/monaco-editor') || id.includes('node_modules/@monaco-editor')) {
            return 'vendor-monaco';
          }

          // ── Framer Motion animation library ─────────────────────────
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }

          // ── React Query & Axios (data layer) ─────────────────────────
          if (
            id.includes('node_modules/@tanstack/react-query') ||
            id.includes('node_modules/axios')
          ) {
            return 'vendor-query';
          }
        },
      },
    },
  },
})
