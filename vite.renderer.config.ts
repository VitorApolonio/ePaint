import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        promptResize: resolve(__dirname, 'src/window-resize/index.html'),
      },
    },
  },
});
