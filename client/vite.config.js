import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Isole React et React-Router dans leur propre chunk
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          // Isole les icônes Lucide
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Isole la librairie de notifications
          if (id.includes('node_modules/react-toastify')) {
            return 'toastify';
          }
        },
      },
    },
  },
})