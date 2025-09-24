import { expect, test } from '@playwright/test'

test.describe('Page Layout', () => {
  test('homepage displays complete layout structure', async ({ page }) => {
    await page.goto('/')

    // Check that users can see the main layout components
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByRole('navigation').first()).toBeVisible() // Use first nav (sidebar)
    await expect(page.locator('footer')).toBeVisible()
  })

  test('displays branding and search in header', async ({ page }) => {
    await page.goto('/')

    // Users should see search functionality
    await expect(page.getByText('Search...')).toBeVisible()
    await expect(page.getByText('⌘K')).toBeVisible()
  })

  test('shows API navigation in sidebar', async ({ page }) => {
    await page.goto('/')

    // Users should see the navigation sections
    await expect(page.getByText('API Namespaces')).toBeVisible()

    // Should have navigation links - check for at least one
    const nav = page.getByRole('navigation').filter({ hasText: 'API Namespaces' })
    const links = nav.locator('a')
    await expect(links.first()).toBeVisible()
  })

  test('displays contact information in footer', async ({ page }) => {
    await page.goto('/')

    // Users should see footer content
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByText('Start Building Today')).toBeVisible()
    await expect(footer.getByText('Contact Sales')).toBeVisible()
  })

  test('search functionality opens command menu', async ({ page }) => {
    await page.goto('/')

    // Click search button
    await page.getByRole('button', { name: /search/i }).click()

    // Command menu should appear - look for any modal/dialog
    await expect(
      page.locator('[role="dialog"], .cmdk-root, [data-radix-dialog-content]').first()
    ).toBeVisible({ timeout: 1000 })
  })
})
