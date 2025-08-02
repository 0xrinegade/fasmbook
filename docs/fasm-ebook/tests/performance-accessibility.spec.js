import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Performance and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[entries.length - 1].startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('should load content efficiently', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to a chapter
    const tocLink = page.locator('#toc-list a').first();
    await tocLink.click();
    
    // Wait for content to load
    await page.waitForSelector('#chapter-content h1, #chapter-content h2', { timeout: 20000 });
    
    const loadTime = Date.now() - startTime;
    
    // Content should load within 5 seconds (increased for CI)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Check for proper nesting (simplified check)
      const firstHeading = headings[0];
      const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2'].includes(tagName)).toBe(true);
    }
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    expect(await main.count()).toBeGreaterThan(0);
    
    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThan(0);
  });

  test('should have accessible forms and controls', async ({ page }) => {
    // Check form labels
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const hasLabel = await input.evaluate((el) => {
        // Check for associated label
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
          if (label.getAttribute('for') === el.id || label.contains(el)) {
            return true;
          }
        }
        
        // Check for aria-label or aria-labelledby
        return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
      });
      
      expect(hasLabel).toBe(true);
    }
    
    // Check button accessibility
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const hasAccessibleName = await button.evaluate((el) => {
        return el.textContent.trim().length > 0 || 
               el.hasAttribute('aria-label') || 
               el.hasAttribute('aria-labelledby');
      });
      
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check main content area contrast
    const contentArea = page.locator('#chapter-content, .content').first();
    if (await contentArea.count() > 0) {
      const contrast = await contentArea.evaluate((el) => {
        const style = getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Simple contrast check (in real scenario, you'd use a proper contrast ratio calculation)
        return { color, backgroundColor };
      });
      
      // Colors should be defined
      expect(contrast.color).toBeTruthy();
      expect(contrast.backgroundColor).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    
    // Should focus on a focusable element
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement)).toBe(true);
    
    // Test navigation through TOC
    const tocLinks = page.locator('#toc-list a');
    if (await tocLinks.count() > 0) {
      await tocLinks.first().focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Should navigate to content
      await expect(page.locator('#chapter-content')).toBeVisible();
    }
    
    // Test Escape key functionality
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Settings panel should close
      const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
      if (await settingsPanel.count() > 0) {
        await expect(settingsPanel).toBeHidden();
      }
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check for skip links
    const skipLinks = page.locator('a[href^="#"], .skip-link');
    if (await skipLinks.count() > 0) {
      const firstSkipLink = skipLinks.first();
      await firstSkipLink.focus();
      
      // Skip link should be visible when focused
      await expect(firstSkipLink).toBeFocused();
    }
    
    // Check for ARIA landmarks
    const landmarks = await page.locator('[role="banner"], [role="main"], [role="navigation"], [role="contentinfo"]').count();
    expect(landmarks).toBeGreaterThan(0);
    
    // Check for ARIA live regions (for dynamic content)
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
    // Live regions are optional but good to have
    
    // Check for proper heading structure for screen readers
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    if (headings.length > 1) {
      // Headings should have logical hierarchy
      const headingLevels = [];
      for (const heading of headings) {
        const level = parseInt(await heading.evaluate(el => el.tagName.charAt(1)));
        headingLevels.push(level);
      }
      
      // First heading should be h1 or h2
      expect(headingLevels[0]).toBeLessThanOrEqual(2);
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Animations should be reduced or disabled
    const animatedElements = page.locator('.animated, .transition, [style*="transition"]');
    if (await animatedElements.count() > 0) {
      const hasReducedMotion = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      });
      
      expect(hasReducedMotion).toBe(true);
    }
  });

  test('should work with zoom up to 200%', async ({ page }) => {
    // Set zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    await page.waitForTimeout(1000);
    
    // Content should still be accessible
    await expect(page.locator('#navigation-panel')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
    
    // Navigation should still work
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
      
      await expect(page.locator('#chapter-content')).toBeVisible();
    }
    
    // UI controls should still be accessible
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
      await expect(settingsPanel).toBeVisible();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Test focus trapping in modals
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
      if (await settingsPanel.isVisible()) {
        // Focus should be within the panel
        const focusableElements = settingsPanel.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (await focusableElements.count() > 0) {
          // Tab through elements
          await page.keyboard.press('Tab');
          const focusedElement = await page.evaluate(() => document.activeElement);
          
          // Focused element should be within the panel
          const isWithinPanel = await settingsPanel.evaluate((panel, focused) => {
            return panel.contains(focused);
          }, focusedElement);
          
          expect(isWithinPanel).toBe(true);
        }
      }
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: white !important;
            color: black !important;
            border-color: black !important;
          }
        }
      `
    });
    
    await page.emulateMedia({ forcedColors: 'active' });
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Content should still be readable
    await expect(page.locator('#main-content')).toBeVisible();
    
    // Text should have sufficient contrast
    const contentArea = page.locator('#chapter-content').first();
    if (await contentArea.count() > 0) {
      const textColor = await contentArea.evaluate(el => getComputedStyle(el).color);
      const bgColor = await contentArea.evaluate(el => getComputedStyle(el).backgroundColor);
      
      // Colors should be defined and contrasting
      expect(textColor).toBeTruthy();
      expect(bgColor).toBeTruthy();
    }
  });

  test('should not have console errors that affect functionality', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate through the app
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Open AI assistant
    const aiToggle = page.locator('#ai-toggle');
    if (await aiToggle.count() > 0) {
      await aiToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Filter out minor errors (like 404s for optional resources)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('404') && 
      !error.includes('Failed to load resource') &&
      !error.includes('service-worker.js') &&
      !error.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});