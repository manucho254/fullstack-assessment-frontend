import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy API requests to Django backend
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __API_URL__: mode === 'production' 
        ? '"https://your-django-backend.com"' 
        : '"http://localhost:8000"',
    },
  };
});
