import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // 빌드 최적화
  build: {
    // 빌드 출력 폴더 (Vercel 공개 디렉토리)
    outDir: 'dist',

    // Code splitting 및 청크 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
        },
      },
    },
    // Minification (SWC 사용)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
      },
    },
    // 청크 사이즈 경고 설정
    chunkSizeWarningLimit: 1000,
  },

  // 서버 설정
  server: {
    port: 3000,
    host: true,
  },

  // 프리뷰 설정
  preview: {
    port: 4173,
    host: true,
  },
})
