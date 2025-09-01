import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  root: '.',
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'debug',
    minify: mode === 'debug' ? false : 'esbuild'
  }
}))


