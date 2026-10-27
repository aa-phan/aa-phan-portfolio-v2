import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const ADDRESS = 'aaron.phan240@gmail.com'
const SUCCESS = 'Email copied to clipboard'
const INVENTORY = readFileSync(
  path.resolve(
    import.meta.dirname,
    '../../.planning/phases/01-decisions-and-documentation/01-CONTENT-INVENTORY.md',
  ),
  'utf8',
)

/** The Value line of one CON block in the content inventory. */
function conValue(id: string): string {
  const block = INVENTORY.split(`### ${id} `)[1]?.split('### ')[0] ?? ''
  const match = block.match(/^- Value: (\S+)$/m)
  if (!match) throw new Error(`${id} has no Value line`)
  return match[1]
}

const contact = (page: Page) => page.locator('#contact')
const emailButton = (page: Page) =>
  page.getByRole('button', { name: `Copy email address ${ADDRESS}`, exact: true })

test.describe('contact', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('contact: the address button copies it and the status announces it', async ({ page }) => {
    await page.goto('./')
    const url = page.url()
    await emailButton(page).click()
    await expect(page.getByRole('status')).toHaveText(SUCCESS)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS)
    expect(page.url()).toBe(url)
  })

  test('contact: the lead line and the address button read as specified', async ({ page }) => {
    await page.goto('./')
    await expect(contact(page).getByRole('heading', { level: 2, name: 'Contact Me' })).toBeVisible()
    await expect(contact(page).getByText('The fastest way to reach me is email.')).toBeVisible()
    await expect(emailButton(page)).toBeVisible()
    await expect(emailButton(page)).toContainText('Copy email')
    await expect(emailButton(page)).toContainText(ADDRESS)
  })

  test('contact: the address stays on one line at 320 px', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 640 },
      baseURL: test.info().project.use.baseURL,
    })
    const page = await context.newPage()
    await page.goto('./')
    const metrics = await page.locator('.contact-address').evaluate((el) => {
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        height: rect.height,
        lineHeight: parseFloat(style.lineHeight),
        right: rect.right,
        scrollWidth: document.documentElement.scrollWidth,
      }
    })
    expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 1.3)
    expect(metrics.right).toBeLessThanOrEqual(320)
    expect(metrics.scrollWidth).toBeLessThanOrEqual(320)
    await context.close()
  })

  test('contact: the three profiles open in a new tab with noopener noreferrer', async ({
    page,
  }) => {
    await page.goto('./')
    const links = [
      ['GitHub (opens in a new tab)', conValue('CON-02')],
      ['LinkedIn (opens in a new tab)', conValue('CON-03')],
      ['Instagram, PHVNTM', conValue('CON-04')],
    ] as const
    for (const [name, href] of links) {
      const link = contact(page).getByRole('link', { name, exact: true })
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(link.locator('svg[aria-hidden="true"]')).toHaveCount(1)
    }
    // The Instagram name is the exact string; the new-tab note arrives as its description.
    await expect(
      contact(page).getByRole('link', { name: 'Instagram, PHVNTM' }),
    ).toHaveAccessibleDescription('(opens in a new tab)')
  })

  test('contact: Resume is a download link to the base-aware resume.pdf', async ({ page }) => {
    await page.goto('./')
    const resume = contact(page).getByRole('link', { name: 'Resume' })
    await expect(resume).toHaveAttribute('download', '')
    const base = new URL('./', page.url()).pathname
    await expect(resume).toHaveAttribute('href', `${base}resume.pdf`)
    await expect(resume.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  })

  test('contact: the footer keeps a real text line and the page has no telephone link', async ({
    page,
  }) => {
    await page.goto('./')
    const footer = page.locator('footer')
    await expect(footer.getByText('Aaron Phan. DJs as PHVNTM.')).toBeVisible()
    await expect(footer.getByText('Austin, TX')).toBeVisible()
    await expect(page.locator('[href^="tel:" i]')).toHaveCount(0)
    expect(await page.content()).not.toMatch(/href="tel:/i)
  })

  test('contact: the email button floods with ink on keyboard focus and the links thicken', async ({
    page,
  }) => {
    await page.goto('./')
    const button = emailButton(page)
    const flood = button.locator('.cta-flood')
    await expect(flood).toHaveCSS('clip-path', 'inset(100% 0px 0px)')
    await button.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await expect(flood).toHaveCSS('clip-path', 'inset(0px)')

    const github = contact(page).getByRole('link', { name: /^GitHub/ })
    await expect(github).toHaveCSS('text-decoration-thickness', '1px')
    await github.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(github).toBeFocused()
    await expect(github).toHaveCSS('text-decoration-thickness', '2px')
  })

  for (const [width, height] of [
    [375, 667],
    [768, 1024],
    [1280, 800],
    [1440, 1400],
  ] as const) {
    test(`contact: Contact and the footer fill one viewport at ${width} x ${height}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height },
        baseURL: test.info().project.use.baseURL,
      })
      const page = await context.newPage()
      await page.goto('./')
      await page.evaluate(() => document.fonts.ready)
      const heights = await page.evaluate(() => ({
        contact: document.querySelector('#contact')!.getBoundingClientRect().height,
        footer: document.querySelector('footer')!.getBoundingClientRect().height,
      }))
      expect(heights.contact + heights.footer).toBeGreaterThanOrEqual(height)
      // At the end of the page the footer ends above the phone pill reserve.
      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
      )
      const footerBottom = await page.evaluate(
        () => document.querySelector('footer')!.getBoundingClientRect().bottom,
      )
      if (width < 768) {
        expect(footerBottom).toBeLessThanOrEqual(height - 56 - 16)
      } else {
        expect(Math.round(footerBottom)).toBe(height)
      }
      await context.close()
    })
  }
})
