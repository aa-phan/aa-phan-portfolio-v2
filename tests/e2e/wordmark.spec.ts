import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const PHONE = { width: 375, height: 667 }
const DESKTOP = { width: 1280, height: 800 }

const home = (page: Page) => page.getByRole('link', { name: 'Aaron Phan, home' })
const toggle = (page: Page) => page.getByRole('button', { name: 'Dark theme' })

/** The wordmark spans inside the one visible home link. */
const day = (page: Page) => home(page).locator('.wordmark-day')
const night = (page: Page) => home(page).locator('.wordmark-night')

for (const [name, viewport] of [
  ['1280', DESKTOP],
  ['375', PHONE],
] as const) {
  test.describe(`wordmark at ${name}`, () => {
    test.use({ viewport })

    test('light shows PHAN and hides PHVNTM', async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: 'light', viewport })
      const page = await context.newPage()
      await page.goto('./')
      await expect(day(page)).toBeVisible()
      await expect(day(page)).toHaveText('PHAN')
      await expect(night(page)).toBeHidden()
      await expect(night(page)).toHaveText('PHVNTM')
      await context.close()
    })

    test('dark shows PHVNTM widened to 125% and hides PHAN', async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: 'dark', viewport })
      const page = await context.newPage()
      await page.goto('./')
      await expect(night(page)).toBeVisible()
      await expect(night(page)).toHaveText('PHVNTM')
      await expect(day(page)).toBeHidden()
      const stretch = await night(page).evaluate((el) => getComputedStyle(el).fontStretch)
      expect(stretch).toBe('125%')
      // Night widens only the wordmark: the headings keep their width.
      const h1 = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontStretch)
      expect(h1).toBe('100%')
      await context.close()
    })

    test('the home link and h1 keep their names in both themes', async ({ browser }) => {
      for (const scheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({ colorScheme: scheme, viewport })
        const page = await context.newPage()
        await page.goto('./')
        await expect(home(page)).toHaveCount(1)
        await expect(home(page)).toBeVisible()
        await expect(home(page)).toHaveAttribute('href', '#hero')
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Aaron\s*Phan/)
        await expect(page.getByRole('heading', { level: 1, name: 'Aaron Phan' })).toBeVisible()
        await context.close()
      }
    })

    test('exactly one theme toggle is in the accessibility tree', async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: 'light', viewport })
      const page = await context.newPage()
      await page.goto('./')
      await expect(toggle(page)).toHaveCount(1)
      await expect(toggle(page)).toBeVisible()
      await context.close()
    })

    test('the A and the V each sit in their own glyph span', async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: 'light', viewport })
      const page = await context.newPage()
      await page.goto('./')
      await expect(day(page).locator('.wordmark-glyph')).toHaveText('A')
      await expect(night(page).locator('.wordmark-glyph')).toHaveText('V')
      await context.close()
    })
  })
}

test.describe('phone top bar', () => {
  test.use({ viewport: PHONE })

  test('the toggle is inside the first viewport and switches the wordmark', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: PHONE })
    const page = await context.newPage()
    await page.goto('./')

    const box = await toggle(page).boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(PHONE.height)
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)

    // The bar is 64 px tall, above the hero, and not fixed.
    const bar = await page.locator('header > div:visible').first().boundingBox()
    expect(bar?.height).toBe(64)
    expect(await page.locator('header').evaluate((el) => getComputedStyle(el).position)).not.toBe(
      'fixed',
    )

    await expect(day(page)).toBeVisible()
    await toggle(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(night(page)).toBeVisible()
    await expect(day(page)).toBeHidden()
    await context.close()
  })

  test('the phone bar scrolls away with the page', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: PHONE })
    const page = await context.newPage()
    await page.goto('./')
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }))
    const box = await page.locator('header').boundingBox()
    expect(box!.y + box!.height).toBeLessThanOrEqual(0)
    await context.close()
  })
})

test('a toggle changed at 1280 shows the same state after a resize to 375', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', viewport: DESKTOP })
  const page = await context.newPage()
  await page.goto('./')
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  await toggle(page).click()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

  await page.setViewportSize(PHONE)
  await expect(toggle(page)).toHaveCount(1)
  await expect(toggle(page)).toBeVisible()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

  await toggle(page).click()
  await page.setViewportSize(DESKTOP)
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  await context.close()
})

test('both themes render the same text in the same order inside main', async ({ browser }) => {
  const texts: string[] = []
  for (const scheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ colorScheme: scheme, viewport: DESKTOP })
    const page = await context.newPage()
    await page.goto('./')
    await page.waitForLoadState('networkidle')
    texts.push(await page.locator('main').innerText())
    await context.close()
  }
  expect(texts[0].length).toBeGreaterThan(100)
  expect(texts[1]).toBe(texts[0])
})

test('the home link underline draws on keyboard focus', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', viewport: DESKTOP })
  const page = await context.newPage()
  await page.goto('./')
  const mark = home(page).locator('.wordmark')
  const size = () => mark.evaluate((el) => getComputedStyle(el).backgroundSize)
  expect(await size()).toMatch(/^0px 2px$/)
  await page.keyboard.press('Tab') // skip link
  await page.keyboard.press('Tab') // home link
  await expect(home(page)).toBeFocused()
  await expect.poll(size).not.toMatch(/^0px/)
  await context.close()
})
