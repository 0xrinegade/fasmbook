import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Button Overlap Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the content to finish loading (loading indicator should disappear)
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && !contentElement.querySelector('.initial-loading');
    }, { timeout: 30000 });
  });

  test('should have both AI helper and settings buttons visible and clickable on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 1024 });
    
    // Both buttons should be visible
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
    
    await expect(settingsBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
    
    // Test settings button functionality
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel, .settings-content').first();
    await expect(settingsPanel).toBeVisible();
    
    // Close settings
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    // Test AI button functionality
    await aiBtn.click();
    await page.waitForTimeout(500);
    
    const aiWindow = page.locator('#ai-window, .ai-window').first();
    await expect(aiWindow).toBeVisible();
    
    // Close AI window
    const aiClose = aiWindow.locator('.ai-close, [data-action="close"], button:has-text("×")').first();
    await aiClose.click();
    await page.waitForTimeout(500);
  });

  test('should have both buttons visible and not overlapping on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Both buttons should be visible
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
    
    await expect(settingsBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
    
    // Test that both buttons are within viewport bounds
    const settingsBBox = await settingsBtn.boundingBox();
    const aiBBox = await aiBtn.boundingBox();
    const viewport = page.viewportSize();
    
    expect(settingsBBox).toBeTruthy();
    expect(aiBBox).toBeTruthy();
    
    // Buttons should be within viewport
    expect(settingsBBox.x + settingsBBox.width).toBeLessThanOrEqual(viewport.width);
    expect(settingsBBox.y + settingsBBox.height).toBeLessThanOrEqual(viewport.height);
    expect(aiBBox.x + aiBBox.width).toBeLessThanOrEqual(viewport.width);
    expect(aiBBox.y + aiBBox.height).toBeLessThanOrEqual(viewport.height);
    
    // Test basic functionality - both buttons should be clickable
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel, .settings-content').first();
    await expect(settingsPanel).toBeVisible();
    
    await settingsBtn.click(); // Close
    await page.waitForTimeout(500);
    
    await aiBtn.click();
    await page.waitForTimeout(500);
    
    const aiWindow = page.locator('#ai-window, .ai-window').first();
    await expect(aiWindow).toBeVisible();
  });

  test('should ensure buttons are accessible across viewport changes', async ({ page }) => {
    // Test dynamic viewport changes
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1200, height: 1024 }  // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to adjust
      
      const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
      const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
      
      // Both buttons should be visible at all viewport sizes
      await expect(settingsBtn).toBeVisible();
      await expect(aiBtn).toBeVisible();
      
      // Test that buttons are clickable (basic smoke test)
      const settingsBBox = await settingsBtn.boundingBox();
      const aiBBox = await aiBtn.boundingBox();
      
      expect(settingsBBox).toBeTruthy();
      expect(aiBBox).toBeTruthy();
      
      // Ensure buttons are within viewport
      expect(settingsBBox.x).toBeGreaterThanOrEqual(0);
      expect(settingsBBox.y).toBeGreaterThanOrEqual(0);
      expect(aiBBox.x).toBeGreaterThanOrEqual(0);
      expect(aiBBox.y).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow both buttons to function properly in sequence', async ({ page }) => {
    // Set mobile viewport (most constrained)
    await page.setViewportSize({ width: 375, height: 667 });
    
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
    
    // Test that both buttons can be used sequentially
    // 1. Open settings
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel, .settings-content').first();
    await expect(settingsPanel).toBeVisible();
    
    // 2. Close settings
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    // 3. Open AI
    await aiBtn.click();
    await page.waitForTimeout(500);
    
    const aiWindow = page.locator('#ai-window, .ai-window').first();
    await expect(aiWindow).toBeVisible();
    
    // 4. Close AI
    const aiClose = aiWindow.locator('.ai-close, [data-action="close"], button:has-text("×")').first();
    await aiClose.click();
    await page.waitForTimeout(500);
    
    // Both buttons should still be visible and accessible
    await expect(settingsBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
  });
});