import { expect, test } from '@playwright/test'

const ADDRESS = 'aaron.phan240@gmail.com'

test.describe('copy email', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('copy email: click copies the address and announces and shows the toast', async ({
    page,
  }) => {
    await page.goto('./')
    const url = page.url()

    await page.locator('#hero').getByRole('link', { name: 'Copy email' }).click()

    await expect(page.getByRole('status')).toHaveText('Email copied to clipboard')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS)

    const toast = page.locator('[aria-hidden="true"]', { hasText: 'Email copied to clipboard' })
    await expect(toast).toBeVisible()
    await expect(toast).toBeHidden({ timeout: 6000 })
    expect(page.url()).toBe(url)
  })
})

test.describe('copy email without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('copy email: JS disabled keeps a working mailto link', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('#hero').getByRole('link', { name: 'Copy email' })).toHaveAttribute(
      'href',
      `mailto:${ADDRESS}`,
    )
  })
})
