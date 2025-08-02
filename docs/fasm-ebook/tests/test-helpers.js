/**
 * Test utilities and helper functions for FASM eBook E2E tests
 */

export class TestHelpers {
  /**
   * Wait for the eBook to fully initialize
   */
  static async waitForEBookInit(page, timeout = 10000) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#navigation-panel', { timeout });
    await page.waitForSelector('#main-content', { timeout });
    await page.waitForTimeout(1000); // Allow scripts to initialize
  }

  /**
   * Navigate to a specific chapter
   */
  static async navigateToChapter(page, chapterIndex = 0) {
    await page.waitForSelector('#toc-list a', { timeout: 10000 });
    const tocLinks = page.locator('#toc-list a');
    const linkCount = await tocLinks.count();
    
    if (linkCount > chapterIndex) {
      await tocLinks.nth(chapterIndex).click();
      await page.waitForSelector('#content-area h1, #content-area h2', { timeout: 10000 });
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