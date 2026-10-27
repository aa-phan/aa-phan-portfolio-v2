import { expect, test } from '@playwright/test'

const EMAIL = 'mailto:aaron.phan240@gmail.com'
const ROLE = 'Software engineer building cloud-native backends in Go.'
const FACTS = ['Graduating December 2026, UT Austin ECE', 'Last role: Capital One, summer 2026']
const BASE = process.env.VITE_BASE || '/'

test.describe('JS disabled', () => {
  test.use({ javaScriptEnabled: false })

  test('JS disabled: hero name, role and CTAs are visible from static HTML', async ({ page }) => {
    await page.goto('./')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1, name: 'Aaron Phan' })).toBeVisible()
    await expect(page.getByText(ROLE)).toBeVisible()
    for (const fact of FACTS) await expect(page.getByText(fact)).toBeVisible()

    const links = page.locator('#hero a')
    await expect(links).toHaveText(['Download resume', 'Copy email'])

    const resume = page.getByRole('link', { name: 'Download resume' })
    const email = page.getByRole('link', { name: 'Copy email' })
    await expect(resume).toBeVisible()
    await expect(email).toBeVisible()

    const resumeHref = await resume.getAttribute('href')
    expect(resumeHref).toMatch(/resume\.pdf$/)
    expect(resumeHref!.startsWith(BASE)).toBe(true)
    await expect(resume).toHaveAttribute('download', '')
    await expect(email).toHaveAttribute('href', EMAIL)

    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('oklch(0.9696 0.003 290)')
  })

  test('JS disabled: all seven section anchors exist with headings', async ({ page }) => {
    await page.goto('./')

    const ids = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.id))
    expect(ids).toEqual([
      'hero',
      'experience',
      'projects',
      'about',
      'skills',
      'education',
      'contact',
    ])

    const titles: Record<string, string> = {
      experience: 'Experience',
      projects: 'Projects',
      about: 'About Me',
      skills: 'Skills',
      education: 'Education',
      contact: 'Contact Me',
    }
    for (const [id, title] of Object.entries(titles)) {
      const section = page.locator(`section#${id}`)
      await expect(section).toHaveAttribute('aria-labelledby', `${id}-heading`)
      await expect(section.locator('h2')).toHaveCount(1)
      await expect(section.locator('h2')).toHaveAttribute('id', `${id}-heading`)
      await expect(section.locator('h2')).toHaveText(title)
    }
    await expect(page.locator('section#hero')).toHaveAttribute('aria-labelledby', 'hero-heading')
    await expect(page.locator('nav')).toHaveCount(0)
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
  await expect(page.locator('#hero a')).toHaveText(['Download resume', 'Copy email'])
  for (const fact of FACTS) await expect(page.getByText(fact)).toBeVisible()

  const resume = page.getByRole('link', { name: 'Download resume' })
  const resumeHref = await resume.getAttribute('href')
  expect(resumeHref).toMatch(/resume\.pdf$/)
  expect(resumeHref!.startsWith(BASE)).toBe(true)
  await expect(page.getByRole('link', { name: 'Copy email' })).toHaveAttribute('href', EMAIL)

  expect(errors).toEqual([])
})

test('hero: CTA targets are at least 44px and resolve', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('./')
  await page.waitForLoadState('networkidle')

  const links = page.locator('#hero a')
  await expect(links).toHaveCount(2)
  for (const link of await links.all()) {
    const box = await link.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.width).toBeGreaterThanOrEqual(44)
  }

  const resumeHref = await page.getByRole('link', { name: 'Download resume' }).getAttribute('href')
  const resume = await page.request.get(resumeHref!)
  expect(resume.status()).toBe(200)
  expect(resume.headers()['content-type']).toContain('application/pdf')
  expect((await resume.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-')

  const iconHref = await page.locator('link[rel="icon"]').getAttribute('href')
  expect(iconHref).toMatch(/favicon\.svg$/)
  expect(iconHref!.startsWith(BASE)).toBe(true)
  const icon = await page.request.get(iconHref!)
  expect(icon.status()).toBe(200)
})

test('fonts: only same-origin requests and at most 2 font families', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const requested: string[] = []
  page.on('request', (req) => {
    if (!req.url().startsWith('data:')) requested.push(req.url())
  })

  await page.goto('./')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')

  expect(requested.length).toBeGreaterThan(0)
  for (const url of requested) {
    expect(new URL(url).origin, url).toBe(origin)
  }

  const families = await page.evaluate(() =>
    [...document.fonts].map((f) => f.family.replace(/^["']|["']$/g, '')),
  )
  const unique = [...new Set(families)]
  expect(unique.length).toBeLessThanOrEqual(2)
  expect(unique).toContain('Archivo Variable')

  const h1Family = await page.evaluate(
    () => getComputedStyle(document.querySelector('h1')!).fontFamily,
  )
  expect(h1Family.replace(/["']/g, '')).toMatch(/^Archivo Variable/)
})
