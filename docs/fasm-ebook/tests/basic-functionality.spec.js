import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the main app to initialize - check the navigation panel h1 specifically
    await expect(page.locator('.nav-header h1')).toContainText('FASM Programming Book');
    
    // Wait for the content to finish loading (loading indicator should disappear)
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && !contentElement.querySelector('.initial-loading');
    }, { timeout: 30000 });
  });

  test('should load the main page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/FASM Programming Book/);
    
    // Check main elements are present
    await expect(page.locator('#navigation-panel')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#toc-list')).toBeVisible();
    
    // Check that content area exists and has loaded content (not just loading screen)
    await expect(page.locator('#chapter-content')).toBeVisible();
    
    // Verify actual chapter content has loaded (should contain more than just loading text)
    const contentText = await page.locator('#chapter-content').textContent();
    expect(contentText).not.toContain('Loading the complete assembly programming guide');
    expect(contentText.length).toBeGreaterThan(200); // Ensure substantial content loaded
  });

  test('should display table of contents', async ({ page }) => {
    // Wait for TOC to load with longer timeout for CI
    await page.waitForSelector('#toc-list li', { timeout: 30000 });
    
    // Check that TOC items exist
    const tocItems = await page.locator('#toc-list li').count();
    expect(tocItems).toBeGreaterThan(0);
    
    // Check for specific chapters
    await expect(page.locator('#toc-list')).toContainText('Preface');
    await expect(page.locator('#toc-list')).toContainText('Chapter 1');
  });

  test('should navigate between chapters', async ({ page }) => {
    // Wait for TOC to load with longer timeout for CI
    await page.waitForSelector('#toc-list li a', { timeout: 30000 });
    
    // Get all chapter links and click the first one using more robust selection
    const chapterLinks = await page.$$('#toc-list li a');
    if (chapterLinks.length === 0) {
      throw new Error('No chapter links found in TOC');
    }
    
    // Wait for network response when clicking chapter link
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 30000 }),
      chapterLinks[0].click()
    ]);
    
    // Wait for new content to load - check for content change rather than just headers
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && 
             !contentElement.querySelector('.initial-loading') &&
             contentElement.textContent.length > 300;
    }, { timeout: 30000 });
    
    // Check that content has loaded
    const contentText = await page.locator('#chapter-content').textContent();
    expect(contentText.length).toBeGreaterThan(200);
    
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
    // Navigate to a chapter with longer timeout for CI
    await page.waitForSelector('#toc-list li a', { timeout: 30000 });
    
    // Get all chapter links and click the second one using more robust selection
    const chapterLinks = await page.$$('#toc-list li a');
    if (chapterLinks.length < 2) {
      throw new Error('Not enough chapter links found in TOC for testing');
    }
    
    // Wait for network response when clicking chapter link
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 30000 }),
      chapterLinks[1].click() // Second chapter
    ]);
    
    // Wait for content to load using the same pattern as other tests
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && 
             !contentElement.querySelector('.initial-loading') &&
             contentElement.textContent.length > 300;
    }, { timeout: 30000 });
    
    // Wait for progress to be saved
    await page.waitForTimeout(1000);
    
    // Reload the page
    await page.reload();
    
    // Wait for content to reload after page refresh
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && !contentElement.querySelector('.initial-loading');
    }, { timeout: 30000 });
    
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