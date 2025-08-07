import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Settings Panel (Mouse Only Navigation)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the content to finish loading (loading indicator should disappear)
    await page.waitForFunction(() => {
      const contentElement = document.getElementById('chapter-content');
      return contentElement && !contentElement.querySelector('.initial-loading');
    }, { timeout: 30000 });
  });

  test('should open and close settings sidebar using mouse only', async ({ page }) => {
    // Look for settings button - using mouse only navigation
    const settingsBtn = page.locator('#settings-toggle').first();
    await expect(settingsBtn).toBeVisible();
    
    // Verify no blurring effect is present initially
    const body = page.locator('body');
    const initialBodyStyle = await body.evaluate(el => window.getComputedStyle(el).filter);
    expect(initialBodyStyle).not.toContain('blur');
    
    // Click to open settings using mouse
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    // Settings should appear as inline sidebar (not modal)
    const settingsPanel = page.locator('#settings-panel').first();
    await expect(settingsPanel).toBeVisible();
    
    // Verify it's a sidebar implementation - check for CSS Grid layout
    const bodyGridAreas = await body.evaluate(el => window.getComputedStyle(el).gridTemplateAreas);
    expect(bodyGridAreas).toContain('sidebar');
    
    // Should have settings content
    const settingsContent = page.locator('.settings-content');
    await expect(settingsContent).toBeVisible();
    await expect(settingsContent).toContainText(/Reading Settings/i);
    
    // Verify no window blurring effect when settings is open
    const bodyStyleAfterOpen = await body.evaluate(el => window.getComputedStyle(el).filter);
    expect(bodyStyleAfterOpen).not.toContain('blur');
    
    // Main content should adjust padding, not width
    const mainContent = page.locator('#main-content, .main-content').first();
    const mainContentStyles = await mainContent.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        width: style.width,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight
      };
    });
    
    // Verify content area takes about 75% of screen width as requested
    const viewport = page.viewportSize();
    const expectedWidth = Math.floor(viewport.width * 0.75);
    const actualWidth = parseInt(mainContentStyles.width);
    expect(actualWidth).toBeGreaterThan(expectedWidth - 50); // Allow some tolerance
    
    // Close settings using mouse - try close button first
    const closeBtn = settingsContent.locator('.settings-close, .close-btn').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click({ button: 'left' });
    } else {
      // Fallback to toggle button
      await settingsBtn.click({ button: 'left' });
    }
    
    await page.waitForTimeout(500);
    
    // Settings should be hidden and sidebar should be gone
    await expect(settingsPanel).toBeHidden();
    
    // Body should return to normal grid layout
    const finalBodyGridAreas = await body.evaluate(el => window.getComputedStyle(el).gridTemplateAreas);
    expect(finalBodyGridAreas).not.toContain('sidebar');
  });

  test('should change display mode using mouse clicks only', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Look for display mode selector
    const displayMode = settingsPanel.locator('select[name="displayMode"], #display-mode, .display-mode-select').first();
    if (await displayMode.count() > 0) {
      // Mouse click to open dropdown and select eInk mode
      await displayMode.click({ button: 'left' });
      await displayMode.selectOption('eink');
      await page.waitForTimeout(500);
      
      // Check that body has eink class
      await expect(page.locator('body')).toHaveClass(/eink/);
      
      // Mouse click to change back to standard mode
      await displayMode.click({ button: 'left' });
      await displayMode.selectOption('standard');
      await page.waitForTimeout(500);
      
      // eInk class should be removed
      await expect(page.locator('body')).not.toHaveClass(/eink/);
    }
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should adjust font size using mouse drag only', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Look for font size control
    const fontSizeSlider = settingsPanel.locator('input[type="range"][name*="font"], #font-size-slider, .font-size-control').first();
    if (await fontSizeSlider.count() > 0) {
      // Get current font size
      const contentArea = page.locator('#chapter-content, .content').first();
      const initialFontSize = await contentArea.evaluate(el => getComputedStyle(el).fontSize);
      
      // Use mouse to drag slider to increase font size
      const sliderBoundingBox = await fontSizeSlider.boundingBox();
      await page.mouse.click(sliderBoundingBox.x + sliderBoundingBox.width * 0.8, sliderBoundingBox.y + sliderBoundingBox.height / 2);
      await page.waitForTimeout(500);
      
      // Check that font size changed
      const newFontSize = await contentArea.evaluate(el => getComputedStyle(el).fontSize);
      expect(newFontSize).not.toBe(initialFontSize);
    }
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should adjust line height using mouse interaction only', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Look for line height control
    const lineHeightSlider = settingsPanel.locator('input[type="range"][name*="line"], #line-height-slider, .line-height-control').first();
    if (await lineHeightSlider.count() > 0) {
      // Use mouse to change line height
      const sliderBoundingBox = await lineHeightSlider.boundingBox();
      await page.mouse.click(sliderBoundingBox.x + sliderBoundingBox.width * 0.7, sliderBoundingBox.y + sliderBoundingBox.height / 2);
      await page.waitForTimeout(500);
      
      // Check that line height changed in content
      const contentArea = page.locator('#chapter-content, .content').first();
      const lineHeight = await contentArea.evaluate(el => getComputedStyle(el).lineHeight);
      expect(parseFloat(lineHeight)).toBeGreaterThan(1.0);
    }
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should toggle drawing mode using mouse clicks only', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Look for drawing mode checkbox
    const drawingCheckbox = settingsPanel.locator('input[type="checkbox"][name*="drawing"], #enable-drawing, .drawing-mode-checkbox').first();
    if (await drawingCheckbox.count() > 0) {
      // Enable drawing mode using mouse click
      if (!await drawingCheckbox.isChecked()) {
        await drawingCheckbox.click({ button: 'left' });
      }
      await page.waitForTimeout(500);
      
      // Check that drawing canvas is available
      const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas');
      if (await drawingCanvas.count() > 0) {
        await expect(drawingCanvas).toBeVisible();
      }
      
      // Disable drawing mode using mouse click
      await drawingCheckbox.click({ button: 'left' });
      await page.waitForTimeout(500);
    }
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should access PWA install button using mouse only', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Look for PWA install button
    const installBtn = settingsPanel.locator('button:has-text("Install"), #install-pwa, .install-button').first();
    if (await installBtn.count() > 0) {
      await expect(installBtn).toBeVisible();
      
      // Button should have appropriate text
      const buttonText = await installBtn.textContent();
      expect(buttonText.toLowerCase()).toMatch(/install|add to/);
      
      // Test mouse hover effect
      await installBtn.hover();
      await page.waitForTimeout(300);
      
      // Should be clickable with mouse
      await expect(installBtn).toBeEnabled();
    }
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should toggle zen mode using mouse interaction only', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Look for zen mode toggle
    const zenToggle = settingsPanel.locator('input[type="checkbox"][name*="zen"], #zen-mode, .zen-mode-toggle').first();
    if (await zenToggle.count() > 0) {
      // Enable zen mode using mouse click
      await zenToggle.click({ button: 'left' });
      await page.waitForTimeout(1000);
      
      // Control icons should fade out or hide
      const controlIcons = page.locator('#settings-toggle, .control-icons').first();
      const opacity = await controlIcons.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(0.5);
      
      // Disable zen mode using mouse click
      await zenToggle.click({ button: 'left' });
      await page.waitForTimeout(1000);
    }
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should stay within viewport bounds as inline sidebar', async ({ page }) => {
    // Get viewport size
    const viewport = page.viewportSize();
    
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    await expect(settingsPanel).toBeVisible();
    
    // Check that panel is within viewport (inline sidebar should always be)
    const panelBox = await settingsPanel.boundingBox();
    expect(panelBox.x).toBeGreaterThanOrEqual(0);
    expect(panelBox.y).toBeGreaterThanOrEqual(0);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width);
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height);
    
    // Verify it's positioned as a right sidebar
    expect(panelBox.x).toBeGreaterThan(viewport.width * 0.6); // Should be on right side
    
    // Close settings using mouse
    const closeBtn = settingsPanel.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should persist settings changes after mouse interactions', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsPanel = page.locator('#settings-panel').first();
    
    // Change a setting (font size) using mouse
    const fontSizeSlider = settingsPanel.locator('input[type="range"][name*="font"], #font-size-slider').first();
    if (await fontSizeSlider.count() > 0) {
      // Use mouse to set specific value
      const sliderBoundingBox = await fontSizeSlider.boundingBox();
      await page.mouse.click(sliderBoundingBox.x + sliderBoundingBox.width * 0.9, sliderBoundingBox.y + sliderBoundingBox.height / 2);
      await page.waitForTimeout(500);
      
      // Close settings using mouse
      const closeBtn = settingsPanel.locator('.settings-close').first();
      await closeBtn.click({ button: 'left' });
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Open settings again using mouse
      await page.locator('#settings-toggle').first().click({ button: 'left' });
      await page.waitForTimeout(500);
      
      // Setting should be preserved - verify slider value is not at default
      const restoredSlider = page.locator('input[type="range"][name*="font"], #font-size-slider').first();
      const restoredValue = await restoredSlider.inputValue();
      expect(parseInt(restoredValue)).toBeGreaterThan(16); // Assuming default is 16 or less
    }
    
    // Close settings using mouse
    const finalCloseBtn = settingsPanel.locator('.settings-close').first();
    await finalCloseBtn.click({ button: 'left' });
  });

  test('should be responsive on mobile with mouse/touch', async ({ page, isMobile }) => {
    if (isMobile) {
      // Open settings using mouse/touch
      const settingsBtn = page.locator('#settings-toggle').first();
      await settingsBtn.click({ button: 'left' });
      await page.waitForTimeout(500);
      
      const settingsPanel = page.locator('#settings-panel').first();
      await expect(settingsPanel).toBeVisible();
      
      // On mobile, sidebar should adapt appropriately
      const panelBox = await settingsPanel.boundingBox();
      const viewport = page.viewportSize();
      
      // Panel should be reasonably sized on mobile
      expect(panelBox.width).toBeGreaterThan(viewport.width * 0.25);
      expect(panelBox.width).toBeLessThan(viewport.width * 0.6); // Don't take too much space
      
      // Should still be positioned as right sidebar
      expect(panelBox.x).toBeGreaterThan(viewport.width * 0.4);
      
      // Close settings using mouse/touch
      const closeBtn = settingsPanel.locator('.settings-close').first();
      await closeBtn.click({ button: 'left' });
    }
  });

  test('should handle mouse interactions smoothly without blur effects', async ({ page }) => {
    // Verify no backdrop blur initially
    const backdrop = page.locator('.modal-backdrop');
    if (await backdrop.count() > 0) {
      const backdropStyle = await backdrop.evaluate(el => window.getComputedStyle(el).backdropFilter);
      expect(backdropStyle).not.toContain('blur');
    }
    
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    // Verify no blur effects on body or main elements
    const body = page.locator('body');
    const bodyFilter = await body.evaluate(el => window.getComputedStyle(el).filter);
    expect(bodyFilter).not.toContain('blur');
    
    const mainContent = page.locator('#main-content, .main-content').first();
    const mainFilter = await mainContent.evaluate(el => window.getComputedStyle(el).filter);
    expect(mainFilter).not.toContain('blur');
    
    // Test smooth transitions without blur
    const settingsContent = page.locator('.settings-content');
    await expect(settingsContent).toBeVisible();
    
    // Mouse hover over controls should work smoothly
    const displayModeSelect = settingsContent.locator('#display-mode').first();
    if (await displayModeSelect.count() > 0) {
      await displayModeSelect.hover();
      await page.waitForTimeout(200);
      
      // Should be interactive
      await expect(displayModeSelect).toBeEnabled();
    }
    
    // Close settings using mouse
    const closeBtn = settingsContent.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    // Verify clean closure without blur effects
    await expect(settingsContent).toBeHidden();
  });

  test('should support mouse wheel scrolling in sidebar', async ({ page }) => {
    // Open settings using mouse
    const settingsBtn = page.locator('#settings-toggle').first();
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    const settingsContent = page.locator('.settings-content').first();
    await expect(settingsContent).toBeVisible();
    
    // Test mouse wheel scrolling if content is scrollable
    const contentHeight = await settingsContent.evaluate(el => el.scrollHeight);
    const containerHeight = await settingsContent.evaluate(el => el.clientHeight);
    
    if (contentHeight > containerHeight) {
      // Test scroll with mouse wheel
      await settingsContent.hover();
      await page.mouse.wheel(0, 100); // Scroll down
      await page.waitForTimeout(200);
      
      const scrollTop = await settingsContent.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
    
    // Close settings using mouse
    const closeBtn = settingsContent.locator('.settings-close').first();
    await closeBtn.click({ button: 'left' });
  });

  test('should handle multiple rapid mouse clicks gracefully', async ({ page }) => {
    const settingsBtn = page.locator('#settings-toggle').first();
    
    // Rapid mouse clicks should not break the interface
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(100);
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(100);
    await settingsBtn.click({ button: 'left' });
    await page.waitForTimeout(500);
    
    // Settings should still be functional
    const settingsPanel = page.locator('#settings-panel').first();
    const isVisible = await settingsPanel.isVisible();
    
    // Should be either visible or hidden, but not broken
    if (isVisible) {
      const settingsContent = page.locator('.settings-content');
      await expect(settingsContent).toBeVisible();
      
      // Should be able to close normally
      const closeBtn = settingsContent.locator('.settings-close').first();
      await closeBtn.click({ button: 'left' });
    } else {
      // Should be able to open normally
      await settingsBtn.click({ button: 'left' });
      await page.waitForTimeout(500);
      await expect(settingsPanel).toBeVisible();
    }
  });
});