import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the main app to initialize
    await expect(page.locator('h1')).toContainText('FASM Programming Book');
    await page.waitForTimeout(1000); // Let scripts initialize
  });

  test('should load the main page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/FASM Programming Book/);
    
    // Check main elements are present
    await expect(page.locator('#navigation-panel')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#toc-list')).toBeVisible();
    
    // Check that content area exists
    await expect(page.locator('#content-area')).toBeVisible();
  });

  test('should display table of contents', async ({ page }) => {
    // Wait for TOC to load
    await page.waitForSelector('#toc-list li', { timeout: 10000 });
    
    // Check that TOC items exist
    const tocItems = await page.locator('#toc-list li').count();
    expect(tocItems).toBeGreaterThan(0);
    
    // Check for specific chapters
    await expect(page.locator('#toc-list')).toContainText('Preface');
    await expect(page.locator('#toc-list')).toContainText('Chapter 1');
  });

  test('should navigate between chapters', async ({ page }) => {
    // Wait for TOC to load
    await page.waitForSelector('#toc-list li a', { timeout: 10000 });
    
    // Click on first chapter
    await page.click('#toc-list li a:first-child');
    
    // Wait for content to load
    await page.waitForSelector('#content-area h1, #content-area h2', { timeout: 10000 });
    
    // Check that content has loaded
    const contentText = await page.locator('#content-area').textContent();
    expect(contentText.length).toBeGreaterThan(100);
    
    // Check that progress has been updated
    const progressText = await page.locator('#progress-text').textContent();
    expect(progressText).toMatch(/\d+% Complete/);
  });

  test('should handle responsive navigation', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, navigation should be hidden initially
      await expect(page.locator('#navigation-panel')).toHaveClass(/nav-closed/);
      
      // Should have a toggle button
      await expect(page.locator('#nav-toggle, .nav-toggle-external')).toBeVisible();
      
      // Click to open navigation
      await page.click('#nav-toggle, .nav-toggle-external');
      await expect(page.locator('#navigation-panel')).not.toHaveClass(/nav-closed/);
    } else {
      // On desktop, navigation should be visible
      await expect(page.locator('#navigation-panel')).toBeVisible();
    }
  });

  test('should persist reading progress', async ({ page }) => {
    // Navigate to a chapter
    await page.waitForSelector('#toc-list li a', { timeout: 10000 });
    await page.click('#toc-list li a:nth-child(2)'); // Second chapter
    
    // Wait for content to load
    await page.waitForSelector('#content-area h1, #content-area h2', { timeout: 10000 });
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check that progress is restored
    const progressText = await page.locator('#progress-text').textContent();
    expect(progressText).not.toBe('0% Complete');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Try to navigate to a non-existent chapter
    await page.goto('/#chapter-999');
    
    // Should either show an error message or fallback content
    await page.waitForTimeout(3000);
    
    // Page should still be functional
    await expect(page.locator('#navigation-panel')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
  });
});