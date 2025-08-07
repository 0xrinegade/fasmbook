/**
 * Test utilities and helper functions for FASM eBook E2E tests
 */

export class TestHelpers {
  /**
   * Wait for the eBook to fully initialize
   */
  static async waitForEBookInit(page, timeout = 20000) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#navigation-panel', { timeout });
    await page.waitForSelector('#main-content', { timeout });
    await page.waitForTimeout(2000); // Allow more time for scripts to initialize
  }

  /**
   * Navigate to a specific chapter
   */
  static async navigateToChapter(page, chapterIndex = 0) {
    await page.waitForSelector('#toc-list a', { timeout: 20000 });
    const tocLinks = page.locator('#toc-list a');
    const linkCount = await tocLinks.count();
    
    if (linkCount > chapterIndex) {
      await tocLinks.nth(chapterIndex).click();
      await page.waitForSelector('#chapter-content h1, #chapter-content h2', { timeout: 20000 });
      await page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  /**
   * Open settings panel
   */
  static async openSettings(page) {
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
      await settingsPanel.waitFor({ state: 'visible', timeout: 5000 });
      return settingsPanel;
    }
    return null;
  }

  /**
   * Drag an element by a specified offset
   */
  static async dragElement(page, element, deltaX, deltaY) {
    const box = await element.boundingBox();
    if (!box) return false;

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + deltaX;
    const endY = startY + deltaY;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    
    return true;
  }

  /**
   * Check if element is within viewport boundaries
   */
  static async isWithinViewport(page, element) {
    const box = await element.boundingBox();
    if (!box) return false;

    const viewport = page.viewportSize();
    return (
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width &&
      box.y + box.height <= viewport.height
    );
  }

  /**
   * Test basic canvas drawing functionality
   */
  static async testCanvasDrawing(page) {
    const canvas = page.locator('#drawing-canvas');
    if (!(await canvas.isVisible())) return false;

    const box = await canvas.boundingBox();
    if (!box) return false;

    // Draw a simple line
    const startX = box.x + 50;
    const startY = box.y + 50;
    const endX = box.x + 150;
    const endY = box.y + 100;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    return true;
  }

  /**
   * Measure basic performance metrics
   */
  static async measurePerformance(page) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        // Core Web Vitals approximation
        timeToInteractive: navigation.domContentLoadedEventEnd - navigation.fetchStart
      };
    });
    
    return metrics;
  }

  /**
   * Check accessibility features
   */
  static async checkAccessibility(page) {
    const a11yChecks = await page.evaluate(() => {
      const results = {
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
        altText: Array.from(document.querySelectorAll('img')).every(img => 
          img.hasAttribute('alt') || img.hasAttribute('aria-label')
        ),
        ariaLabels: document.querySelectorAll('[aria-label]').length > 0,
        focusableElements: document.querySelectorAll('button, a, input, select, textarea').length > 0,
        skipLinks: document.querySelectorAll('a[href^="#"]').length > 0
      };
      
      return results;
    });
    
    return a11yChecks;
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page) {
    // Test tab navigation through focusable elements
    const focusableElements = await page.locator('button:visible, a:visible, input:visible, select:visible').count();
    
    let tabCount = 0;
    for (let i = 0; i < Math.min(focusableElements, 10); i++) {
      await page.keyboard.press('Tab');
      tabCount++;
      await page.waitForTimeout(100);
    }
    
    return { focusableElements, tabCount };
  }

  /**
   * Test mobile touch interactions
   */
  static async testTouchInteraction(page, element) {
    const box = await element.boundingBox();
    if (!box) return false;

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Simulate touch tap
    await page.touchscreen.tap(centerX, centerY);
    await page.waitForTimeout(300);
    
    return true;
  }

  /**
   * Verify responsive breakpoint behavior
   */
  static async testResponsiveBreakpoints(page, test) {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'large', width: 1920, height: 1080 }
    ];

    const results = {};

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(1000);

      // Test key UI elements visibility and positioning
      const navPanel = page.locator('#navigation-panel');
      const controlIcons = page.locator('.control-icons');
      const aiWindow = page.locator('#ai-window');

      results[bp.name] = {
        navPanelVisible: await navPanel.isVisible(),
        controlIconsVisible: await controlIcons.isVisible(),
        aiWindowVisible: await aiWindow.isVisible(),
        viewportSize: bp,
        // Test touch targets size on mobile
        touchTargetsAdequate: bp.width <= 768 ? 
          await this.checkTouchTargetSizes(page) : true
      };
    }

    return results;
  }

  /**
   * Check if touch targets meet accessibility guidelines (44px minimum)
   */
  static async checkTouchTargetSizes(page) {
    const touchTargets = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input, select, [role="button"]');
      const results = [];
      
      elements.forEach(el => {
        if (el.offsetParent !== null) { // Element is visible
          const rect = el.getBoundingClientRect();
          results.push({
            width: rect.width,
            height: rect.height,
            meets44px: rect.width >= 44 && rect.height >= 44
          });
        }
      });
      
      return results;
    });

    const inadequateTargets = touchTargets.filter(target => !target.meets44px);
    return inadequateTargets.length === 0;
  }

  /**
   * Test modal drag and drop functionality
   */
  static async testModalDragging(page, modalSelector, dragHandleSelector) {
    const modal = page.locator(modalSelector);
    const dragHandle = page.locator(dragHandleSelector);

    if (!(await modal.isVisible()) || !(await dragHandle.isVisible())) {
      return false;
    }

    const initialBounds = await modal.boundingBox();
    await this.dragElement(page, dragHandle, 100, 50);
    const finalBounds = await modal.boundingBox();

    const moved = (
      Math.abs(finalBounds.x - initialBounds.x) > 10 ||
      Math.abs(finalBounds.y - initialBounds.y) > 10
    );

    // Check if modal stays within viewport
    const withinBounds = await this.isWithinViewport(page, modal);

    return { moved, withinBounds, initialBounds, finalBounds };
  }

  /**
   * Close settings panel
   */
  static async closeSettings(page) {
    const settingsPanel = page.locator('#settings-panel, .settings-panel').first();
    if (await settingsPanel.isVisible()) {
      const closeBtn = settingsPanel.locator('.close-btn, [data-action="close"]').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      } else {
        // Try clicking settings button again
        const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
        await settingsBtn.click();
      }
      await page.waitForTimeout(500);
    }
  }

  /**
   * Open AI assistant
   */
  static async openAIAssistant(page) {
    const aiToggle = page.locator('#ai-toggle');
    if (await aiToggle.count() > 0) {
      await aiToggle.click();
      await page.waitForTimeout(500);
      
      const aiWindow = page.locator('#ai-window');
      await aiWindow.waitFor({ state: 'visible', timeout: 5000 });
      return aiWindow;
    }
    return null;
  }

  /**
   * Close AI assistant
   */
  static async closeAIAssistant(page) {
    const aiWindow = page.locator('#ai-window');
    if (await aiWindow.isVisible()) {
      const aiToggle = page.locator('#ai-toggle');
      await aiToggle.click();
      await page.waitForTimeout(500);
    }
  }

  /**
   * Enable drawing mode
   */
  static async enableDrawingMode(page) {
    const settingsPanel = await this.openSettings(page);
    if (settingsPanel) {
      const drawingCheckbox = settingsPanel.locator('input[type="checkbox"][name*="drawing"], #enable-drawing').first();
      if (await drawingCheckbox.count() > 0 && !await drawingCheckbox.isChecked()) {
        await drawingCheckbox.check();
        await page.waitForTimeout(500);
      }
      await this.closeSettings(page);
    }
  }

  /**
   * Check if element is within viewport bounds
   */
  static async isWithinViewport(page, element) {
    const viewport = page.viewportSize();
    const box = await element.boundingBox();
    
    if (!box) return false;
    
    return (
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width &&
      box.y + box.height <= viewport.height
    );
  }

  /**
   * Drag element from one position to another
   */
  static async dragElement(page, element, deltaX, deltaY) {
    const box = await element.boundingBox();
    if (!box) return false;

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + deltaX;
    const endY = startY + deltaY;

    await element.hover();
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.waitForTimeout(500);

    return true;
  }

  /**
   * Check if page has console errors
   */
  static async getConsoleErrors(page) {
    const errors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await page.screenshot({ path: `test-results/${filename}`, fullPage: true });
    return filename;
  }

  /**
   * Check color contrast ratio (simplified)
   */
  static async checkContrastRatio(page, element) {
    const contrast = await element.evaluate((el) => {
      const style = getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Convert RGB to luminance (simplified)
      const getLuminance = (rgb) => {
        const values = rgb.match(/\d+/g);
        if (!values || values.length < 3) return 0;
        
        const [r, g, b] = values.map(v => {
          const val = parseInt(v) / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      
      const fgLuminance = getLuminance(color);
      const bgLuminance = getLuminance(backgroundColor);
      
      const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                   (Math.min(fgLuminance, bgLuminance) + 0.05);
      
      return {
        ratio,
        meetsAA: ratio >= 4.5,
        meetsAAA: ratio >= 7,
        foreground: color,
        background: backgroundColor
      };
    });
    
    return contrast;
  }

  /**
   * Simulate different device orientations
   */
  static async rotateDevice(page, orientation = 'portrait') {
    const viewport = page.viewportSize();
    
    if (orientation === 'landscape') {
      await page.setViewportSize({ 
        width: Math.max(viewport.width, viewport.height), 
        height: Math.min(viewport.width, viewport.height) 
      });
    } else {
      await page.setViewportSize({ 
        width: Math.min(viewport.width, viewport.height), 
        height: Math.max(viewport.width, viewport.height) 
      });
    }
    
    await page.waitForTimeout(1000);
  }

  /**
   * Test performance metrics
   */
  static async measurePerformance(page) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalPageSize: navigation.transferSize || 0
      };
    });
    
    return metrics;
  }

  /**
   * Wait for animation to complete
   */
  static async waitForAnimation(page, element) {
    await element.evaluate((el) => {
      return new Promise((resolve) => {
        const handleAnimationEnd = () => {
          el.removeEventListener('animationend', handleAnimationEnd);
          el.removeEventListener('transitionend', handleAnimationEnd);
          resolve();
        };
        
        el.addEventListener('animationend', handleAnimationEnd);
        el.addEventListener('transitionend', handleAnimationEnd);
        
        // Fallback timeout
        setTimeout(resolve, 1000);
      });
    });
  }

  /**
   * Test localStorage persistence
   */
  static async testLocalStorage(page, key, value) {
    // Set value
    await page.evaluate(([k, v]) => {
      localStorage.setItem(k, JSON.stringify(v));
    }, [key, value]);
    
    // Reload page
    await page.reload();
    await this.waitForEBookInit(page);
    
    // Check if value persists
    const storedValue = await page.evaluate((k) => {
      const stored = localStorage.getItem(k);
      return stored ? JSON.parse(stored) : null;
    }, key);
    
    return storedValue;
  }
}

export class MockHelpers {
  /**
   * Mock network conditions
   */
  static async mockSlowNetwork(page) {
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  /**
   * Mock failed network requests
   */
  static async mockNetworkFailure(page, urlPattern) {
    await page.route(urlPattern, (route) => {
      route.abort('failed');
    });
  }

  /**
   * Mock beforeinstallprompt event for PWA testing
   */
  static async mockInstallPrompt(page) {
    await page.addInitScript(() => {
      window.deferredPrompt = {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });
  }
}

export const DEVICE_CONFIGS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  ultrawide: { width: 1920, height: 1080 }
};

export const TEST_TIMEOUTS = {
  short: 2000,
  medium: 5000,
  long: 10000,
  veryLong: 20000
};