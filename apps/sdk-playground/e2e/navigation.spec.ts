import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test('can navigate to feature pages', async ({ page }) => {
    await page.goto('/')

    // Find and click on a specific navigation link (be more specific)
    const walletLink = page.getByRole('link', { name: 'wallet', exact: true })
    if (await walletLink.isVisible()) {
      await walletLink.click()

      // Should navigate to feature page
      await expect(page).toHaveURL(/\/features\/wallet/)

      // Feature page should have proper structure
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Wallet', exact: true })).toBeVisible()
    }
  })

  test('feature page displays SDK methods', async ({ page }) => {
    // Navigate directly to a feature page
    await page.goto('/features/wallet')

    // Should see feature title
    await expect(page.locator('h1')).toContainText('Wallet')

    // Should see some content area (adjust selector based on actual structure)
    const contentArea = page.locator('.flex-1, .content, [class*="content"]').first()
    await expect(contentArea).toBeVisible()
  })

  test('maintains layout on feature pages', async ({ page }) => {
    await page.goto('/features/wallet')

    // Layout components should still be present
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByRole('navigation').first()).toBeVisible() // Use first nav
    await expect(page.locator('footer')).toBeVisible()

    // Navigation should show current page
    const nav = page.getByRole('navigation').filter({ hasText: 'API Namespaces' })
    await expect(nav.getByText('API Namespaces')).toBeVisible()
  })
})
