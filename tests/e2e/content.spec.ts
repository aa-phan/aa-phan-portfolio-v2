import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const COMPANIES = [
  'Capital One',
  'Spectrum',
  'Symbotic',
  'OdderTech IT',
  'The University of Texas at Austin',
]

async function open(page: Page, width = 1280) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('./')
  await page.waitForLoadState('networkidle')
}

const summaries = (page: Page) => page.locator('#experience summary')

test.describe('experience index list', () => {
  test('shows five rows in the inventory order, all closed', async ({ page }) => {
    await open(page)
    await expect(summaries(page)).toHaveCount(5)
    await expect(page.locator('#experience summary h3 .exp-name')).toHaveText(COMPANIES)
    await expect(page.locator('#experience details[open]')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible()
  })

  test('every row is focusable and Enter opens it onto three bullets', async ({ page }) => {
    await open(page)
    for (let i = 0; i < COMPANIES.length; i++) {
      const summary = summaries(page).nth(i)
      await summary.focus()
      await expect(summary).toBeFocused()
      await page.keyboard.press('Enter')
      const details = page.locator('#experience details').nth(i)
      await expect(details).toHaveAttribute('open', '')
      await expect(details.locator('.exp-bullets > li')).toHaveCount(3)
    }
    // Any number of rows may be open at once.
    await expect(page.locator('#experience details[open]')).toHaveCount(5)
  })

  test('a click toggles a row and Space closes it again', async ({ page }) => {
    await open(page)
    const summary = summaries(page).nth(1)
    await summary.click()
    await expect(page.locator('#experience details').nth(1)).toHaveAttribute('open', '')
    await page.keyboard.press('Space')
    await expect(page.locator('#experience details[open]')).toHaveCount(0)
  })

  test('shows the Capital One dates and the Spectrum 30% bullet', async ({ page }) => {
    await open(page)
    await expect(summaries(page).nth(0)).toContainText('June 2026 – August 2026')
    await summaries(page).nth(1).click()
    await expect(page.locator('#experience details').nth(1)).toContainText('30%')
  })

  test('the location line shows only where it is known', async ({ page }) => {
    await open(page)
    await summaries(page).nth(0).click()
    await summaries(page).nth(3).click()
    await expect(page.locator('#experience details').nth(0)).toContainText('Plano, TX')
    await expect(
      page.locator('#experience details').nth(3).locator('.exp-body-inner > p'),
    ).toHaveCount(0)
  })

  test('OdderTech IT and UT Austin show aria-hidden monogram chips; slots keep one size', async ({
    page,
  }) => {
    await open(page)
    const chips = page.locator('#experience .exp-chip')
    await expect(chips).toHaveText(['OT', 'UT'])
    for (let i = 0; i < 2; i++) {
      await expect(chips.nth(i)).toHaveAttribute('aria-hidden', 'true')
    }
    const slots = await page
      .locator('#experience .exp-slot')
      .evaluateAll((els) =>
        els.map((el) => [el.getBoundingClientRect().width, el.getBoundingClientRect().height]),
      )
    expect(slots).toHaveLength(5)
    for (const [w, h] of slots) {
      expect(w).toBe(24)
      expect(h).toBe(24)
    }
    const xs = await page
      .locator('#experience .exp-name')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)))
    expect(new Set(xs).size).toBe(1)
  })

  test('at 390 px the UT Austin dates sit below its title with no overlap', async ({ page }) => {
    await open(page, 390)
    const row = summaries(page).nth(4)
    const title = await row.locator('.exp-title').boundingBox()
    const dates = await row.locator('.exp-dates').boundingBox()
    const name = await row.locator('h3').boundingBox()
    if (!title || !dates || !name) throw new Error('row boxes missing')
    expect(dates.y).toBeGreaterThanOrEqual(title.y + title.height - 0.5)
    expect(title.y).toBeGreaterThanOrEqual(name.y + name.height - 0.5)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(390)
  })

  test('hover widens the company name at 1280 px and not at 900 px', async ({ page }) => {
    await open(page, 1280)
    const stretch = (index: number) =>
      summaries(page)
        .nth(index)
        .locator('.exp-name')
        .evaluate((el) => getComputedStyle(el).fontStretch)
    expect(await stretch(0)).toBe('100%')
    await summaries(page).nth(0).hover()
    await expect.poll(() => stretch(0)).toBe('112%')

    await open(page, 900)
    await summaries(page).nth(0).hover()
    await page.waitForTimeout(400)
    expect(await stretch(0)).toBe('100%')
  })

  test('hover washes the row and draws the rule to full width', async ({ page }) => {
    await open(page, 1280)
    const state = () =>
      summaries(page)
        .nth(2)
        .evaluate((el) => ({
          background: getComputedStyle(el).backgroundColor,
          rule: getComputedStyle(el, '::after').transform,
        }))
    const resting = await state()
    await summaries(page).nth(2).hover()
    await expect.poll(async () => (await state()).rule).toBe('matrix(1, 0, 0, 1, 0, 0)')
    expect((await state()).background).not.toBe(resting.background)
  })

  test('reduced motion shows the final state with no width change', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 900 },
    })
    const page = await context.newPage()
    await page.goto('./')
    await page.waitForLoadState('networkidle')
    await summaries(page).nth(0).hover()
    const state = await summaries(page)
      .nth(0)
      .evaluate((el) => ({
        stretch: getComputedStyle(el.querySelector('.exp-name') as Element).fontStretch,
        rule: getComputedStyle(el, '::after').transform,
      }))
    expect(state.stretch).toBe('100%')
    await expect
      .poll(() =>
        summaries(page)
          .nth(0)
          .evaluate((el) => getComputedStyle(el, '::after').transform),
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)')
    await context.close()
  })
})

test.describe('experience logos', () => {
  test('the three logos load as AVIF and the monogram rows have no image', async ({ page }) => {
    await open(page)
    await page.locator('#experience').scrollIntoViewIfNeeded()
    const logos = page.locator('#experience .exp-slot img')
    await expect(logos).toHaveCount(3)
    for (let i = 0; i < 3; i++) {
      const logo = logos.nth(i)
      await logo.scrollIntoViewIfNeeded()
      await expect(logo).toHaveAttribute('alt', '')
      await expect
        .poll(() => logo.evaluate((el: HTMLImageElement) => el.currentSrc))
        .toMatch(/\.avif$/)
      await expect
        .poll(() => logo.evaluate((el: HTMLImageElement) => el.naturalWidth))
        .toBeGreaterThan(0)
    }
    await expect(page.locator('#experience .exp-chip')).toHaveCount(2)
  })

  test('with image requests aborted the slots stay 24 px and the names stay aligned', async ({
    page,
  }) => {
    await page.route(/\.(avif|webp|png)(\?.*)?$/, (route) => route.abort())
    await open(page)
    const slots = await page
      .locator('#experience .exp-slot')
      .evaluateAll((els) =>
        els.map((el) => [el.getBoundingClientRect().width, el.getBoundingClientRect().height]),
      )
    expect(slots).toHaveLength(5)
    for (const [w, h] of slots) {
      expect(w).toBe(24)
      expect(h).toBe(24)
    }
    const xs = await page
      .locator('#experience h3')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)))
    expect(new Set(xs).size).toBe(1)
    const nameXs = await page
      .locator('#experience .exp-name')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)))
    expect(new Set(nameXs).size).toBe(1)
  })
})

const INVENTORY = readFileSync(
  path.resolve(
    import.meta.dirname,
    '../../.planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md',
  ),
  'utf8',
)

/** The "- Value:" line of an inventory block, for example ABT-01. */
function inventoryValue(id: string): string {
  const start = INVENTORY.indexOf(`### ${id} `)
  if (start === -1) throw new Error(`inventory has no ${id} block`)
  const rest = INVENTORY.slice(start)
  const match = /^- Value: (.*)$/m.exec(rest)
  if (!match?.[1]) throw new Error(`${id} has no Value line`)
  return match[1].trim()
}

const ALT = 'Aaron Phan DJing at his UT Austin graduation'

test.describe('about me', () => {
  test('the photo has the exact alt text and loads as AVIF', async ({ page }) => {
    await open(page)
    const photo = page.locator('#about img')
    await expect(photo).toHaveCount(1)
    await photo.scrollIntoViewIfNeeded()
    await expect(photo).toHaveAttribute('alt', ALT)
    await expect(photo).toHaveAttribute('loading', 'lazy')
    await expect(photo).toHaveAttribute('decoding', 'async')
    await expect(photo).toHaveAttribute('width', '539')
    await expect(photo).toHaveAttribute('height', '800')
    await expect
      .poll(() => photo.evaluate((el: HTMLImageElement) => el.currentSrc))
      .toMatch(/\.avif$/)
    await expect
      .poll(() => photo.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  })

  test('with image requests aborted the photo box keeps its shape and the alt stays', async ({
    page,
  }) => {
    await page.route(/\.(avif|webp|jpe?g)(\?.*)?$/, (route) => route.abort())
    await open(page)
    const photo = page.locator('#about img')
    await expect(photo).toHaveAttribute('alt', ALT)
    const box = await page.locator('#about picture').locator('..').boundingBox()
    if (!box) throw new Error('photo box missing')
    expect(box.width).toBeGreaterThan(300)
    expect(Math.abs(box.height - (box.width * 800) / 539)).toBeLessThanOrEqual(1)
  })

  test('both bio paragraphs equal the inventory text', async ({ page }) => {
    await open(page)
    const paragraphs = page.locator('#about p')
    await expect(paragraphs).toHaveCount(2)
    await expect(paragraphs.nth(0)).toHaveText(inventoryValue('ABT-01'))
    await expect(paragraphs.nth(1)).toHaveText(inventoryValue('ABT-02'))
    expect(await paragraphs.nth(0).textContent()).toContain('I\u2019m')
  })

  test('the bio starts 128 px down beside the photo at 1280 px', async ({ page }) => {
    await open(page, 1280)
    const photo = await page.locator('#about picture').locator('..').boundingBox()
    const bio = await page.locator('#about p').first().boundingBox()
    if (!photo || !bio) throw new Error('boxes missing')
    expect(Math.round(bio.y - photo.y)).toBe(128)
    expect(bio.x).toBeGreaterThan(photo.x + photo.width)
  })

  test('no quote renders while the inventory says the owner line is pending', async ({ page }) => {
    await open(page)
    const value = inventoryValue('ABT-03')
    const quotes = page.locator('#about blockquote')
    if (/^none\b/i.test(value)) {
      await expect(quotes).toHaveCount(0)
      await expect(page.locator('#about')).not.toContainText('The best time to start')
    } else {
      await expect(quotes).toHaveText(value)
    }
  })

  for (const width of [390, 320]) {
    test(`no horizontal overflow at ${width} px`, async ({ page }) => {
      await open(page, width)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(width)
    })
  }
})
