import { defineConfig } from '@playwright/test'

// Par défaut, les tests tournent sur les FAKE DATA : aucun backend nécessaire.
// Pour tester avec le vrai backend : démarrez-le (port 8080 par défaut), puis
//   E2E_API=1 npm run test          (API_TARGET=http://… pour une autre adresse)
const withApi = Boolean(process.env.E2E_API)

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 7000 },
  use: {
    baseURL: 'http://127.0.0.1:5174',
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM ? undefined : 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port 5174 --strictPort${withApi ? ' --mode api' : ''}`,
    url: 'http://127.0.0.1:5174',
    timeout: 60000,
    reuseExistingServer: false,
    env: withApi
      ? { API_TARGET: process.env.API_TARGET || 'http://127.0.0.1:8080' }
      : { VITE_DATA_SOURCE: 'mock', VITE_MOCK_LATENCY: '50' },
  },
  reporter: [['list']],
})
