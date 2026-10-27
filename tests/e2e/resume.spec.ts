import { expect, test, type Locator, type Page } from '@playwright/test'

const BASE = process.env.VITE_BASE || '/'

/** The stand-in file was 594 bytes; the real export is far larger. */
const STAND_IN_BYTES = 594

async function expectResumeLink(link: Locator) {
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('download', '')
  const href = await link.getAttribute('href')
  expect(href).not.toBeNull()
  expect(href!.endsWith('resume.pdf')).toBe(true)
  expect(href!.startsWith(BASE)).toBe(true)
  return href!
}

async function expectPdfServed(page: Page, href: string) {
  const response = await page.request.get(href)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  const body = await response.body()
  expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  expect(body.length).toBeGreaterThan(STAND_IN_BYTES)
}

test.describe('resume', () => {
  test.describe('desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('the hero, nav and contact Resume links download the served PDF', async ({ page }) => {
      await page.goto('./')

      const hero = page.locator('#hero').getByRole('link', { name: 'Download resume' })
      const nav = page.locator('header').getByRole('link', { name: 'Resume', exact: true })
      const contact = page.locator('#contact').getByRole('link', { name: 'Resume', exact: true })

      const hrefs = [
        await expectResumeLink(hero),
        await expectResumeLink(nav),
        await expectResumeLink(contact),
      ]
      expect(new Set(hrefs).size).toBe(1)
      await expectPdfServed(page, hrefs[0])
    })
  })

  test.describe('phone', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('the pill panel Resume link downloads the served PDF', async ({ page }) => {
      await page.goto('./')

      const pill = page.getByRole('navigation', { name: 'Sections' })
      await pill.getByRole('button', { name: 'Menu', exact: true }).click()
      const panel = page.locator('#pill-panel')
      await expect(panel).toBeVisible()

      const href = await expectResumeLink(panel.getByRole('link', { name: 'Resume', exact: true }))
      await expectPdfServed(page, href)
    })
  })
})
