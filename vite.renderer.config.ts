import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        newCanvas: resolve(__dirname, 'src/prompt/new-canvas.html'),
      },
    },
  },
});
