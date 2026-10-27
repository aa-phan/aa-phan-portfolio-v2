import { expect, test, type Locator, type Page } from '@playwright/test'

// The automated half of the 10-second test (NAV-04): on a 375 x 667 phone a recruiter sees the
// name, the role, Download resume and Copy email without scrolling, and reaches Experience,
// Projects, Resume and contact in one action each. The timed human run happens on staging.
const VIEWPORT = { width: 375, height: 667 }
const ROLE = 'Software engineer building cloud-native backends in Go.'
const ADDRESS = 'aaron.phan240@gmail.com'

test.use({ viewport: VIEWPORT })

const pill = (page: Page) => page.getByRole('navigation', { name: 'Sections' })
const hero = (page: Page) => page.locator('#hero')

function heroItems(page: Page): Record<string, Locator> {
  return {
    name: page.getByRole('heading', { level: 1, name: 'Aaron Phan' }),
    role: hero(page).getByText(ROLE),
    resume: hero(page).getByRole('link', { name: 'Download resume' }),
    email: hero(page).getByRole('link', { name: 'Copy email' }),
  }
}

async function insideViewport(locator: Locator) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(VIEWPORT.width)
  expect(box.y + box.height).toBeLessThanOrEqual(VIEWPORT.height)
}

test.describe('ten-second: first viewport', () => {
  test('the name, role, both CTAs and two pill segments are on screen and uncovered', async ({
    page,
  }) => {
    await page.goto('./')
    await page.evaluate(() => document.fonts.ready)
    await expect(pill(page)).toBeVisible()

    const items = heroItems(page)
    const pillBox = await pill(page).boundingBox()
    expect(pillBox).not.toBeNull()

    for (const [label, item] of Object.entries(items)) {
      await insideViewport(item)
      const box = await item.boundingBox()
      expect(
        box && pillBox ? box.y + box.height : Infinity,
        `${label} ends above the pill`,
      ).toBeLessThan(pillBox?.y ?? 0)
      // Nothing sits on top of the item's center: the hit target is the item or a descendant.
      const covered = await item.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
        return !hit || !(hit === el || el.contains(hit))
      })
      expect(covered, `${label} is covered`).toBe(false)
    }

    await insideViewport(pill(page).getByRole('link', { name: 'Experience' }))
    await insideViewport(pill(page).getByRole('link', { name: 'Projects' }))
  })
})

test.describe('ten-second: one action each', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('Experience, Projects, Resume and contact are each one tap away', async ({ page }) => {
    await page.goto('./')
    await expect(pill(page)).toBeVisible()

    await pill(page).getByRole('link', { name: 'Experience' }).click()
    await expect(page.locator('#experience-heading')).toBeInViewport()

    await pill(page).getByRole('link', { name: 'Projects' }).click()
    await expect(page.locator('#projects-heading')).toBeInViewport()

    const href = await heroItems(page).resume.getAttribute('href')
    expect(href).not.toBeNull()
    const response = await page.request.get(href ?? '')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
    expect((await response.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-')

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await heroItems(page).email.click()
    await expect(page.getByRole('status')).toHaveText('Email copied to clipboard')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS)

    // Information only: the Contact Me section is two taps away (Menu, then Contact Me).
    test.info().annotations.push({
      type: 'info',
      description: 'Contact Me is two taps away through Menu; Copy email is one.',
    })
  })
})

test.describe('ten-second: without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the static shell still shows the name, role, Download resume and a mailto Copy email', async ({
    page,
  }) => {
    await page.goto('./')
    const items = heroItems(page)
    for (const item of Object.values(items)) {
      await expect(item).toBeVisible()
      await insideViewport(item)
    }
    await expect(items.email).toHaveAttribute('href', `mailto:${ADDRESS}`)
    await expect(items.resume).toHaveAttribute('download', '')
  })
})
