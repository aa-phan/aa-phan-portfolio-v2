import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // includes process.env (CI sets VITE_BASE)
  return {
    base: env.VITE_BASE || '/',
    plugins: [react(), tailwindcss(), imagetools()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
    build: {
      rolldownOptions: {
        // 404.html is a static second entry (D-01): GitHub Pages serves it for unknown paths.
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          notFound: path.resolve(import.meta.dirname, '404.html'),
        },
      },
    },
  }
})
