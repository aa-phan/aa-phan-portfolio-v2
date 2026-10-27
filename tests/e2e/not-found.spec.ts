import { expect, test } from '@playwright/test'

// The 404 is a static page with no React: every test runs with JavaScript off. Only chromium runs
// this file (the page is not phone-specific). The real 404 status is checked on staging (plan
// 03-19), because vite preview falls back to index.html for unknown paths, so the spec requests
// 404.html directly.
test.use({ javaScriptEnabled: false })

// Palette D backgrounds (tokens.css), as Chromium reports the computed oklch value.
const LIGHT_BG = 'oklch(0.9696 0.003 290)'

test.describe('404 page, light', () => {
  test.use({ colorScheme: 'light' })

  test('says Dead air. with a way home, in the light palette', async ({ page, baseURL }) => {
    const scripts: string[] = []
    page.on('request', (request) => {
      if (/\.js(\?|$)/.test(new URL(request.url()).pathname)) scripts.push(request.url())
    })
    await page.goto('./404.html')

    await expect(page.getByRole('heading', { level: 1, name: 'Dead air.' })).toBeVisible()
    await expect(page.getByText('This page isn’t in the set.')).toBeVisible()

    const cta = page.getByRole('link', { name: 'Back to the home page' })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', new URL(baseURL!).pathname)

    expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      LIGHT_BG,
    )
    await expect(page.locator('.wordmark')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.getByText('Aaron Phan. DJs as PHVNTM.')).toBeVisible()

    expect(scripts).toEqual([])
  })
})
