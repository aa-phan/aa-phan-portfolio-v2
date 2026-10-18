import { expect, test } from '@playwright/test'

const LIGHT_BG = 'oklch(0.9889 0.0039 286.33)'
const DARK_BG = 'oklch(0.119 0.0436 285.36)'
const BACKGROUNDS = { light: LIGHT_BG, dark: DARK_BG } as const
const SCHEMES = ['light', 'dark'] as const

test('theme: toggle switches to dark and the choice survives reload', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light' })
  const page = await context.newPage()
  await page.goto('./')

  const toggle = page.getByRole('button', { name: 'Dark theme' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')

  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).toBe(DARK_BG)

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await context.close()
})

test('theme: first visit follows system preference', async ({ browser }) => {
  for (const scheme of SCHEMES) {
    const context = await browser.newContext({ colorScheme: scheme })
    const page = await context.newPage()
    await page.goto('./')

    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme)
    await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
      'aria-pressed',
      scheme === 'dark' ? 'true' : 'false',
    )
    await context.close()
  }
})

test('theme: stored choice wins over system preference', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' })
  await context.addInitScript(() => {
    window.localStorage.setItem('theme', 'light')
  })
  const page = await context.newPage()
  await page.goto('./')

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await context.close()
})

test('theme: no flash, attribute and background are set before app JS runs', async ({
  browser,
}) => {
  for (const scheme of SCHEMES) {
    const context = await browser.newContext({ colorScheme: scheme })
    const page = await context.newPage()
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('./')

    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme)
    await expect(page.locator('button')).toHaveCount(0)
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe(BACKGROUNDS[scheme])
    await context.close()
  }
})

test('theme: blocked storage falls back to system preference and toggle still works', async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: 'dark' })
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('blocked', 'SecurityError')
      },
    })
  })
  const page = await context.newPage()
  const errors: Error[] = []
  page.on('pageerror', (e) => errors.push(e))

  await page.goto('./')
  await page.waitForLoadState('networkidle')

  const toggle = page.getByRole('button', { name: 'Dark theme' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')

  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')

  expect(errors).toEqual([])
  await context.close()
})
