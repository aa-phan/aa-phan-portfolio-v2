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
    const links = primaryNav(page).getByRole('link')
    await expect(links).toHaveCount(LABELS.length)
    // textContent would include the aria-hidden roll duplicate, so check accessible names.
    for (const [index, label] of LABELS.entries()) {
      await expect(links.nth(index)).toHaveAccessibleName(label)
    }
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
  test('exactly one navigation landmark at 1280 (Primary) and at 375 (Sections)', async ({
    page,
  }) => {
    await open(page)
    await expect(page.getByRole('navigation')).toHaveCount(1)

    await page.setViewportSize({ width: 375, height: 667 })
    await expect(primaryNav(page)).toHaveCount(0)
    await expect(page.getByRole('navigation')).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
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

test.describe('nav behavior', () => {
  test('clicking a link marks its target at once and the indicator never sweeps', async ({
    page,
  }) => {
    await open(page)
    // Sample which links carry aria-current on every frame until the smooth scroll ends.
    await page.evaluate(() => {
      const seen = new Set<string>()
      let sampling = true
      window.addEventListener('scrollend', () => (sampling = false), { once: true })
      const tick = () => {
        const current = document.querySelector('nav[aria-label="Primary"] [aria-current]')
        seen.add(current?.getAttribute('href') ?? 'none')
        if (sampling) requestAnimationFrame(tick)
      }
      tick()
      Object.assign(window, { seenCurrent: seen, stopSampling: () => (sampling = false) })
    })

    const link = primaryNav(page).getByRole('link', { name: 'Education' })
    await link.click()
    await expect(link).toHaveAttribute('aria-current', 'location')
    await expect(page).toHaveURL(/#education$/)
    // Settle: the heading stops moving.
    await expect
      .poll(async () => {
        const first = await page
          .locator('#education-heading')
          .evaluate((h) => h.getBoundingClientRect().top)
        await page.waitForTimeout(150)
        const second = await page
          .locator('#education-heading')
          .evaluate((h) => h.getBoundingClientRect().top)
        return first === second
      })
      .toBe(true)

    const top = await page
      .locator('#education-heading')
      .evaluate((h) => h.getBoundingClientRect().top)
    expect(top).toBeGreaterThanOrEqual(64)

    const seen = await page.evaluate(() => {
      ;(window as unknown as { stopSampling: () => void }).stopSampling()
      return [...(window as unknown as { seenCurrent: Set<string> }).seenCurrent]
    })
    // Only the page top (no link current) and the target may ever have been marked.
    for (const entry of seen) expect(['none', '#education']).toContain(entry)
  })

  test('every section anchor clears the 64 px nav at 1280 and has no offset at 375', async ({
    page,
  }) => {
    await open(page)
    const margin = () =>
      page.locator('section#projects').evaluate((el) => getComputedStyle(el).scrollMarginTop)
    expect(await margin()).toBe('64px')
    await page.setViewportSize({ width: 375, height: 667 })
    expect(await margin()).toBe('0px')
  })

  test('a deep link to a section lands on it after React renders', async ({ page }) => {
    await open(page, './#projects')
    await expect(page.locator('#projects-heading')).toBeInViewport()
  })

  test('any other hash is ignored', async ({ page }) => {
    await open(page, './#not-a-section')
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('with the motion chunk blocked the indicator still sits under the active link', async ({
    page,
  }) => {
    const initial = await initialScripts(page)
    expect(initial.size).toBeGreaterThan(0)
    await page.route('**/*.js', (route) => {
      const path = new URL(route.request().url()).pathname
      return initial.has(path) ? route.continue() : route.abort()
    })
    await open(page)
    await jumpTo(page, '#projects')
    const link = primaryNav(page).getByRole('link', { name: 'Projects' })
    await expect(link).toHaveAttribute('aria-current', 'location')
    await expect(link.locator('[data-part="nav-indicator"]')).toHaveCount(1)
    await expect(primaryNav(page).locator('[data-part="nav-indicator"]')).toHaveCount(1)
  })

  test('the indicator is 2 px tall, 4 px under the label and as wide as the label', async ({
    page,
  }) => {
    await open(page)
    await jumpTo(page, '#projects')
    const link = primaryNav(page).getByRole('link', { name: 'Projects' })
    const bar = link.locator('[data-part="nav-indicator"]')
    await expect(bar).toHaveCount(1)
    const label = await link.locator('.nav-roll').boundingBox()
    const box = await bar.boundingBox()
    expect(box!.height).toBe(2)
    expect(Math.abs(box!.y - (label!.y + label!.height + 4))).toBeLessThanOrEqual(1)
    expect(Math.abs(box!.width - label!.width)).toBeLessThanOrEqual(1)
  })

  test('the indicator slides between links once the motion chunk is in', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'no-preference',
    })
    const page = await context.newPage()
    await open(page)
    await page.waitForLoadState('networkidle')
    // Let the idle warm-up and the feature chunk settle before the first move.
    await page.waitForTimeout(500)
    await jumpTo(page, '#projects')
    const bar = primaryNav(page).locator('[data-part="nav-indicator"]')
    await expect(bar).toHaveCount(1)
    const startX = (await bar.boundingBox())!.x

    const xs = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const samples: number[] = []
          const read = () =>
            document
              .querySelector('nav[aria-label="Primary"] [data-part="nav-indicator"]')
              ?.getBoundingClientRect().x ?? NaN
          document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant' })
          let frames = 0
          const tick = () => {
            samples.push(read())
            if (frames++ < 40) requestAnimationFrame(tick)
            else resolve(samples)
          }
          requestAnimationFrame(tick)
        }),
    )
    const endX = xs.at(-1)!
    expect(endX).toBeGreaterThan(startX)
    expect(xs.some((x) => x > startX + 1 && x < endX - 1)).toBe(true)
    await context.close()
  })

  test('under reduced motion the indicator jumps and the roll becomes an underline', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await open(page)
    await jumpTo(page, '#projects')
    const bar = primaryNav(page).locator('[data-part="nav-indicator"]')
    await expect(bar).toHaveCount(1)
    const startX = (await bar.boundingBox())!.x
    const xs = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const samples: number[] = []
          const read = () =>
            document
              .querySelector('nav[aria-label="Primary"] [data-part="nav-indicator"]')
              ?.getBoundingClientRect().x ?? NaN
          document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant' })
          let frames = 0
          const tick = () => {
            samples.push(read())
            if (frames++ < 30) requestAnimationFrame(tick)
            else resolve(samples)
          }
          requestAnimationFrame(tick)
        }),
    )
    const endX = xs.at(-1)!
    expect(endX).toBeGreaterThan(startX)
    // Every sample is either still at the old link, missing mid-swap, or at the new one.
    expect(xs.every((x) => Number.isNaN(x) || x === startX || x === endX)).toBe(true)

    const link = primaryNav(page).getByRole('link', { name: 'Experience' })
    await link.hover()
    const hovered = await link.evaluate((a) => ({
      dup: getComputedStyle(a.querySelector('.nav-roll-b')!).transform,
      underline: getComputedStyle(a.querySelector('.nav-roll-a')!).textDecorationLine,
    }))
    expect(hovered.dup).toBe('none')
    expect(hovered.underline).toBe('underline')
    await context.close()
  })
})

test.describe('nav label roll', () => {
  const duplicate = (page: Page) =>
    primaryNav(page)
      .getByRole('link', { name: 'Experience' })
      .evaluate((a) => getComputedStyle(a.querySelector('.nav-roll-b')!).transform)

  test('hovering a label rolls its duplicate into place and the name stays single', async ({
    page,
  }) => {
    await open(page)
    const link = primaryNav(page).getByRole('link', { name: 'Experience', exact: true })
    expect(await duplicate(page)).toBe('none')
    await link.hover()
    await expect.poll(() => duplicate(page)).not.toBe('none')
    await expect(link.locator('.nav-roll-b')).toHaveAttribute('aria-hidden', 'true')
    await expect(primaryNav(page).getByRole('link', { name: 'Experience Experience' })).toHaveCount(
      0,
    )
  })

  test('keyboard focus rolls the label too', async ({ page }) => {
    await open(page)
    await page.keyboard.press('Tab') // skip link
    await page.keyboard.press('Tab') // home
    await page.keyboard.press('Tab') // Experience
    await expect(primaryNav(page).getByRole('link', { name: 'Experience' })).toBeFocused()
    await expect.poll(() => duplicate(page)).not.toBe('none')
  })
})

test.describe('desktop nav fit', () => {
  for (const width of [768, 1024]) {
    test(`no horizontal overflow of the header at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await open(page)
      const fit = await page.evaluate(() => {
        const header = document.querySelector('header')!
        const bar = header.querySelector(':scope > div')!
        return {
          header: [header.scrollWidth, header.clientWidth],
          bar: [bar.scrollWidth, bar.clientWidth],
          page: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
        }
      })
      expect(fit.header[0]).toBeLessThanOrEqual(fit.header[1])
      expect(fit.bar[0]).toBeLessThanOrEqual(fit.bar[1])
      expect(fit.page[0]).toBeLessThanOrEqual(fit.page[1])
      await expect(primaryNav(page).getByRole('link')).toHaveCount(6)
    })
  }
})
