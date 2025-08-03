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

  test('should have both buttons visible and clickable on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Both buttons should still be visible
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
    
    await expect(settingsBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
    
    // Test that buttons are not overlapping by checking their positions
    const settingsBBox = await settingsBtn.boundingBox();
    const aiBBox = await aiBtn.boundingBox();
    
    expect(settingsBBox).toBeTruthy();
    expect(aiBBox).toBeTruthy();
    
    // Buttons should not overlap (either vertically separated or horizontally separated)
    const verticalSeparation = Math.abs(settingsBBox.y - aiBBox.y) >= Math.min(settingsBBox.height, aiBBox.height);
    const horizontalSeparation = Math.abs(settingsBBox.x - aiBBox.x) >= Math.min(settingsBBox.width, aiBBox.width);
    
    expect(verticalSeparation || horizontalSeparation).toBeTruthy();
    
    // Test functionality
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

  test('should have both buttons visible and clickable on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Both buttons should still be visible
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
    
    await expect(settingsBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
    
    // Test that buttons are not overlapping
    const settingsBBox = await settingsBtn.boundingBox();
    const aiBBox = await aiBtn.boundingBox();
    
    expect(settingsBBox).toBeTruthy();
    expect(aiBBox).toBeTruthy();
    
    // On mobile, buttons should be vertically separated (stacked)
    const verticalSeparation = Math.abs(settingsBBox.y - aiBBox.y) >= Math.min(settingsBBox.height, aiBBox.height);
    expect(verticalSeparation).toBeTruthy();
    
    // Test that both buttons are within viewport bounds
    const viewport = page.viewportSize();
    expect(settingsBBox.x + settingsBBox.width).toBeLessThanOrEqual(viewport.width);
    expect(settingsBBox.y + settingsBBox.height).toBeLessThanOrEqual(viewport.height);
    expect(aiBBox.x + aiBBox.width).toBeLessThanOrEqual(viewport.width);
    expect(aiBBox.y + aiBBox.height).toBeLessThanOrEqual(viewport.height);
    
    // Test functionality on mobile
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

  test('should maintain proper button spacing across viewport changes', async ({ page }) => {
    // Test dynamic viewport changes
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1200, height: 1024 }, // Desktop
      { width: 1920, height: 1080 }  // Large desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300); // Allow layout to adjust
      
      const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
      const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
      
      // Both buttons should be visible at all viewport sizes
      await expect(settingsBtn).toBeVisible();
      await expect(aiBtn).toBeVisible();
      
      // Get button positions
      const settingsBBox = await settingsBtn.boundingBox();
      const aiBBox = await aiBtn.boundingBox();
      
      // Ensure buttons don't overlap
      const verticalSeparation = Math.abs(settingsBBox.y - aiBBox.y) >= Math.min(settingsBBox.height, aiBBox.height);
      const horizontalSeparation = Math.abs(settingsBBox.x - aiBBox.x) >= Math.min(settingsBBox.width, aiBBox.width);
      
      expect(verticalSeparation || horizontalSeparation).toBeTruthy();
      
      // Ensure buttons are within viewport
      expect(settingsBBox.x).toBeGreaterThanOrEqual(0);
      expect(settingsBBox.y).toBeGreaterThanOrEqual(0);
      expect(settingsBBox.x + settingsBBox.width).toBeLessThanOrEqual(viewport.width);
      expect(settingsBBox.y + settingsBBox.height).toBeLessThanOrEqual(viewport.height);
      
      expect(aiBBox.x).toBeGreaterThanOrEqual(0);
      expect(aiBBox.y).toBeGreaterThanOrEqual(0);
      expect(aiBBox.x + aiBBox.width).toBeLessThanOrEqual(viewport.width);
      expect(aiBBox.y + aiBBox.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  test('should allow clicking both buttons sequentially without interference', async ({ page }) => {
    // Set mobile viewport (most constrained)
    await page.setViewportSize({ width: 375, height: 667 });
    
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    const aiBtn = page.locator('#ai-toggle, .ai-toggle, [title*="AI"], [aria-label*="AI"]').first();
    
    // Test sequential clicking
    // 1. Open settings
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel, .settings-content').first();
    await expect(settingsPanel).toBeVisible();
    
    // 2. Open AI (settings should close or both should be visible)
    await aiBtn.click();
    await page.waitForTimeout(500);
    
    const aiWindow = page.locator('#ai-window, .ai-window').first();
    await expect(aiWindow).toBeVisible();
    
    // 3. Close AI
    const aiClose = aiWindow.locator('.ai-close, [data-action="close"], button:has-text("×")').first();
    await aiClose.click();
    await page.waitForTimeout(500);
    
    // 4. Open settings again
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    await expect(settingsPanel).toBeVisible();
    
    // 5. Close settings
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    // Both should be closed and buttons still clickable
    await expect(settingsBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
  });
});