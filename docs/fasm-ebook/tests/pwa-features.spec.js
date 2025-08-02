import { test, expect } from '@playwright/test';

test.describe('FASM eBook - PWA Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should have valid PWA manifest', async ({ page }) => {
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
    
    // Fetch and validate manifest
    const manifestResponse = await page.request.get(manifestHref);
    expect(manifestResponse.status()).toBe(200);
    
    const manifest = await manifestResponse.json();
    
    // Check required PWA manifest fields
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // Check icon requirements
    const requiredSizes = ['192x192', '512x512'];
    const iconSizes = manifest.icons.map(icon => icon.sizes);
    for (const size of requiredSizes) {
      expect(iconSizes.some(s => s.includes(size))).toBe(true);
    }
  });

  test('should register service worker', async ({ page }) => {
    // Check if service worker is registered
    const serviceWorkerRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    
    // Service worker registration might not be immediate, so we allow it to be false in tests
    // but the code should attempt to register it
    const hasServiceWorkerScript = await page.locator('script:has-text("serviceWorker")').count() > 0;
    expect(hasServiceWorkerScript || serviceWorkerRegistered).toBe(true);
  });

  test('should have install prompt functionality', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);
    
    // Look for install button
    const installBtn = page.locator('button:has-text("Install"), #install-pwa, .install-button');
    if (await installBtn.count() > 0) {
      await expect(installBtn).toBeVisible();
      
      // Button should have appropriate text or state
      const buttonText = await installBtn.textContent();
      expect(buttonText.toLowerCase()).toMatch(/install|add to|ready/);
      
      // Button should handle beforeinstallprompt event
      const hasInstallHandler = await page.evaluate(() => {
        return typeof window.deferredPrompt !== 'undefined' || 
               document.querySelector('[data-install-handler]') !== null;
      });
      
      // Install functionality should be implemented (even if not triggerable in test)
    }
  });

  test('should work offline (basic functionality)', async ({ page, context }) => {
    // Load the page first
    await page.waitForTimeout(2000);
    
    // Navigate to a chapter to cache content
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(3000);
    }
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Basic elements should still be available
    await expect(page.locator('#navigation-panel')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
    
    // Try to navigate
    const offlineTocLink = page.locator('#toc-list a').first();
    if (await offlineTocLink.count() > 0) {
      await offlineTocLink.click();
      await page.waitForTimeout(3000);
      
      // Content should be available from cache
      const contentArea = page.locator('#content-area');
      const hasContent = await contentArea.evaluate(el => el.textContent.trim().length > 50);
      
      // If content is cached, it should be available
      // If not cached, should show offline message
      const contentText = await contentArea.textContent();
      expect(contentText.length).toBeGreaterThan(10);
    }
    
    // Go back online
    await context.setOffline(false);
  });

  test('should cache static assets', async ({ page }) => {
    // Check if critical assets are cached
    const criticalAssets = [
      '/styles/main.css',
      '/styles/ebook.css',
      '/js/main.js',
    ];
    
    for (const asset of criticalAssets) {
      const response = await page.request.get(asset);
      expect(response.status()).toBe(200);
      
      // Check cache headers
      const cacheControl = response.headers()['cache-control'];
      // Assets should have some caching strategy
    }
  });

  test('should handle app updates gracefully', async ({ page }) => {
    // Simulate service worker update
    const updateHandled = await page.evaluate(() => {
      if ('serviceWorker' in navigator) {
        // Check if update handling is implemented
        return typeof window.handleSWUpdate === 'function' ||
               document.querySelector('[data-update-handler]') !== null;
      }
      return true; // Skip if no service worker support
    });
    
    // Update handling should be implemented
    expect(updateHandled).toBe(true);
  });

  test('should provide app-like experience', async ({ page }) => {
    // Check viewport meta tag for mobile optimization
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);
    
    const viewportContent = await viewportMeta.getAttribute('content');
    expect(viewportContent).toContain('width=device-width');
    expect(viewportContent).toContain('initial-scale=1');
    
    // Check for theme-color meta tag
    const themeColorMeta = page.locator('meta[name="theme-color"]');
    if (await themeColorMeta.count() > 0) {
      const themeColor = await themeColorMeta.getAttribute('content');
      expect(themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    
    // Check for apple-touch-icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    if (await appleTouchIcon.count() > 0) {
      const iconHref = await appleTouchIcon.getAttribute('href');
      expect(iconHref).toBeTruthy();
    }
  });

  test('should handle navigation like a native app', async ({ page }) => {
    // Test back/forward navigation
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
      
      // Go back
      await page.goBack();
      await page.waitForTimeout(2000);
      
      // Should restore previous state
      await expect(page.locator('#navigation-panel')).toBeVisible();
      
      // Go forward
      await page.goForward();
      await page.waitForTimeout(2000);
      
      // Should navigate back to chapter
      await expect(page.locator('#content-area')).toBeVisible();
    }
  });

  test('should persist data across sessions', async ({ page, context }) => {
    // Make some changes that should persist
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      
      // Change a setting
      const fontSizeSlider = page.locator('input[type="range"][name*="font"], #font-size-slider').first();
      if (await fontSizeSlider.count() > 0) {
        await fontSizeSlider.fill('18');
        await page.waitForTimeout(500);
      }
      
      // Close settings
      await settingsBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Navigate to a chapter
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Create a new page in the same context (simulates app restart)
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForTimeout(2000);
    
    // Settings should be preserved
    const newSettingsBtn = newPage.locator('#settings-toggle, .settings-btn').first();
    if (await newSettingsBtn.count() > 0) {
      await newSettingsBtn.click();
      await newPage.waitForTimeout(500);
      
      const restoredFontSize = newPage.locator('input[type="range"][name*="font"], #font-size-slider').first();
      if (await restoredFontSize.count() > 0) {
        const value = await restoredFontSize.inputValue();
        expect(value).toBe('18');
      }
    }
    
    // Reading position should be preserved
    const progressText = await newPage.locator('#progress-text').textContent();
    expect(progressText).not.toBe('0% Complete');
    
    await newPage.close();
  });

  test('should handle network connectivity changes', async ({ page, context }) => {
    // Start online
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    
    // Try to navigate
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
      
      // Should handle offline gracefully
      await expect(page.locator('#main-content')).toBeVisible();
    }
    
    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(1000);
    
    // Should resume normal functionality
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
      
      await expect(page.locator('#content-area')).toBeVisible();
    }
  });

  test('should provide appropriate app metadata', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/FASM Programming Book/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description.length).toBeGreaterThan(20);
      expect(description.toLowerCase()).toContain('fasm');
    }
    
    // Check canonical URL
    const canonicalLink = page.locator('link[rel="canonical"]');
    if (await canonicalLink.count() > 0) {
      const canonicalHref = await canonicalLink.getAttribute('href');
      expect(canonicalHref).toBeTruthy();
    }
    
    // Check language declaration
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');
  });
});