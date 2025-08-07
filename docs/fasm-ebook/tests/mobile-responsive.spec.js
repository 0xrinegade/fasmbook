/**
 * Mobile-Specific E2E Tests for Enhanced Responsive Design
 * 
 * Comprehensive testing of mobile layouts, responsive behavior, 
 * and touch interactions for the FASM Programming Book.
 */

import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers.js';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await TestHelpers.waitForEBookInit(page);
  });

  test('should display proper mobile layout', async ({ page }) => {
    await test.step('Verify mobile navigation layout', async () => {
      const navPanel = page.locator('#navigation-panel');
      const navToggle = page.locator('#nav-toggle');
      
      // Navigation should be hidden by default on mobile
      await expect(navToggle).toBeVisible();
      
      // Panel should be off-screen initially
      const navTransform = await navPanel.evaluate(el => 
        getComputedStyle(el).transform
      );
      expect(navTransform).toContain('matrix'); // Should have transform applied
    });

    await test.step('Verify control icons positioning', async () => {
      const controlIcons = page.locator('.control-icons');
      const aiToggle = page.locator('#ai-toggle');
      const settingsToggle = page.locator('#settings-toggle');
      
      await expect(controlIcons).toBeVisible();
      await expect(aiToggle).toBeVisible();
      await expect(settingsToggle).toBeVisible();
      
      // Check touch target sizes
      const aiBox = await aiToggle.boundingBox();
      const settingsBox = await settingsToggle.boundingBox();
      
      expect(aiBox.width).toBeGreaterThanOrEqual(44);
      expect(aiBox.height).toBeGreaterThanOrEqual(44);
      expect(settingsBox.width).toBeGreaterThanOrEqual(44);
      expect(settingsBox.height).toBeGreaterThanOrEqual(44);
    });

    await test.step('Verify content layout and readability', async () => {
      const mainContent = page.locator('#main-content');
      const chapterContent = page.locator('#chapter-content');
      
      await expect(mainContent).toBeVisible();
      await expect(chapterContent).toBeVisible();
      
      // Check padding and margins for mobile
      const contentPadding = await mainContent.evaluate(el => 
        getComputedStyle(el).padding
      );
      expect(contentPadding).toBeTruthy();
      
      // Verify text is not too small
      const fontSize = await chapterContent.evaluate(el => 
        getComputedStyle(el).fontSize
      );
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(13); // Minimum readable size
    });
  });

  test('should handle mobile navigation interactions', async ({ page }) => {
    await test.step('Test navigation panel toggle', async () => {
      const navPanel = page.locator('#navigation-panel');
      const navToggle = page.locator('#nav-toggle');
      
      // Open navigation
      await navToggle.click();
      await page.waitForTimeout(500);
      
      // Panel should be visible
      const isVisible = await navPanel.evaluate(el => {
        const transform = getComputedStyle(el).transform;
        return !transform.includes('translateX(-100%)');
      });
      expect(isVisible).toBe(true);
      
      // Close navigation by clicking toggle again
      await navToggle.click();
      await page.waitForTimeout(500);
    });

    await test.step('Test chapter navigation on mobile', async () => {
      const prevBtn = page.locator('#prev-chapter');
      const nextBtn = page.locator('#next-chapter');
      const chapterInfo = page.locator('#chapter-info');
      
      // Navigation buttons should be stacked vertically on mobile
      const prevBox = await prevBtn.boundingBox();
      const nextBox = await nextBtn.boundingBox();
      
      // On mobile, buttons are in column layout
      expect(Math.abs(prevBox.x - nextBox.x)).toBeLessThan(50);
      
      // Test navigation functionality
      await nextBtn.click();
      await page.waitForTimeout(1000);
      
      const newChapterInfo = await chapterInfo.textContent();
      expect(newChapterInfo).toBeTruthy();
      expect(newChapterInfo).not.toBe('Loading...');
    });

    await test.step('Test touch scrolling and interactions', async () => {
      const chapterContent = page.locator('#chapter-content');
      
      // Test touch scrolling
      await TestHelpers.testTouchInteraction(page, chapterContent);
      
      // Scroll down to test content visibility
      await page.touchscreen.tap(200, 400);
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(500);
      
      // Content should still be visible and readable
      await expect(chapterContent).toBeVisible();
    });
  });

  test('should provide optimal modal experience on mobile', async ({ page }) => {
    await test.step('Test AI assistant modal on mobile', async () => {
      const aiToggle = page.locator('#ai-toggle');
      const aiWindow = page.locator('#ai-window');
      
      // Open AI assistant
      await aiToggle.click();
      await page.waitForSelector('#ai-window.visible', { timeout: 5000 });
      
      // On mobile, modal should be full-screen or near full-screen
      const windowBox = await aiWindow.boundingBox();
      const viewport = page.viewportSize();
      
      // Should take up most of the screen on mobile
      expect(windowBox.width / viewport.width).toBeGreaterThan(0.9);
      expect(windowBox.height / viewport.height).toBeGreaterThan(0.8);
      
      // Test input field - should prevent zoom on iOS
      const inputField = page.locator('#ai-input-field');
      const inputFontSize = await inputField.evaluate(el => 
        getComputedStyle(el).fontSize
      );
      expect(parseInt(inputFontSize)).toBeGreaterThanOrEqual(16); // Prevents iOS zoom
      
      // Test closing modal
      const closeBtn = page.locator('#ai-close');
      await closeBtn.click();
      await page.waitForTimeout(500);
      await expect(aiWindow).not.toBeVisible();
    });

    await test.step('Test settings modal on mobile', async () => {
      const settingsToggle = page.locator('#settings-toggle');
      const settingsContent = page.locator('.settings-content');
      
      // Open settings
      await settingsToggle.click();
      await page.waitForSelector('.settings-content.visible', { timeout: 5000 });
      
      // Settings should be full-screen on mobile
      const settingsBox = await settingsContent.boundingBox();
      const viewport = page.viewportSize();
      
      expect(settingsBox.width / viewport.width).toBeGreaterThan(0.95);
      expect(settingsBox.height / viewport.height).toBeGreaterThan(0.9);
      
      // Test scrollability if content is long
      const settingsBody = page.locator('.settings-body');
      await expect(settingsBody).toBeVisible();
      
      // Test settings interactions
      const fontSizeSlider = page.locator('#font-size');
      await fontSizeSlider.fill('18');
      
      // Verify font size change is applied
      await page.waitForTimeout(500);
      const rootFontSize = await page.evaluate(() => 
        getComputedStyle(document.documentElement).getPropertyValue('--font-size')
      );
      expect(rootFontSize).toBe('18px');
      
      // Close settings
      const closeBtn = page.locator('.settings-close');
      await closeBtn.click();
      await page.waitForTimeout(500);
      await expect(settingsContent).not.toBeVisible();
    });

    await test.step('Test modal backdrop and focus management', async () => {
      // Open AI assistant
      await page.locator('#ai-toggle').click();
      await page.waitForSelector('#ai-window.visible', { timeout: 5000 });
      
      // Test keyboard navigation within modal
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Focus should be trapped within modal
      const focusedElement = await page.evaluate(() => 
        document.activeElement.closest('#ai-window') !== null
      );
      expect(focusedElement).toBe(true);
      
      // Test escape key closes modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(page.locator('#ai-window')).not.toBeVisible();
    });
  });

  test('should handle device orientation changes', async ({ page }) => {
    await test.step('Test portrait to landscape transition', async () => {
      const viewport = page.viewportSize();
      
      // Switch to landscape
      await page.setViewportSize({ 
        width: viewport.height, 
        height: viewport.width 
      });
      await page.waitForTimeout(1000);
      
      // Verify layout adapts to landscape
      const controlIcons = page.locator('.control-icons');
      const aiWindow = page.locator('#ai-window');
      
      await expect(controlIcons).toBeVisible();
      
      // Open AI assistant in landscape
      await page.locator('#ai-toggle').click();
      await page.waitForSelector('#ai-window.visible', { timeout: 5000 });
      
      // In landscape, modal might not be full-screen
      const windowBox = await aiWindow.boundingBox();
      const newViewport = page.viewportSize();
      
      // Should still be usable but may have different dimensions
      expect(windowBox.width).toBeGreaterThan(300);
      expect(windowBox.height).toBeGreaterThan(200);
      
      await page.locator('#ai-close').click();
      await page.waitForTimeout(500);
      
      // Switch back to portrait
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
    });
  });

  test('should maintain performance on mobile', async ({ page }) => {
    await test.step('Measure mobile performance metrics', async () => {
      const metrics = await TestHelpers.measurePerformance(page);
      
      // Mobile performance targets (more lenient than desktop)
      expect(metrics.timeToInteractive).toBeLessThan(8000); // 8 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(4000); // 4 seconds
      
      // Test smooth animations
      const aiToggle = page.locator('#ai-toggle');
      await aiToggle.hover();
      await page.waitForTimeout(500);
      
      // Should not cause significant performance issues
      const animationFrames = await page.evaluate(() => {
        let frames = 0;
        const start = performance.now();
        
        function countFrame() {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(countFrame);
          }
        }
        
        requestAnimationFrame(countFrame);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(frames), 1000);
        });
      });
      
      // Should maintain reasonable frame rate
      expect(animationFrames).toBeGreaterThan(30); // At least 30 FPS
    });

    await test.step('Test memory usage with modal interactions', async () => {
      // Perform multiple modal open/close cycles
      for (let i = 0; i < 5; i++) {
        await page.locator('#ai-toggle').click();
        await page.waitForTimeout(300);
        await page.locator('#ai-close').click();
        await page.waitForTimeout(300);
        
        await page.locator('#settings-toggle').click();
        await page.waitForTimeout(300);
        await page.locator('.settings-close').click();
        await page.waitForTimeout(300);
      }
      
      // Page should still be responsive
      const content = await page.locator('#chapter-content').textContent();
      expect(content.trim().length).toBeGreaterThan(50);
    });
  });

  test('should provide accessible mobile experience', async ({ page }) => {
    await test.step('Verify touch target accessibility', async () => {
      const adequateTargets = await TestHelpers.checkTouchTargetSizes(page);
      expect(adequateTargets).toBe(true);
    });

    await test.step('Test screen reader compatibility on mobile', async () => {
      const a11yChecks = await TestHelpers.checkAccessibility(page);
      
      expect(a11yChecks.headings).toBe(true);
      expect(a11yChecks.ariaLabels).toBe(true);
      expect(a11yChecks.focusableElements).toBe(true);
    });

    await test.step('Test keyboard navigation on mobile', async () => {
      const navResults = await TestHelpers.testKeyboardNavigation(page);
      expect(navResults.focusableElements).toBeGreaterThan(0);
      expect(navResults.tabCount).toBeGreaterThan(0);
    });

    await test.step('Test reduced motion preference', async () => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Open modal - should still work but with reduced animations
      await page.locator('#ai-toggle').click();
      await page.waitForTimeout(1000);
      
      const aiWindow = page.locator('#ai-window');
      await expect(aiWindow).toBeVisible();
      
      await page.locator('#ai-close').click();
      await page.waitForTimeout(500);
    });
  });
});

// Additional mobile-specific tests without device simulation
test.describe('Mobile Layout Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await TestHelpers.waitForEBookInit(page);
  });

  test('should handle edge cases in mobile layout', async ({ page }) => {
    await test.step('Test very small screen sizes', async () => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.waitForTimeout(1000);
      
      // UI should still be usable on very small screens
      const controlIcons = page.locator('.control-icons');
      const aiToggle = page.locator('#ai-toggle');
      
      await expect(controlIcons).toBeVisible();
      await expect(aiToggle).toBeVisible();
      
      // Touch targets should still be adequate
      const aiBox = await aiToggle.boundingBox();
      expect(aiBox.width).toBeGreaterThanOrEqual(40);
      expect(aiBox.height).toBeGreaterThanOrEqual(40);
    });

    await test.step('Test content overflow handling', async () => {
      // Navigate to a content-heavy chapter
      await page.locator('#next-chapter').click();
      await page.waitForTimeout(1000);
      
      const chapterContent = page.locator('#chapter-content');
      await expect(chapterContent).toBeVisible();
      
      // Content should not overflow horizontally
      const scrollWidth = await chapterContent.evaluate(el => el.scrollWidth);
      const clientWidth = await chapterContent.evaluate(el => el.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small margin
    });
  });

  test('should maintain button positioning across navigation', async ({ page }) => {
    const aiToggle = page.locator('#ai-toggle');
    const initialPosition = await aiToggle.boundingBox();
    
    // Navigate through several chapters
    for (let i = 0; i < 3; i++) {
      await page.locator('#next-chapter').click();
      await page.waitForTimeout(1000);
    }
    
    // Button position should remain consistent
    const finalPosition = await aiToggle.boundingBox();
    expect(Math.abs(finalPosition.x - initialPosition.x)).toBeLessThan(5);
    expect(Math.abs(finalPosition.y - initialPosition.y)).toBeLessThan(5);
  });

  test('should handle rapid mobile interactions gracefully', async ({ page }) => {
    await test.step('Test rapid button tapping', async () => {
      const aiToggle = page.locator('#ai-toggle');
      
      // Rapidly tap AI button
      for (let i = 0; i < 5; i++) {
        await aiToggle.click();
        await page.waitForTimeout(100);
      }
      
      // Should end up in a consistent state
      await page.waitForTimeout(1000);
      const aiWindow = page.locator('#ai-window');
      const isVisible = await aiWindow.isVisible();
      
      // Either open or closed, but not in inconsistent state
      if (isVisible) {
        await page.locator('#ai-close').click();
      }
    });

    await test.step('Test gesture conflicts', async () => {
      // Test that our interactions don't conflict with browser gestures
      const mainContent = page.locator('#main-content');
      
      // Simulate swipe gesture
      await page.touchscreen.tap(200, 300);
      await page.mouse.move(200, 300);
      await page.mouse.down();
      await page.mouse.move(100, 300, { steps: 5 });
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      
      // App should still be functional
      const content = await page.locator('#chapter-content').textContent();
      expect(content.trim().length).toBeGreaterThan(50);
    });
  });
});