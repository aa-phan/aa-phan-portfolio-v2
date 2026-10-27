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
})
