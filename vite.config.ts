import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        /* Recharts and its d3 dependencies dominated a single 900 kB chunk.
           Splitting vendors lets the browser cache them independently. */
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
            return 'charts';
          }
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-dom') || id.includes('react\\') || id.includes('scheduler')) {
            return 'react-vendor';
          }
          return 'vendor';
        },
      },
    },
  },
});
