import { expect, test, type Page } from '@playwright/test'

const pill = (page: Page) => page.getByRole('navigation', { name: 'Sections' })
const menuButton = (page: Page) => pill(page).getByRole('button', { name: 'Menu', exact: true })
const panelLinks = (page: Page) => page.locator('#pill-panel ul a')
const heading = (page: Page, id: string) => page.locator(`#${id}-heading`)

/** The URL paths of the JS files that index.html itself loads (entry script and preloads). */
async function initialScripts(page: Page): Promise<Set<string>> {
  const response = await page.request.get('./')
  const html = await response.text()
  const hrefs = [
    ...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g),
    ...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*\shref="([^"]+)"/g),
  ].map((match) => match[1])
  return new Set(hrefs.map((href) => new URL(href, response.url()).pathname))
}

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

test.describe('pill morph', () => {
  test('with motion allowed the container grows through in-between widths while it opens', async ({
    page,
  }) => {
    await open(page)
    await page.waitForLoadState('networkidle')
    // The feature chunk may still be arriving on a slow runner, so retry until a spring shows.
    await expect
      .poll(
        async () => {
          await page.evaluate(() => {
            const nav = document.querySelector('nav[aria-label="Sections"]')
            const widths = new Set<number>()
            let sampling = true
            const tick = () => {
              if (nav) widths.add(Math.round(nav.getBoundingClientRect().width))
              if (sampling) requestAnimationFrame(tick)
            }
            tick()
            Object.assign(window, {
              pillWidths: widths,
              stopPillSampling: () => (sampling = false),
            })
          })
          await menuButton(page).click()
          await expect(page.locator('#pill-panel')).toBeVisible()
          await page.waitForTimeout(900)
          const widths = await page.evaluate(() => {
            const w = window as unknown as { pillWidths: Set<number>; stopPillSampling(): void }
            w.stopPillSampling()
            return w.pillWidths.size
          })
          await page.getByRole('button', { name: 'Close menu' }).click()
          await expect(page.locator('#pill-panel')).toHaveCount(0)
          return widths
        },
        { timeout: 15000 },
      )
      .toBeGreaterThan(2)
  })

  test('with the motion chunk blocked Menu still opens and closes with no page error', async ({
    page,
  }) => {
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    const initial = await initialScripts(page)
    expect(initial.size).toBeGreaterThan(0)
    await page.route('**/*.js', (route) => {
      const path = new URL(route.request().url()).pathname
      return initial.has(path) ? route.continue() : route.abort()
    })
    await open(page)
    await openMenu(page)
    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(page.locator('#pill-panel')).toHaveCount(0)
    await expect(menuButton(page)).toBeFocused()
    await menuButton(page).click()
    await expect(page.locator('#pill-panel')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#pill-panel')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('on a short phone the open panel scrolls and Resume stays reachable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await open(page)
    await openMenu(page)
    const nav = pill(page)
    const box = await nav.boundingBox()
    expect(box?.height).toBeLessThanOrEqual(667 * 0.8 + 1)
    expect(await nav.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    await nav.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }))
    const resume = page.locator('#pill-panel').getByRole('link', { name: 'Resume' })
    await expect(resume).toBeInViewport()
    // A download link is fetched as a download, not as a page request.
    const [download] = await Promise.all([page.waitForEvent('download'), resume.click()])
    expect(download.url()).toMatch(/resume\.pdf$/)
  })
})

test.describe('pill under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the panel is fully visible at once and nothing is animating', async ({ page }) => {
    await open(page)
    await menuButton(page).click()
    await expect(page.locator('#pill-panel')).toBeVisible()
    // The base guard turns every change into a 0.01 ms transition, which is over within a frame.
    await page.waitForTimeout(100)
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    )
    expect(running).toBe(0)
    // The box is its final size at once: nothing is mid-morph.
    const box = await pill(page).boundingBox()
    expect(box?.width).toBe(360)
    await expect(pill(page)).toHaveCSS('opacity', '1')
    await expect(pill(page).locator('xpath=./div')).toHaveCSS('opacity', '1')
  })
})
