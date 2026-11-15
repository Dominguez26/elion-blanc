import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacidad: resolve(__dirname, 'privacidad/index.html'),
        terminos: resolve(__dirname, 'terminos/index.html'),
        cookies: resolve(__dirname, 'cookies/index.html')
      }
    }
  }
});
