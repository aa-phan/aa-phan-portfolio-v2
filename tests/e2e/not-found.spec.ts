import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// The 404 is a static page with no React. It runs with JavaScript off by default: html carries
// data-theme="light" so the page reads as the light theme without script. The dark cases turn
// JavaScript on, because the inline theme script is the only thing that can pick dark (the 404
// ships no media-query fallback), and they assert that no .js file is requested. Only chromium
// runs this file (the page is not phone-specific). The real 404 status is checked on staging
// (plan 03-19), because vite preview falls back to index.html for unknown paths, so the spec
// requests 404.html directly.
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

const DARK_BG = 'oklch(0.1491 0.0128 292.39)'

const glyphTransform = (page: Page, theme: 'day' | 'night') =>
  page
    .locator(`.wordmark-${theme} .wordmark-glyph`)
    .evaluate((el) => getComputedStyle(el).transform)

// The theme script is the one piece of JavaScript this page may run, so the dark case runs it
// (with the page's own inline script, no .js request) and checks that nothing else loads.
test.describe('404 page, dark', () => {
  test.use({ colorScheme: 'dark', javaScriptEnabled: true })

  test('follows the system theme: dark palette, night wordmark, no script file', async ({
    page,
  }) => {
    const scripts: string[] = []
    page.on('request', (request) => {
      if (/\.js(\?|$)/.test(new URL(request.url()).pathname)) scripts.push(request.url())
    })
    await page.goto('./404.html')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      DARK_BG,
    )
    await expect(page.locator('.wordmark-night')).toBeVisible()
    await expect(page.locator('.wordmark-night')).toHaveText('PHVNTM')
    await expect(page.locator('.wordmark-day')).toBeHidden()
    expect(await glyphTransform(page, 'night')).not.toBe('none')
    expect(scripts).toEqual([])
  })

  test('a stored light choice beats a dark system', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('./404.html')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('.wordmark-day')).toBeVisible()
  })
})

test.describe('404 page, light glyph and fit', () => {
  test.use({ colorScheme: 'light' })

  test('the day wordmark shows PHAN with the A stuck edge-on', async ({ page }) => {
    await page.goto('./404.html')
    await expect(page.locator('.wordmark-day')).toBeVisible()
    await expect(page.locator('.wordmark-day')).toHaveText('PHAN')
    await expect(page.locator('.wordmark-night')).toBeHidden()
    expect(await glyphTransform(page, 'day')).not.toBe('none')
    // A rotateX(84deg) turn leaves a sliver: a 3D matrix whose y scale is cos(84deg), about 0.1.
    const matrix = await glyphTransform(page, 'day')
    expect(matrix).toMatch(/^matrix3d\(/)
    const values = matrix.slice(9, -1).split(',').map(Number)
    expect(Math.abs(values[5]!)).toBeLessThan(0.15)
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`no horizontal overflow at 320 px (${scheme})`, async ({ browser }) => {
      const context = await browser.newContext({
        colorScheme: scheme,
        // Light is measured with JavaScript off (the page default); dark needs the theme script.
        javaScriptEnabled: scheme === 'dark',
        viewport: { width: 320, height: 640 },
      })
      const page = await context.newPage()
      await page.goto('./404.html')
      await page.evaluate(() => document.fonts.ready)
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
      await expect(page.getByRole('heading', { level: 1, name: 'Dead air.' })).toBeVisible()
      await context.close()
    })
  }
})
