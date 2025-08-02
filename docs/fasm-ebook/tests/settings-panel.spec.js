import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the content to finish loading (loading indicator should disappear)
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && !contentElement.querySelector('.initial-loading');
    }, { timeout: 30000 });
  });

  test('should open and close settings panel', async ({ page }) => {
    // Look for settings button
    const settingsBtn = page.locator('#settings-toggle, .settings-btn, [data-action="settings"]').first();
    await expect(settingsBtn).toBeVisible();
    
    // Click to open settings
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    // Settings panel should be visible
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    await expect(settingsPanel).toBeVisible();
    
    // Should have settings content
    await expect(settingsPanel).toContainText(/Settings|Reading Settings/i);
    
    // Close settings (click button again or close button)
    const closeBtn = settingsPanel.locator('.close-btn, [data-action="close"]').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
    } else {
      await settingsBtn.click();
    }
    
    await page.waitForTimeout(500);
    await expect(settingsPanel).toBeHidden();
  });

  test('should change display mode', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Look for display mode selector
    const displayMode = settingsPanel.locator('select[name="displayMode"], #display-mode, .display-mode-select');
    if (await displayMode.count() > 0) {
      // Change to eInk mode
      await displayMode.selectOption('eink');
      await page.waitForTimeout(500);
      
      // Check that body has eink class
      await expect(page.locator('body')).toHaveClass(/eink/);
      
      // Change back to normal mode
      await displayMode.selectOption('normal');
      await page.waitForTimeout(500);
      
      // eInk class should be removed
      await expect(page.locator('body')).not.toHaveClass(/eink/);
    }
  });

  test('should adjust font size', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Look for font size control
    const fontSizeSlider = settingsPanel.locator('input[type="range"][name*="font"], #font-size-slider, .font-size-control');
    if (await fontSizeSlider.count() > 0) {
      // Get current font size
      const contentArea = page.locator('#chapter-content, .content');
      const initialFontSize = await contentArea.evaluate(el => getComputedStyle(el).fontSize);
      
      // Increase font size
      await fontSizeSlider.fill('20');
      await page.waitForTimeout(500);
      
      // Check that font size changed
      const newFontSize = await contentArea.evaluate(el => getComputedStyle(el).fontSize);
      expect(newFontSize).not.toBe(initialFontSize);
    }
  });

  test('should adjust line height', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Look for line height control
    const lineHeightSlider = settingsPanel.locator('input[type="range"][name*="line"], #line-height-slider, .line-height-control');
    if (await lineHeightSlider.count() > 0) {
      // Change line height
      await lineHeightSlider.fill('2.0');
      await page.waitForTimeout(500);
      
      // Check that line height changed in content
      const contentArea = page.locator('#chapter-content, .content');
      const lineHeight = await contentArea.evaluate(el => getComputedStyle(el).lineHeight);
      expect(parseFloat(lineHeight)).toBeGreaterThan(1.5);
    }
  });

  test('should toggle drawing mode', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Look for drawing mode checkbox
    const drawingCheckbox = settingsPanel.locator('input[type="checkbox"][name*="drawing"], #enable-drawing, .drawing-mode-checkbox');
    if (await drawingCheckbox.count() > 0) {
      // Enable drawing mode
      if (!await drawingCheckbox.isChecked()) {
        await drawingCheckbox.check();
      }
      await page.waitForTimeout(500);
      
      // Check that drawing canvas is available
      const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas');
      if (await drawingCanvas.count() > 0) {
        await expect(drawingCanvas).toBeVisible();
      }
      
      // Disable drawing mode
      await drawingCheckbox.uncheck();
      await page.waitForTimeout(500);
    }
  });

  test('should have PWA install button', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Look for PWA install button
    const installBtn = settingsPanel.locator('button:has-text("Install"), #install-pwa, .install-button');
    if (await installBtn.count() > 0) {
      await expect(installBtn).toBeVisible();
      
      // Button should have appropriate text
      const buttonText = await installBtn.textContent();
      expect(buttonText.toLowerCase()).toMatch(/install|add to/);
    }
  });

  test('should toggle zen mode', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Look for zen mode toggle
    const zenToggle = settingsPanel.locator('input[type="checkbox"][name*="zen"], #zen-mode, .zen-mode-toggle');
    if (await zenToggle.count() > 0) {
      // Enable zen mode
      await zenToggle.check();
      await page.waitForTimeout(1000);
      
      // Control icons should fade out or hide
      const controlIcons = page.locator('#settings-toggle, .control-icons');
      const opacity = await controlIcons.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(0.5);
      
      // Disable zen mode
      await zenToggle.uncheck();
      await page.waitForTimeout(1000);
    }
  });

  test('should stay within viewport bounds', async ({ page }) => {
    // Get viewport size
    const viewport = page.viewportSize();
    
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    await expect(settingsPanel).toBeVisible();
    
    // Check that panel is within viewport
    const panelBox = await settingsPanel.boundingBox();
    expect(panelBox.x).toBeGreaterThanOrEqual(0);
    expect(panelBox.y).toBeGreaterThanOrEqual(0);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width);
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height);
  });

  test('should persist settings changes', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    
    // Change a setting (font size)
    const fontSizeSlider = settingsPanel.locator('input[type="range"][name*="font"], #font-size-slider');
    if (await fontSizeSlider.count() > 0) {
      await fontSizeSlider.fill('18');
      await page.waitForTimeout(500);
      
      // Close settings
      const closeBtn = settingsPanel.locator('.close-btn, [data-action="close"]').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      } else {
        await settingsBtn.click();
      }
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Open settings again
      await page.locator('#settings-toggle, .settings-btn').first().click();
      await page.waitForTimeout(500);
      
      // Setting should be preserved
      const restoredValue = await page.locator('input[type="range"][name*="font"], #font-size-slider').first().inputValue();
      expect(restoredValue).toBe('18');
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Open settings
      const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
      await expect(settingsPanel).toBeVisible();
      
      // On mobile, panel should take more screen space or be full-width
      const panelBox = await settingsPanel.boundingBox();
      const viewport = page.viewportSize();
      
      // Panel should be reasonably wide on mobile
      expect(panelBox.width).toBeGreaterThan(viewport.width * 0.7);
    }
  });
});