import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: './',
    server: { host: true },
    define: {
      __OFFER_DATA__: JSON.stringify(env.OFFER_DATA || ''),
    },
  }
})
