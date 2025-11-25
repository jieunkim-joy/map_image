import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 프로덕션 빌드 최적화
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide-vendor': ['lucide-react']
        }
      }
    }
  },
  // 프로덕션 환경에서도 환경변수 접두사 유지
  envPrefix: 'VITE_'
});

