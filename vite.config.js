import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Expose on LAN (0.0.0.0) so smartphones on the same Wi-Fi can open FixCycle
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-leaflet': ['leaflet'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
