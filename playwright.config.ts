import { defineConfig } from '@playwright/test'

const BASE = process.env.VITE_BASE || '/'
const live = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { baseURL: live || `http://localhost:4173${BASE}` },
  ...(live
    ? {}
    : {
        webServer: {
          command: 'npm run preview -- --port 4173 --strictPort',
          url: `http://localhost:4173${BASE}`,
          reuseExistingServer: !process.env.CI,
        },
      }),
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
