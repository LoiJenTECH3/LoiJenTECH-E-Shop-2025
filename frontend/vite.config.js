import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  // Explicitly set the base path to ensure it loads at the root '/'
  base: './', 
  
  server: {
    // Vite defaults to localhost:5173, no change needed here for port
    proxy: {
      // Any request from the frontend that starts with '/api' 
      // will be redirected to 'http://localhost:5000'
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // The rewrite rule removes the '/api' prefix before sending 
        // the request to the backend.
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    }
  }
});
