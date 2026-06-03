import { test, expect } from '@playwright/test';

test.describe('SmartBiz AI - E2E Integration User Flows', () => {
  
  test('should load landing page and navigate to login form', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('http://localhost:3000');
    
    // Check main branding header
    const branding = page.locator('header');
    await expect(branding).toBeVisible();
    await expect(page).toHaveTitle(/SmartBiz AI/);

    // 2. Click entry trigger to open Login
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/.*login/);
    
    // 3. Form input presence checks
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display error message on wrong credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Type incorrect values
    await page.fill('input[type="email"]', 'wrongowner@tokomakmur.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    
    // Submit form
    await page.click('button[type="submit"]');

    // Expect alert warnings
    const alert = page.locator('div:has-text("Email atau password salah")');
    await expect(alert).toBeVisible();
  });
});
