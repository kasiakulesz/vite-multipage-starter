import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { globSync } from 'glob';
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const inputs = globSync('src/**/*.html', { nodir: true }).map(entry =>
  resolve(__dirname, entry)
)

export default defineConfig({
  base: '/vite-multipage-starter/',
  plugins: [
    tailwindcss(),
  ],

  root: resolve(__dirname, 'src'),
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: inputs,
    },
    outDir: resolve(__dirname, 'dist'),
  },
})
