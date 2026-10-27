// QA loop extra frames (D-24, D-25).
//
// shoot.mjs crawls the home page and the 404 but cannot open the project dialog or
// force the dark theme. This script adds those frames to .shots/extra/:
//   d-dialog-{light,dark}.png  open project dialog at 1440 x 900
//   m-dialog-{light,dark}.png  open project dialog at 390 x 844 (touch, 3x)
//   d-hero-dark, d-projects-dark, d-footer-dark and the m- equivalents (dark theme only)
//
// Usage: node scripts/qa-extra-shots.mjs [BASE_URL]   (default http://127.0.0.1:4400/)
// Exit: 0 all frames written, 1 the dialog never opened or a frame failed.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const base = (process.argv[2] || 'http://127.0.0.1:4400/').replace(/\/?$/, '/')
const outDir = path.resolve('.shots/extra')
fs.mkdirSync(outDir, { recursive: true })

const DIALOG_BUTTON = 'RecipeCart, project 1 of 7'
const VIEWPORTS = [
  { prefix: 'd', options: { viewport: { width: 1440, height: 900 } } },
  {
    prefix: 'm',
    options: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    },
  },
]
const THEMES = ['light', 'dark']

const browser = await chromium.launch()
let failed = false

async function frame(page, name) {
  const file = path.join(outDir, `${name}.png`)
  await page.screenshot({ path: file })
  console.log(`wrote ${path.relative(process.cwd(), file)}`)
}

async function shootSection(page, prefix, name, selector) {
  const target = page.locator(selector).first()
  await target.scrollIntoViewIfNeeded()
  await target.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await page.waitForTimeout(600)
  await frame(page, `${prefix}-${name}-dark`)
}

for (const theme of THEMES) {
  for (const { prefix, options } of VIEWPORTS) {
    const context = await browser.newContext(options)
    await context.addInitScript((value) => {
      try {
        localStorage.setItem('theme', value)
      } catch {
        // storage unavailable: the page falls back to the system scheme
      }
    }, theme)
    const page = await context.newPage()
    try {
      await page.goto(base, { waitUntil: 'load' })
      await page.evaluate('document.fonts.ready')
      const applied = await page.evaluate("document.documentElement.getAttribute('data-theme')")
      console.log(`${prefix} ${theme}: data-theme=${applied}`)

      if (theme === 'dark') {
        await shootSection(page, prefix, 'hero', '#hero')
        await shootSection(page, prefix, 'projects', '#projects')
        await shootSection(page, prefix, 'footer', 'footer')
        await page.evaluate('window.scrollTo(0, 0)')
        await page.waitForTimeout(300)
      }

      const button = page.getByRole('button', { name: DIALOG_BUTTON })
      await button.scrollIntoViewIfNeeded()
      await button.click()
      await page.waitForSelector('dialog[open]', { timeout: 8000 })
      await page.waitForTimeout(900)
      await frame(page, `${prefix}-dialog-${theme}`)
    } catch (error) {
      failed = true
      console.error(`FAIL ${prefix} ${theme}: ${error instanceof Error ? error.message : error}`)
    } finally {
      await context.close()
    }
  }
}

await browser.close()
process.exit(failed ? 1 : 0)
