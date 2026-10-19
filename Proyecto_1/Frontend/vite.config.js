import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa para que el build funcione desde la raiz del bucket S3.
export default defineConfig({
  plugins: [react()],
  base: './',
});
