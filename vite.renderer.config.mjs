import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        newCanvas: 'src/prompt/new-canvas.html'
      }
    }
  }
});
