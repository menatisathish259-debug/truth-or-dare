import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { partyServerPlugin } from './party-server.ts'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), partyServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
})
