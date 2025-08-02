import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  viewports.forEach(viewport => {
    test(`should work correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForTimeout(2000);

      // Basic functionality should work
      await expect(page.locator('#navigation-panel')).toBeVisible();
      await expect(page.locator('#main-content')).toBeVisible();

      // Navigation behavior
      if (viewport.width <= 768) {
        // Mobile: navigation should be closed initially
        await expect(page.locator('#navigation-panel')).toHaveClass(/nav-closed/);
        
        // Should have external toggle button
        const externalToggle = page.locator('.nav-toggle-external, #nav-toggle-external');
        if (await externalToggle.count() > 0) {
          await expect(externalToggle).toBeVisible();
        }
      } else {
        // Desktop: navigation should be open
        await expect(page.locator('#navigation-panel')).not.toHaveClass(/nav-closed/);
      }

      // Settings and AI controls should stay within bounds
      const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
      if (await settingsBtn.count() > 0) {
        const btnBox = await settingsBtn.boundingBox();
        expect(btnBox.x).toBeGreaterThanOrEqual(0);
        expect(btnBox.y).toBeGreaterThanOrEqual(0);
        expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(viewport.width);
        expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(viewport.height);
      }

      const aiToggle = page.locator('#ai-toggle').first();
      if (await aiToggle.count() > 0) {
        const aiBox = await aiToggle.boundingBox();
        expect(aiBox.x).toBeGreaterThanOrEqual(0);
        expect(aiBox.y).toBeGreaterThanOrEqual(0);
        expect(aiBox.x + aiBox.width).toBeLessThanOrEqual(viewport.width);
        expect(aiBox.y + aiBox.height).toBeLessThanOrEqual(viewport.height);
      }
    });
  });

  test('should handle window resize gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Start with desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Open AI assistant
    const aiToggle = page.locator('#ai-toggle');
    if (await aiToggle.count() > 0) {
      await aiToggle.click();
      await page.waitForTimeout(500);
      
      const aiWindow = page.locator('#ai-window');
      await expect(aiWindow).toBeVisible();
    }

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Elements should still be within bounds
    if (await page.locator('#ai-window').count() > 0 && await page.locator('#ai-window').isVisible()) {
      const aiBox = await page.locator('#ai-window').boundingBox();
      expect(aiBox.x + aiBox.width).toBeLessThanOrEqual(375);
      expect(aiBox.y + aiBox.height).toBeLessThanOrEqual(667);
    }

    // Navigation should adapt
    await expect(page.locator('#navigation-panel')).toHaveClass(/nav-closed/);

    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);

    // Navigation should open again
    await expect(page.locator('#navigation-panel')).not.toHaveClass(/nav-closed/);
  });

  test('should have proper touch targets on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check minimum touch target sizes (44px recommended)
    const touchTargets = [
      '#ai-toggle',
      '#settings-toggle, .settings-btn',
      '#nav-toggle, .nav-toggle-external',
      '.toc-list a',
    ];

    for (const selector of touchTargets) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test('should handle landscape mode on mobile', async ({ page }) => {
    // Set mobile landscape viewport
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Basic functionality should work
    await expect(page.locator('#main-content')).toBeVisible();

    // Content should fit in reduced height
    const contentArea = page.locator('#content-area');
    if (await contentArea.count() > 0) {
      const contentBox = await contentArea.boundingBox();
      expect(contentBox.height).toBeLessThanOrEqual(375);
    }

    // UI elements should be accessible
    const aiToggle = page.locator('#ai-toggle');
    if (await aiToggle.count() > 0) {
      await expect(aiToggle).toBeVisible();
      
      // Should be able to open AI assistant
      await aiToggle.click();
      await page.waitForTimeout(500);
      
      const aiWindow = page.locator('#ai-window');
      if (await aiWindow.isVisible()) {
        const aiBox = await aiWindow.boundingBox();
        expect(aiBox.height).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should adapt content layout for different screen sizes', async ({ page }) => {
    const sizes = [
      { width: 375, height: 667 },   // Mobile
      { width: 1024, height: 768 },  // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForTimeout(2000);

      // Load a chapter with content
      const tocLink = page.locator('#toc-list a').first();
      if (await tocLink.count() > 0) {
        await tocLink.click();
        await page.waitForTimeout(2000);
      }

      const contentArea = page.locator('#content-area');
      if (await contentArea.count() > 0) {
        const contentBox = await contentArea.boundingBox();
        
        // Content should use available space appropriately
        if (size.width >= 1024) {
          // Desktop: content shouldn't be too wide
          expect(contentBox.width).toBeLessThanOrEqual(size.width * 0.8);
        } else {
          // Mobile/tablet: content should use most of the width
          expect(contentBox.width).toBeGreaterThanOrEqual(size.width * 0.9);
        }
        
        // Content should not overflow viewport
        expect(contentBox.width).toBeLessThanOrEqual(size.width);
        expect(contentBox.height).toBeLessThanOrEqual(size.height);
      }
    }
  });

  test('should handle very small screens gracefully', async ({ page }) => {
    // Test very small screen (like old phones)
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Basic elements should still be functional
    await expect(page.locator('#main-content')).toBeVisible();
    
    // Navigation should be completely hidden on very small screens
    await expect(page.locator('#navigation-panel')).toHaveClass(/nav-closed/);
    
    // Toggle button should be available
    const toggleBtn = page.locator('#nav-toggle, .nav-toggle-external');
    if (await toggleBtn.count() > 0) {
      await expect(toggleBtn).toBeVisible();
      
      // Should be able to open navigation
      await toggleBtn.click();
      await page.waitForTimeout(500);
      
      // Navigation should overlay the content
      await expect(page.locator('#navigation-panel')).not.toHaveClass(/nav-closed/);
    }

    // AI controls should still work
    const aiToggle = page.locator('#ai-toggle');
    if (await aiToggle.count() > 0) {
      await expect(aiToggle).toBeVisible();
      
      const aiBox = await aiToggle.boundingBox();
      expect(aiBox.x + aiBox.width).toBeLessThanOrEqual(320);
      expect(aiBox.y + aiBox.height).toBeLessThanOrEqual(480);
    }
  });

  test('should handle very large screens properly', async ({ page }) => {
    // Test large desktop screen
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Content should not be stretched too wide
    const contentArea = page.locator('#content-area');
    if (await contentArea.count() > 0) {
      const contentBox = await contentArea.boundingBox();
      
      // Content should have a reasonable max-width
      expect(contentBox.width).toBeLessThanOrEqual(1200);
    }

    // Navigation should be properly sized
    const navPanel = page.locator('#navigation-panel');
    const navBox = await navPanel.boundingBox();
    
    // Navigation shouldn't take up too much space
    expect(navBox.width).toBeLessThanOrEqual(400);
    expect(navBox.width).toBeGreaterThanOrEqual(250);

    // UI controls should be positioned correctly
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      const btnBox = await settingsBtn.boundingBox();
      
      // Should be positioned relative to right edge
      expect(btnBox.x).toBeGreaterThan(2560 * 0.8);
    }
  });
});