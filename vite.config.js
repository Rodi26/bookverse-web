import { defineConfig } from 'vite'

export default defineConfig(() => ({
  root: '.',
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
}))


