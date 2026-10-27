import { expect, test, type Page } from '@playwright/test'

const ADDRESS = 'aaron.phan240@gmail.com'
const SUCCESS = 'Email copied to clipboard'
const FALLBACK = 'Couldn’t copy the address. Opening your mail app instead.'

const copyLink = (page: Page) => page.locator('#hero').getByRole('link', { name: 'Copy email' })
const visualToast = (page: Page, text: string) =>
  page.locator('[aria-hidden="true"]', { hasText: text })

test.describe('copy email', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('copy email: click copies the address and announces and shows the toast', async ({
    page,
  }) => {
    await page.goto('./')
    const url = page.url()

    await copyLink(page).click()

    await expect(page.getByRole('status')).toHaveText(SUCCESS)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS)

    const toast = visualToast(page, SUCCESS)
    await expect(toast).toBeVisible()
    await expect(toast).toHaveCSS('opacity', '1')
    await expect(toast).toBeHidden({ timeout: 6000 })
    expect(page.url()).toBe(url)
  })
})

test.describe('copy email failure', () => {
  test('copy email: both copy paths failing shows the fallback copy and opens mail', async ({
    page,
  }) => {
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      })
      document.execCommand = () => false
    })
    await page.goto('./')

    // The mail app hand-off navigates to mailto:, which Chromium treats as a download-less no-op.
    await copyLink(page).click()

    await expect(page.getByRole('status')).toHaveText(FALLBACK)
    await expect(visualToast(page, FALLBACK)).toBeVisible()
    expect(errors).toEqual([])
  })
})

test.describe('copy email toast', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('copy email: reduced motion shows the toast at once with no running animation', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      permissions: ['clipboard-read', 'clipboard-write'],
      baseURL: test.info().project.use.baseURL,
    })
    const page = await context.newPage()
    await page.goto('./')
    await copyLink(page).click()

    const toast = visualToast(page, SUCCESS)
    await expect(toast).toBeVisible()
    await page.waitForTimeout(100)
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    )
    expect(running).toBe(0)
    await context.close()
  })

  test('copy email: two clicks leave exactly one toast that outlives the second click by 3.5 s', async ({
    page,
  }) => {
    await page.goto('./')
    await copyLink(page).click()
    await expect(visualToast(page, SUCCESS)).toBeVisible()
    await page.waitForTimeout(1000)
    await copyLink(page).click()
    await expect(visualToast(page, SUCCESS)).toHaveCount(1)
    await page.waitForTimeout(3500)
    await expect(visualToast(page, SUCCESS)).toHaveCount(1)
    await expect(visualToast(page, SUCCESS)).toBeVisible()
  })

  test('copy email: with every lazy chunk blocked the click still copies and announces', async ({
    page,
  }) => {
    const html = await (await page.request.get('./')).text()
    const initial = new Set(
      [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((match) => match[1].split('/').pop()),
    )
    await page.route('**/*.js', (route) => {
      const name = new URL(route.request().url()).pathname.split('/').pop()
      return initial.has(name) ? route.continue() : route.abort()
    })
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    await page.goto('./')
    await copyLink(page).click()

    await expect(page.getByRole('status')).toHaveText(SUCCESS)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS)
    const toast = visualToast(page, SUCCESS)
    await expect(toast).toBeVisible()
    // Visible to Playwright is not enough: an unanimated `initial` would leave it at opacity 0.
    await expect(toast).toHaveCSS('opacity', '1')
    await expect(toast).toBeHidden({ timeout: 6000 })
    expect(errors).toEqual([])
  })
})

test.describe('copy email without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('copy email: JS disabled keeps a working mailto link', async ({ page }) => {
    await page.goto('./')
    await expect(copyLink(page)).toHaveAttribute('href', `mailto:${ADDRESS}`)
  })
})
