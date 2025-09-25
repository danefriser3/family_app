import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'cypress', 'server'],
      extension: ['.ts', '.tsx'],
      cypress: true,
    }),
  ],
  server: {
    port: 5173,
    strictPort: true, // fail if 5173 is taken; keeps start-server-and-test + Cypress stable
  },
})
