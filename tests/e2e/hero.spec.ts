import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const FLOOD_OPEN = 'inset(0px)'

/** Computed state of one CTA: where the flood is and what the label looks like. */
async function ctaState(page: Page, name: string) {
  return page.getByRole('link', { name }).evaluate((anchor) => {
    const flood = anchor.querySelector('.cta-flood')
    const label = anchor.querySelector('.cta-label')
    if (!flood || !label) throw new Error('CTA is missing its flood or label span')
    return {
      clipPath: getComputedStyle(flood).clipPath,
      labelColor: getComputedStyle(label).color,
      labelTranslate: getComputedStyle(label).translate,
      outlineWidth: getComputedStyle(anchor).outlineWidth,
      outlineStyle: getComputedStyle(anchor).outlineStyle,
    }
  })
}

const pageGround = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test.describe('hero CTAs', () => {
  test('hover floods the Download resume button with ink and lifts the label', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      colorScheme: 'light',
      reducedMotion: 'no-preference',
      viewport: { width: 1280, height: 800 },
    })
    const page = await context.newPage()
    await page.goto('./')
    await page.waitForLoadState('networkidle')

    const resting = await ctaState(page, 'Download resume')
    expect(resting.clipPath).not.toBe(FLOOD_OPEN)
    expect(resting.labelTranslate).toBe('none')

    await page.getByRole('link', { name: 'Download resume' }).hover()
    const ground = await pageGround(page)
    await expect
      .poll(async () => (await ctaState(page, 'Download resume')).clipPath)
      .toBe(FLOOD_OPEN)
    await expect.poll(async () => (await ctaState(page, 'Download resume')).labelColor).toBe(ground)
    await expect
      .poll(async () => (await ctaState(page, 'Download resume')).labelTranslate)
      .toBe('0px -2px')
    await context.close()
  })

  test('keyboard focus gives the same flood and a 2px focus outline', async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: 'light',
      reducedMotion: 'no-preference',
      viewport: { width: 1280, height: 800 },
    })
    const page = await context.newPage()
    await page.goto('./')
    await page.waitForLoadState('networkidle')

    // The skip link, home link, six nav links, theme toggle and nav Resume come first.
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab')
      const onResume = await page.evaluate(
        () => document.activeElement?.textContent?.trim() === 'Download resume',
      )
      if (onResume) break
    }
    await expect(page.getByRole('link', { name: 'Download resume' })).toBeFocused()

    const ground = await pageGround(page)
    await expect
      .poll(async () => (await ctaState(page, 'Download resume')).clipPath)
      .toBe(FLOOD_OPEN)
    await expect.poll(async () => (await ctaState(page, 'Download resume')).labelColor).toBe(ground)
    const focused = await ctaState(page, 'Download resume')
    expect(focused.outlineStyle).toBe('solid')
    expect(focused.outlineWidth).toBe('2px')
    await context.close()
  })

  test('reduced motion: the flood still shows but the label does not lift', async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: 'light',
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 800 },
    })
    const page = await context.newPage()
    await page.goto('./')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Download resume' }).hover()
    await expect
      .poll(async () => (await ctaState(page, 'Download resume')).clipPath)
      .toBe(FLOOD_OPEN)
    expect((await ctaState(page, 'Download resume')).labelTranslate).toBe('none')
    await context.close()
  })
})

test('first viewport at 375 x 667 holds the name, role and both CTAs at 44px or taller', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('./')
  await page.waitForLoadState('networkidle')

  const targets = [
    page.locator('#hero h1'),
    page.locator('#hero h1 + p'),
    page.getByRole('link', { name: 'Download resume' }),
    page.getByRole('link', { name: 'Copy email' }),
  ]
  for (const target of targets) {
    const box = await target.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(667)
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  }
  for (const name of ['Download resume', 'Copy email']) {
    const box = await page.getByRole('link', { name }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
})

for (const width of [320, 390]) {
  test(`the poster name causes no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('./')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth)

    const h1 = await page.locator('#hero h1').boundingBox()
    expect(h1!.x + h1!.width).toBeLessThanOrEqual(width)
  })
}

test('the document head carries a unique title, a description and viewport-fit', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page).toHaveTitle('Aaron Phan | Software engineer')

  const description = await page.locator('meta[name="description"]').getAttribute('content')
  expect(description).not.toBeNull()
  expect(description!.length).toBeGreaterThanOrEqual(50)
  expect(description!.length).toBeLessThanOrEqual(160)
  expect(description).not.toMatch(/\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}/)

  const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
  expect(viewport).toContain('viewport-fit=cover')
})
