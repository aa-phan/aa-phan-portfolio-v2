import { expect, test } from '@playwright/test'

const END_MATRIX = 'matrix(1, 0, 0, 1, 20, 0)'

test('reduced motion: theme thumb snaps to its target', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('./')

  const toggle = page.getByRole('button', { name: 'Dark theme' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')

  const transform = await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('button[aria-pressed]')
    const thumb = document.querySelector<HTMLElement>('[data-part="theme-thumb"]')
    if (!button || !thumb) throw new Error('toggle not found')
    const start = getComputedStyle(thumb).transform
    button.click()
    return new Promise<string>((resolve) => {
      // Resolve with the first frame whose transform differs from the start. A snapped thumb
      // jumps straight to its target; a spring would show an in-between value first. Waiting
      // for the first change (up to 120 frames) keeps this independent of how slowly a loaded
      // runner commits the state update.
      let frames = 0
      const tick = () => {
        const current = getComputedStyle(thumb).transform
        if (current !== start || frames++ > 120) resolve(current)
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  })
  expect(transform).toBe(END_MATRIX)
  await context.close()
})

test('motion: theme thumb animates with no preference', async ({ browser }) => {
  const context = await browser.newContext({
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  await page.goto('./')
  await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )

  // Sample the thumb's x translation on every frame after the click. A spring passes through
  // values strictly between its start and end; an instant snap (animation stuck off) never does.
  const travel = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const button = document.querySelector<HTMLButtonElement>('button[aria-pressed]')
        const thumb = document.querySelector<HTMLElement>('[data-part="theme-thumb"]')
        if (!button || !thumb) throw new Error('toggle not found')
        button.click()
        const xs: number[] = []
        const tick = () => {
          xs.push(new DOMMatrix(getComputedStyle(thumb).transform).m41)
          if (xs.length < 40) requestAnimationFrame(tick)
          else resolve(xs)
        }
        requestAnimationFrame(tick)
      }),
  )
  expect(travel.some((x) => x > 0.5 && x < 19.5)).toBe(true)

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const thumb = document.querySelector<HTMLElement>('[data-part="theme-thumb"]')
          return thumb ? getComputedStyle(thumb).transform : ''
        }),
      { timeout: 2000 },
    )
    .toBe(END_MATRIX)
  await context.close()
})

const ROLE_SENTENCE = 'Software engineer building cloud-native backends in Go.'

/** Pathnames of the module script and modulepreloads that dist/index.html references. */
async function initialScriptPaths(
  request: import('@playwright/test').APIRequestContext,
  baseURL: string,
): Promise<Set<string>> {
  const html = await (await request.get(baseURL)).text()
  const paths = new Set<string>()
  for (const tag of html.match(/<(?:script|link)\b[^>]*>/g) ?? []) {
    const isModule = /<script\b[^>]*type="module"/.test(tag)
    const isPreload = /<link\b[^>]*rel="modulepreload"/.test(tag)
    if (!isModule && !isPreload) continue
    const ref = /(?:src|href)="([^"]+)"/.exec(tag)?.[1]
    if (ref) paths.add(new URL(ref, baseURL).pathname)
  }
  return paths
}

test('reduced motion: role line is static text with no per-word spans', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' })
  const page = await context.newPage()
  const allowed = await initialScriptPaths(page.request, baseURL!)
  expect(allowed.size).toBeGreaterThan(0)
  const scripts: string[] = []
  page.on('request', (req) => {
    const { pathname } = new URL(req.url())
    if (pathname.endsWith('.js')) scripts.push(pathname)
  })

  await page.goto('./')
  await page.waitForLoadState('networkidle')
  // Give a lazy chunk, had one been requested, time to arrive and replace the paragraph.
  await page.waitForTimeout(500)

  const role = page.locator('#hero p')
  await expect(role).toBeVisible()
  await expect(role).toHaveText(ROLE_SENTENCE)
  await expect(page.locator('#hero p span')).toHaveCount(0)
  expect(scripts.filter((p) => !allowed.has(p))).toEqual([])
  await context.close()
})

test('motion: role line text effect runs and name and CTAs never animate', async ({ browser }) => {
  const context = await browser.newContext({
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()

  const steady = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('#hero h1, #hero a')).map((el) => ({
        tag: el.tagName,
        opacity: getComputedStyle(el).opacity,
        animations: el.getAnimations({ subtree: true }).length,
      })),
    )

  await page.goto('./', { waitUntil: 'domcontentloaded' })
  const atFirstPaint = await steady()
  expect(atFirstPaint).toHaveLength(4)
  for (const item of atFirstPaint) {
    expect(item.opacity).toBe('1')
    expect(item.animations).toBe(0)
  }

  const role = page.locator('#hero p')
  await expect(page.locator('#hero p span').first()).toBeAttached({ timeout: 2000 })
  await expect(role).toContainText(ROLE_SENTENCE)

  const afterEffect = await steady()
  expect(afterEffect).toHaveLength(4)
  for (const item of afterEffect) {
    expect(item.opacity).toBe('1')
    expect(item.animations).toBe(0)
  }
  await context.close()
})

test('motion: role line never flashes visible, then hidden, before it is revealed', async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  // Sample the role line's opacity on every frame from the start of the document.
  await page.addInitScript(() => {
    const samples: number[] = []
    ;(window as unknown as { __roleOpacity: number[] }).__roleOpacity = samples
    const tick = () => {
      const el = document.querySelector('#hero p')
      if (el) samples.push(Number(getComputedStyle(el).opacity))
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  await page.goto('./')
  await expect(page.locator('#hero p span').first()).toBeAttached({ timeout: 2000 })
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.querySelector('#hero p')!).opacity))
    .toBe('1')
  await page.waitForTimeout(500)

  const samples = await page.evaluate(
    () => (window as unknown as { __roleOpacity: number[] }).__roleOpacity,
  )
  expect(samples.length).toBeGreaterThan(0)
  // Hidden from the first frame it exists, and never dimmer than an earlier frame afterwards.
  expect(samples[0]).toBe(0)
  for (let i = 1; i < samples.length; i++) {
    expect(samples[i], `frame ${i}`).toBeGreaterThanOrEqual(samples[i - 1]!)
  }
  expect(samples.at(-1)).toBe(1)
  await context.close()
})

test('motion: role line stays readable when the effect chunk fails to load', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  const allowed = await initialScriptPaths(page.request, baseURL!)
  expect(allowed.size).toBeGreaterThan(0)

  let aborted = 0
  await page.route('**/assets/*.js', (route) => {
    if (allowed.has(new URL(route.request().url()).pathname)) return route.continue()
    aborted += 1
    return route.abort()
  })

  await page.goto('./')
  await page.waitForTimeout(1000)

  expect(aborted).toBeGreaterThan(0)
  await expect(page.locator('#hero h1')).toBeVisible()
  await expect(page.locator('#hero p')).toHaveText(ROLE_SENTENCE)
  await expect(page.locator('#hero p')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dark theme' })).toBeVisible()
  await context.close()
})

test('reduced motion: every hero element and section heading is visible with no running animations', async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('./')
  await page.waitForLoadState('networkidle')

  const content = [
    page.locator('#hero h1'),
    page.locator('#hero p'),
    page.getByRole('link', { name: 'Download resume' }),
    page.getByRole('link', { name: 'Copy email' }),
    page.getByRole('link', { name: 'Contact', exact: true }),
    ...['experience', 'projects', 'about', 'skills', 'education', 'contact'].map((id) =>
      page.locator(`#${id} h2`),
    ),
  ]

  async function expectAllVisibleAndStill() {
    for (const locator of content) {
      await expect(locator).toBeVisible()
      const opacity = await locator.evaluate((el) => getComputedStyle(el).opacity)
      expect(opacity).toBe('1')
    }
    // The reduced-motion CSS guard shortens a theme change's color transitions to 0.01 ms, which
    // still exist for a single frame; they must be gone almost at once, and nothing else runs.
    await expect
      .poll(() => page.evaluate(() => document.getAnimations().length), { timeout: 1000 })
      .toBe(0)
  }

  await expectAllVisibleAndStill()
  await page.getByRole('button', { name: 'Dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expectAllVisibleAndStill()
  await context.close()
})
