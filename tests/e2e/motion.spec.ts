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
    button.click()
    return new Promise<string>((resolve) => {
      // Read two frames (about 33 ms) after the click. A spring cannot have arrived by then;
      // a snapped value has.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => resolve(getComputedStyle(thumb).transform)),
      )
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

  const first = await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('button[aria-pressed]')
    const thumb = document.querySelector<HTMLElement>('[data-part="theme-thumb"]')
    if (!button || !thumb) throw new Error('toggle not found')
    button.click()
    return getComputedStyle(thumb).transform
  })
  expect(first).not.toBe(END_MATRIX)

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
