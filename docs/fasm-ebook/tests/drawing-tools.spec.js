import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Drawing Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Enable drawing mode first
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      const drawingCheckbox = page.locator('input[type="checkbox"][name*="drawing"], #enable-drawing').first();
      if (await drawingCheckbox.count() > 0 && !await drawingCheckbox.isChecked()) {
        await drawingCheckbox.check();
        await page.waitForTimeout(500);
      }
      
      // Close settings
      await settingsBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should have drawing canvas when enabled', async ({ page }) => {
    // Look for drawing canvas
    const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas');
    if (await drawingCanvas.count() > 0) {
      await expect(drawingCanvas).toBeVisible();
      
      // Canvas should cover the content area
      const canvas = drawingCanvas.first();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox.width).toBeGreaterThan(100);
      expect(canvasBox.height).toBeGreaterThan(100);
    }
  });

  test('should open drawing tools panel', async ({ page }) => {
    // Look for drawing tools button
    const drawingBtn = page.locator('#drawing-toggle, .drawing-btn, [data-action="drawing"]').first();
    if (await drawingBtn.count() > 0) {
      await expect(drawingBtn).toBeVisible();
      
      // Click to open drawing tools
      await drawingBtn.click();
      await page.waitForTimeout(500);
      
      // Drawing tools panel should be visible
      const drawingPanel = page.locator('#drawing-tools, .drawing-tools, .drawing-panel').first();
      await expect(drawingPanel).toBeVisible();
      
      // Should have drawing controls
      await expect(drawingPanel).toContainText(/Brush|Color|Size|Tools/i);
    }
  });

  test('should change brush size', async ({ page }) => {
    // Open drawing tools
    const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
    if (await drawingBtn.count() > 0) {
      await drawingBtn.click();
      await page.waitForTimeout(500);
      
      const drawingPanel = page.locator('#drawing-tools, .drawing-tools').first();
      
      // Look for brush size control
      const brushSizeSlider = drawingPanel.locator('input[type="range"][name*="brush"], input[type="range"][name*="size"], .brush-size-slider');
      if (await brushSizeSlider.count() > 0) {
        // Change brush size
        await brushSizeSlider.fill('10');
        await page.waitForTimeout(500);
        
        // Value should be updated
        const value = await brushSizeSlider.inputValue();
        expect(value).toBe('10');
      }
    }
  });

  test('should change brush color', async ({ page }) => {
    // Open drawing tools
    const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
    if (await drawingBtn.count() > 0) {
      await drawingBtn.click();
      await page.waitForTimeout(500);
      
      const drawingPanel = page.locator('#drawing-tools, .drawing-tools').first();
      
      // Look for color selection
      const colorButtons = drawingPanel.locator('.color-btn, .color-swatch, .color-option');
      if (await colorButtons.count() > 0) {
        // Click on a color
        await colorButtons.first().click();
        await page.waitForTimeout(500);
        
        // Color should be selected (check for active class)
        await expect(colorButtons.first()).toHaveClass(/active|selected/);
      }
    }
  });

  test('should allow drawing on canvas', async ({ page }) => {
    const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas').first();
    if (await drawingCanvas.count() > 0) {
      // Get canvas position
      const canvasBox = await drawingCanvas.boundingBox();
      
      // Draw a simple line
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 150, canvasBox.y + 150);
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      
      // Check that something was drawn (canvas should have changed)
      const imageData = await drawingCanvas.evaluate(canvas => {
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return Array.from(data.data).some(pixel => pixel !== 0);
      });
      
      expect(imageData).toBe(true);
    }
  });

  test('should clear drawing canvas', async ({ page }) => {
    const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas').first();
    if (await drawingCanvas.count() > 0) {
      // Draw something first
      const canvasBox = await drawingCanvas.boundingBox();
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
      await page.mouse.up();
      
      // Open drawing tools
      const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
      if (await drawingBtn.count() > 0) {
        await drawingBtn.click();
        await page.waitForTimeout(500);
        
        // Look for clear button
        const clearBtn = page.locator('button:has-text("Clear"), .clear-btn, [data-action="clear"]').first();
        if (await clearBtn.count() > 0) {
          await clearBtn.click();
          await page.waitForTimeout(500);
          
          // Canvas should be cleared
          const isEmpty = await drawingCanvas.evaluate(canvas => {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return Array.from(data.data).every(pixel => pixel === 0);
          });
          
          expect(isEmpty).toBe(true);
        }
      }
    }
  });

  test('should save drawing to library', async ({ page }) => {
    const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas').first();
    if (await drawingCanvas.count() > 0) {
      // Draw something
      const canvasBox = await drawingCanvas.boundingBox();
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
      await page.mouse.up();
      
      // Open drawing tools
      const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
      if (await drawingBtn.count() > 0) {
        await drawingBtn.click();
        await page.waitForTimeout(500);
        
        // Look for save button
        const saveBtn = page.locator('button:has-text("Save"), .save-btn, [data-action="save"]').first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
          
          // Should show success or library should update
          const library = page.locator('.drawing-library, #drawing-library');
          if (await library.count() > 0) {
            // Library should contain the saved drawing
            const savedDrawings = library.locator('.drawing-item, .saved-drawing');
            expect(await savedDrawings.count()).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('should access drawing library', async ({ page }) => {
    // Open drawing tools
    const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
    if (await drawingBtn.count() > 0) {
      await drawingBtn.click();
      await page.waitForTimeout(500);
      
      // Look for library button or tab
      const libraryBtn = page.locator('button:has-text("Library"), .library-btn, [data-tab="library"]').first();
      if (await libraryBtn.count() > 0) {
        await libraryBtn.click();
        await page.waitForTimeout(500);
        
        // Library interface should be visible
        const libraryInterface = page.locator('.drawing-library, #drawing-library, .library-content').first();
        await expect(libraryInterface).toBeVisible();
        
        // Should have library controls
        await expect(libraryInterface).toContainText(/Library|Saved|Drawings/i);
      }
    }
  });

  test('should load drawing from library', async ({ page }) => {
    // Open drawing tools and go to library
    const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
    if (await drawingBtn.count() > 0) {
      await drawingBtn.click();
      await page.waitForTimeout(500);
      
      const libraryBtn = page.locator('button:has-text("Library"), .library-btn, [data-tab="library"]').first();
      if (await libraryBtn.count() > 0) {
        await libraryBtn.click();
        await page.waitForTimeout(500);
        
        // Look for saved drawings
        const savedDrawings = page.locator('.drawing-item, .saved-drawing');
        if (await savedDrawings.count() > 0) {
          // Click on first saved drawing
          await savedDrawings.first().click();
          await page.waitForTimeout(500);
          
          // Drawing should be loaded to canvas
          const canvas = page.locator('#drawing-canvas, .drawing-canvas').first();
          const hasContent = await canvas.evaluate(canvas => {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return Array.from(data.data).some(pixel => pixel !== 0);
          });
          
          expect(hasContent).toBe(true);
        }
      }
    }
  });

  test('should handle drawing tools responsive behavior', async ({ page, isMobile }) => {
    // Open drawing tools
    const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
    if (await drawingBtn.count() > 0) {
      await drawingBtn.click();
      await page.waitForTimeout(500);
      
      const drawingPanel = page.locator('#drawing-tools, .drawing-tools').first();
      await expect(drawingPanel).toBeVisible();
      
      if (isMobile) {
        // On mobile, tools should be compact or use tabs
        const panelBox = await drawingPanel.boundingBox();
        const viewport = page.viewportSize();
        
        // Panel should fit on mobile screen
        expect(panelBox.width).toBeLessThanOrEqual(viewport.width);
        expect(panelBox.height).toBeLessThanOrEqual(viewport.height * 0.8);
      }
    }
  });

  test('should undo/redo drawing actions', async ({ page }) => {
    const drawingCanvas = page.locator('#drawing-canvas, .drawing-canvas').first();
    if (await drawingCanvas.count() > 0) {
      // Draw something
      const canvasBox = await drawingCanvas.boundingBox();
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
      await page.mouse.up();
      
      // Open drawing tools
      const drawingBtn = page.locator('#drawing-toggle, .drawing-btn').first();
      if (await drawingBtn.count() > 0) {
        await drawingBtn.click();
        await page.waitForTimeout(500);
        
        // Look for undo button
        const undoBtn = page.locator('button:has-text("Undo"), .undo-btn, [data-action="undo"]').first();
        if (await undoBtn.count() > 0) {
          await undoBtn.click();
          await page.waitForTimeout(500);
          
          // Canvas should be cleared/reverted
          const isEmpty = await drawingCanvas.evaluate(canvas => {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return Array.from(data.data).every(pixel => pixel === 0);
          });
          
          expect(isEmpty).toBe(true);
        }
      }
    }
  });
});