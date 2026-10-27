import { expect, test, type Page } from '@playwright/test'

const pill = (page: Page) => page.getByRole('navigation', { name: 'Sections' })
const menuButton = (page: Page) => pill(page).getByRole('button', { name: 'Menu', exact: true })
const panelLinks = (page: Page) => page.locator('#pill-panel ul a')
const heading = (page: Page, id: string) => page.locator(`#${id}-heading`)

async function open(page: Page) {
  await page.goto('./')
  await expect(pill(page)).toBeVisible()
}

async function openMenu(page: Page) {
  await menuButton(page).click()
  await expect(menuButton(page)).toHaveCount(0)
  await expect(page.locator('#pill-panel')).toBeVisible()
}

test.describe('pill', () => {
  test('the pill is inside the viewport and does not move when the page scrolls', async ({
    page,
  }) => {
    await open(page)
    const before = await pill(page).boundingBox()
    const viewport = page.viewportSize()
    expect(before).not.toBeNull()
    expect(viewport).not.toBeNull()
    if (!before || !viewport) return
    expect(before.x).toBeGreaterThanOrEqual(0)
    expect(before.x + before.width).toBeLessThanOrEqual(viewport.width)
    expect(before.y + before.height).toBeLessThanOrEqual(viewport.height - 16)
    // Centered on the viewport.
    expect(Math.abs(before.x + before.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1)

    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }))
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500)
    const after = await pill(page).boundingBox()
    expect(after).toEqual(before)
  })

  test('the three segments are at least 44 px tall and 96 px wide', async ({ page }) => {
    await open(page)
    const segments = [
      pill(page).getByRole('link', { name: 'Experience' }),
      pill(page).getByRole('link', { name: 'Projects' }),
      menuButton(page),
    ]
    for (const segment of segments) {
      const box = await segment.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(96)
    }
  })

  test('tapping Experience scrolls to it and marks the segment current', async ({ page }) => {
    await open(page)
    const experience = pill(page).getByRole('link', { name: 'Experience' })
    await experience.click()
    await expect(heading(page, 'experience')).toBeInViewport()
    await expect(experience).toHaveAttribute('aria-current', 'location')
    await expect(pill(page).locator('[aria-current]')).toHaveCount(1)
  })

  test('Menu opens a panel with six sections, the theme row and Resume', async ({ page }) => {
    await open(page)
    const trigger = menuButton(page)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveAttribute('aria-controls', 'pill-panel')
    await openMenu(page)

    const panel = page.locator('#pill-panel')
    await expect(panelLinks(page)).toHaveCount(6)
    const names = ['Experience', 'Projects', 'About Me', 'Skills', 'Education', 'Contact Me']
    for (const [index, name] of names.entries()) {
      await expect(panelLinks(page).nth(index)).toHaveAccessibleName(name)
    }
    await expect(panel.getByText('Theme', { exact: true })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Dark theme' })).toBeVisible()
    const resume = panel.getByRole('link', { name: 'Resume' })
    await expect(resume).toBeVisible()
    await expect(resume).toHaveAttribute('download', '')
    await expect(panel.getByRole('button', { name: 'Close menu' })).toBeFocused()
  })

  test('tapping a section in the panel jumps to it and closes the panel', async ({ page }) => {
    await open(page)
    await openMenu(page)
    await panelLinks(page).filter({ hasText: 'Skills' }).click()
    await expect(heading(page, 'skills')).toBeInViewport()
    await expect(page.locator('#pill-panel')).toHaveCount(0)
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(page).toHaveURL(/#skills$/)
  })

  test('Escape closes the panel and returns focus to Menu', async ({ page }) => {
    await open(page)
    await openMenu(page)
    await page.keyboard.press('Escape')
    await expect(page.locator('#pill-panel')).toHaveCount(0)
    await expect(menuButton(page)).toBeFocused()
  })

  test('Close closes the panel and returns focus to Menu', async ({ page }) => {
    await open(page)
    await openMenu(page)
    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(page.locator('#pill-panel')).toHaveCount(0)
    await expect(menuButton(page)).toBeFocused()
  })

  test('tapping the scrim closes the panel', async ({ page }) => {
    await open(page)
    await openMenu(page)
    await page.mouse.click(8, 8)
    await expect(page.locator('#pill-panel')).toHaveCount(0)
  })

  test('the open panel is not modal: the page behind still scrolls and nothing is inert', async ({
    page,
  }) => {
    await open(page)
    await openMenu(page)
    await page.mouse.move(200, 200)
    await page.mouse.wheel(0, 600)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
    await expect(page.locator('[inert]')).toHaveCount(0)
    await expect(page.locator('[aria-modal]')).toHaveCount(0)
  })

  test('the theme toggle in the panel switches the theme', async ({ page }) => {
    await open(page)
    await openMenu(page)
    const before = await page.locator('html').getAttribute('data-theme')
    await page.locator('#pill-panel').getByRole('button', { name: 'Dark theme' }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '')
  })
})

test.describe('pill at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('the Sections nav is not in the accessibility tree', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    await expect(pill(page)).toHaveCount(0)
  })
})
