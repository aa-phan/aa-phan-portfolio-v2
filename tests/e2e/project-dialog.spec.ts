import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const TITLES = [
  'RecipeCart',
  'A.T.L.A.S',
  'Suspect Genie',
  'MediaDash: Content Recommendation Hub',
  'Full-Stack Library Simulator',
  'FPGA-Based Stopwatch',
  'Smart Mirror',
]

async function open(page: Page, width = 1280, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto('./')
  await page.waitForLoadState('networkidle')
}

const sleeve = (page: Page, n: number) =>
  page.getByRole('button', { name: `${TITLES[n - 1]}, project ${n} of 7` })
const dialog = (page: Page) => page.getByRole('dialog')

test.describe('project dialog', () => {
  test('shows seven sleeves named by title and position', async ({ page }) => {
    await open(page)
    const crate = page.getByRole('list', { name: 'Projects' })
    await expect(crate.getByRole('listitem')).toHaveCount(7)
    for (let n = 1; n <= 7; n++) await expect(sleeve(page, n)).toHaveCount(1)
  })

  test('a click opens the dialog on the project with focus on Close', async ({ page }) => {
    await open(page)
    await sleeve(page, 2).click()
    await expect(dialog(page)).toBeVisible()
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'A.T.L.A.S' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close project details' })).toBeFocused()
  })

  test('Tab never leaves the dialog and Escape returns focus to the sleeve', async ({ page }) => {
    await open(page)
    await sleeve(page, 2).click()
    await expect(dialog(page)).toBeVisible()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      // The inert page can never take focus. When the last control is passed the browser hands
      // focus to its own chrome, which Playwright reports as the body; that is not a page element.
      const inside = await page.evaluate(
        () =>
          document.activeElement === document.body || !!document.activeElement?.closest('dialog'),
      )
      expect(inside, `Tab ${i + 1} did not reach a page element behind the dialog`).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toHaveCount(0)
    await expect(sleeve(page, 2)).toBeFocused()
  })

  test('Enter on a focused sleeve opens it', async ({ page }) => {
    await open(page)
    await sleeve(page, 4).focus()
    await page.keyboard.press('Enter')
    await expect(
      dialog(page).getByRole('heading', {
        level: 2,
        name: 'MediaDash: Content Recommendation Hub',
      }),
    ).toBeVisible()
  })

  test('Next from 07 shows 01 and ArrowLeft from 01 shows 07', async ({ page }) => {
    await open(page)
    await sleeve(page, 7).click()
    await expect(dialog(page).getByText('07 / 07')).toBeVisible()
    await page.getByRole('button', { name: 'Next project' }).click()
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'RecipeCart' })).toBeVisible()
    await expect(dialog(page).getByText('01 / 07')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(
      dialog(page).getByRole('heading', { level: 2, name: 'Smart Mirror' }),
    ).toBeVisible()
    await expect(dialog(page).getByText('07 / 07')).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(dialog(page).getByText('01 / 07')).toBeVisible()
    await page.getByRole('button', { name: 'Previous project' }).click()
    await expect(dialog(page).getByText('07 / 07')).toBeVisible()
  })

  test('focus returns to the sleeve that opened the dialog after stepping through projects', async ({
    page,
  }) => {
    await open(page)
    await sleeve(page, 3).click()
    await page.getByRole('button', { name: 'Next project' }).click()
    await page.getByRole('button', { name: 'Next project' }).click()
    await page.getByRole('button', { name: 'Close project details' }).click()
    await expect(dialog(page)).toHaveCount(0)
    await expect(sleeve(page, 3)).toBeFocused()
  })

  test('a click on the backdrop closes it and a click inside the panel does not', async ({
    page,
  }) => {
    await open(page)
    await sleeve(page, 1).click()
    await expect(dialog(page)).toBeVisible()
    await dialog(page).getByRole('heading', { level: 2 }).click()
    await expect(dialog(page)).toBeVisible()
    await page.mouse.click(10, 10)
    await expect(dialog(page)).toHaveCount(0)
    await expect(sleeve(page, 1)).toBeFocused()
  })

  test('background scroll is locked while open and the URL never changes', async ({ page }) => {
    await open(page)
    const url = page.url()
    await sleeve(page, 1).click()
    await expect(dialog(page)).toBeVisible()
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    )
    await page.getByRole('button', { name: 'Next project' }).click()
    expect(page.url()).toBe(url)
    await page.keyboard.press('Escape')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe(
      'hidden',
    )
    expect(page.url()).toBe(url)
  })

  test('RecipeCart shows the code link with a safe new tab; projects without a URL show none', async ({
    page,
  }) => {
    await open(page)
    await sleeve(page, 1).click()
    const link = dialog(page).getByRole('link', { name: 'Code on GitHub (opens in a new tab)' })
    await expect(link).toHaveAttribute('href', 'https://github.com/aa-phan/RecipeCart')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    // The approved write-up replaces the bullets for the featured project.
    for (const name of ['Problem', 'Approach', 'Outcome']) {
      await expect(dialog(page).getByRole('heading', { level: 3, name })).toBeVisible()
    }
    for (let n = 2; n <= 7; n++) {
      await page.getByRole('button', { name: 'Next project' }).click()
      await expect(dialog(page).getByRole('link')).toHaveCount(0)
    }
  })

  test('non-featured projects show their bullets verbatim', async ({ page }) => {
    await open(page)
    await sleeve(page, 4).click()
    await expect(dialog(page).getByRole('heading', { level: 3 })).toHaveCount(0)
    await expect(
      dialog(page).getByText('Integrated Supabase into the data storage schema'),
    ).toBeVisible()
  })

  test('the long MediaDash title wraps inside its sleeve and nothing overflows the page', async ({
    page,
  }) => {
    for (const width of [320, 390, 768, 1280, 1920]) {
      await open(page, width, 900)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `horizontal overflow at ${width}`).toBe(0)
      const title = sleeve(page, 4).locator('span').last()
      const fit = await title.evaluate((el) => {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
        return {
          lines: el.getBoundingClientRect().height / lineHeight,
          over: el.scrollWidth - el.clientWidth,
        }
      })
      expect(fit.lines, `title lines at ${width}`).toBeGreaterThan(1.5)
      expect(fit.lines, `title lines at ${width}`).toBeLessThanOrEqual(5.5)
      expect(fit.over, `title overflows its box at ${width}`).toBeLessThanOrEqual(0)
    }
  })

  test('the crate index reads 1 / 7 at rest and changes after scrolling the crate', async ({
    page,
  }) => {
    await open(page, 1280)
    const index = page.locator('#projects').getByText(/^\d \/ 7$/)
    await expect(index).toHaveText('1 / 7')
    await page.getByRole('list', { name: 'Projects' }).evaluate((el) => {
      el.scrollTo({ left: el.scrollWidth, behavior: 'instant' })
    })
    await expect(index).not.toHaveText('1 / 7')
  })

  test('the next sleeve peeks by at least 24 px at 390 and 1280', async ({ page }) => {
    for (const width of [390, 1280]) {
      await open(page, width)
      const peek = await page.getByRole('list', { name: 'Projects' }).evaluate((crate) => {
        const edge = crate.getBoundingClientRect().right
        const cut = Array.from(crate.children)
          .map((item) => item.getBoundingClientRect())
          .find((rect) => rect.left < edge && rect.right > edge)
        return cut ? edge - cut.left : 0
      })
      expect(peek, `peek at ${width}`).toBeGreaterThanOrEqual(24)
    }
  })

  test('on a 390 x 844 phone the dialog fills the screen and Next is reachable by scrolling', async ({
    page,
  }) => {
    await open(page, 390, 844)
    await sleeve(page, 1).click()
    const box = await dialog(page).boundingBox()
    expect(box?.height).toBeCloseTo(844, 0)
    expect(box?.width).toBeCloseTo(390, 0)
    const next = page.getByRole('button', { name: 'Next project' })
    await next.scrollIntoViewIfNeeded()
    const nextBox = await next.boundingBox()
    expect(nextBox && nextBox.y + nextBox.height).toBeLessThanOrEqual(844)
    await next.click()
    await expect(dialog(page).getByText('02 / 07')).toBeVisible()
  })

  test('on a short desktop window the panel scrolls and Next stays reachable', async ({ page }) => {
    await open(page, 1280, 420)
    await sleeve(page, 3).click()
    const box = await dialog(page).boundingBox()
    expect(box?.height).toBeLessThanOrEqual(420 - 64 + 1)
    const next = page.getByRole('button', { name: 'Next project' })
    await next.scrollIntoViewIfNeeded()
    await next.click()
    await expect(dialog(page).getByText('04 / 07')).toBeVisible()
  })

  test('hovering a sleeve at 1280 lifts it by 8 px', async ({ page }) => {
    await open(page, 1280)
    const target = sleeve(page, 2)
    const before = await target.evaluate((el) => getComputedStyle(el).translate)
    expect(before).not.toContain('-8px')
    await target.hover()
    await expect
      .poll(() => target.evaluate((el) => getComputedStyle(el).translate))
      .toContain('-8px')
  })
})
