import { defineConfig, devices } from '@playwright/test'

const BASE = process.env.VITE_BASE || '/'
// Tests navigate with page.goto('./'), which resolves against the base URL. Without a trailing
// slash a base such as https://user.github.io/repo would resolve to the origin root.
const liveRaw = process.env.E2E_BASE_URL?.trim()
const live = liveRaw ? liveRaw.replace(/\/?$/, '/') : undefined

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
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' }, testIgnore: /mobile\// },
    // Pixel 7 is Chromium, so CI needs no extra browser. Only the phone specs run here.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\/.*\.spec\.ts/ },
  ],
})
