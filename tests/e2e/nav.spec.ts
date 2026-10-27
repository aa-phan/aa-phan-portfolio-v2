import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LABELS = ['Experience', 'Projects', 'About', 'Skills', 'Education', 'Contact']

test.use({ viewport: { width: 1280, height: 800 } })

const primaryNav = (page: Page) => page.getByRole('navigation', { name: 'Primary' })

/** Jump to a position at once; the page's CSS smooth scrolling would otherwise animate it. */
const jumpTo = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))

async function open(page: Page, url = './') {
  await page.goto(url)
  await expect(primaryNav(page)).toBeVisible()
}

test.describe('nav', () => {
  test('the Primary nav shows the six section links in order', async ({ page }) => {
    await open(page)
    await expect(primaryNav(page).getByRole('link')).toHaveText(LABELS)
    await expect(page.getByRole('link', { name: 'Aaron Phan, home' })).toHaveAttribute(
      'href',
      '#hero',
    )
    await expect(page.getByRole('link', { name: 'Resume', exact: true })).toHaveAttribute(
      'download',
      '',
    )
  })

  test('the bar is sticky: it stays at the top of the viewport after scrolling', async ({
    page,
  }) => {
    await open(page)
    await jumpTo(page, '#education')
    const box = await page.locator('header').boundingBox()
    expect(box?.y).toBe(0)
    expect(box?.height).toBe(64)
  })

  test('the link of the section in view carries aria-current and no other link does', async ({
    page,
  }) => {
    await open(page)
    await jumpTo(page, '#projects')
    const nav = primaryNav(page)
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    await expect(nav.locator('[aria-current]')).toHaveCount(1)
  })

  test('at the bottom of the page Contact is current', async ({ page }) => {
    await open(page)
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    )
    const nav = primaryNav(page)
    await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    await expect(nav.locator('[aria-current]')).toHaveCount(1)
  })

  test('the theme toggle in the header still switches the theme', async ({ page }) => {
    await open(page)
    const toggle = page.locator('header').getByRole('button', { name: 'Dark theme' })
    const before = await page.locator('html').getAttribute('data-theme')
    await toggle.click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '')
  })
})

test.describe('landmarks', () => {
  test('exactly one navigation landmark at 1280 and none at 375', async ({ page }) => {
    await open(page)
    await expect(page.getByRole('navigation')).toHaveCount(1)

    await page.setViewportSize({ width: 375, height: 667 })
    await expect(primaryNav(page)).toHaveCount(0)
    await expect(page.getByRole('navigation')).toHaveCount(0)
  })
})

test.describe('skip link', () => {
  test('the first Tab stop is the skip link and Enter moves focus to main', async ({ page }) => {
    await open(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
    await expect(page.locator('main#main')).toHaveAttribute('tabindex', '-1')
  })

  test('the skip link is out of the viewport until focused', async ({ page }) => {
    await open(page)
    const skip = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skip).not.toBeInViewport()
  })
})
