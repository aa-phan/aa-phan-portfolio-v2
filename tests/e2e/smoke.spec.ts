import { expect, test } from '@playwright/test'

const EMAIL = 'mailto:aaron.phan240@gmail.com'
const ROLE = 'Software engineer building cloud-native backends in Go.'
const BASE = process.env.VITE_BASE || '/'

test.describe('JS disabled', () => {
  test.use({ javaScriptEnabled: false })

  test('JS disabled: hero name, role and CTAs are visible from static HTML', async ({ page }) => {
    await page.goto('./')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1, name: 'Aaron Phan' })).toBeVisible()
    await expect(page.getByText(ROLE)).toBeVisible()

    const links = page.locator('#hero a')
    await expect(links).toHaveText(['Download resume', 'Copy email', 'Contact'])

    const resume = page.getByRole('link', { name: 'Download resume' })
    const email = page.getByRole('link', { name: 'Copy email' })
    const contact = page.getByRole('link', { name: 'Contact' })
    await expect(resume).toBeVisible()
    await expect(email).toBeVisible()
    await expect(contact).toBeVisible()

    const resumeHref = await resume.getAttribute('href')
    expect(resumeHref).toMatch(/resume\.pdf$/)
    expect(resumeHref!.startsWith(BASE)).toBe(true)
    await expect(resume).toHaveAttribute('download', '')
    await expect(email).toHaveAttribute('href', EMAIL)
    await expect(contact).toHaveAttribute('href', '#contact')

    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('oklch(0.9889 0.0039 286.33)')
  })
})

test('hero: React mount keeps name, role and CTAs', async ({ page }) => {
  const errors: Error[] = []
  page.on('pageerror', (e) => errors.push(e))

  await page.goto('./')
  await page.waitForLoadState('networkidle')

  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1, name: 'Aaron Phan' })).toBeVisible()
  await expect(page.getByText(ROLE)).toBeVisible()
  await expect(page.locator('#hero a')).toHaveText(['Download resume', 'Copy email', 'Contact'])

  const resume = page.getByRole('link', { name: 'Download resume' })
  const resumeHref = await resume.getAttribute('href')
  expect(resumeHref).toMatch(/resume\.pdf$/)
  expect(resumeHref!.startsWith(BASE)).toBe(true)
  await expect(page.getByRole('link', { name: 'Copy email' })).toHaveAttribute('href', EMAIL)
  await expect(page.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')

  expect(errors).toEqual([])
})
