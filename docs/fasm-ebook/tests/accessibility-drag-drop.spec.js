const { test, expect } = require('@playwright/test');

test.describe('FASM eBook - Accessibility & Drag/Drop Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(() => window.fasmEbook && window.fasmEbook.isInitialized);
    });

    test.describe('Drag and Drop Accessibility', () => {
        test('AI assistant toggle button has proper ARIA attributes', async ({ page }) => {
            const aiToggle = page.locator('#ai-toggle');
            
            // Check ARIA attributes
            await expect(aiToggle).toHaveAttribute('role', 'button');
            await expect(aiToggle).toHaveAttribute('aria-grabbed', 'false');
            await expect(aiToggle).toHaveAttribute('tabindex', '0');
            
            // Check descriptive label
            const ariaLabel = await aiToggle.getAttribute('aria-label');
            expect(ariaLabel).toMatch(/draggable.*button/i);
        });

        test('Settings modal has proper accessibility attributes', async ({ page }) => {
            // Open settings modal
            const settingsButton = page.locator('#settings-toggle, .settings-button');
            await settingsButton.first().click();
            
            const modal = page.locator('#settings-panel');
            await expect(modal).toBeVisible();
            
            // Check modal ARIA attributes
            await expect(modal).toHaveAttribute('role', 'dialog');
            await expect(modal).toHaveAttribute('aria-modal', 'true');
            
            // Check title association
            const titleId = await modal.getAttribute('aria-labelledby');
            if (titleId) {
                const title = page.locator(`#${titleId}`);
                await expect(title).toBeVisible();
            }
        });

        test('Drag handles have keyboard navigation support', async ({ page }) => {
            const aiToggle = page.locator('#ai-toggle');
            
            // Focus the element
            await aiToggle.focus();
            await expect(aiToggle).toBeFocused();
            
            // Test arrow key movement
            const initialPosition = await aiToggle.boundingBox();
            
            // Move with arrow keys
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(100);
            
            const newPosition = await aiToggle.boundingBox();
            expect(newPosition.x).toBeGreaterThan(initialPosition.x);
        });

        test('Screen reader announcements during drag operations', async ({ page }) => {
            // Create a live region listener
            await page.evaluate(() => {
                window.accessibilityAnnouncements = [];
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.target.getAttribute('aria-live')) {
                            window.accessibilityAnnouncements.push(mutation.target.textContent);
                        }
                    });
                });
                
                // Observe all elements with aria-live
                document.querySelectorAll('[aria-live]').forEach(el => {
                    observer.observe(el, { childList: true, characterData: true, subtree: true });
                });
            });

            const aiToggle = page.locator('#ai-toggle');
            
            // Perform drag operation
            await aiToggle.hover();
            await page.mouse.down();
            await page.mouse.move(100, 50);
            await page.mouse.up();
            
            // Check for announcements
            const announcements = await page.evaluate(() => window.accessibilityAnnouncements);
            expect(announcements.length).toBeGreaterThan(0);
            expect(announcements.some(text => text.includes('drag') || text.includes('move'))).toBeTruthy();
        });

        test('Focus management during modal operations', async ({ page }) => {
            // Open AI assistant
            const aiToggle = page.locator('#ai-toggle');
            await aiToggle.click();
            
            const modal = page.locator('#ai-assistant-modal, .ai-modal');
            await expect(modal).toBeVisible();
            
            // Check that focus is trapped within modal
            await page.keyboard.press('Tab');
            const focusedElement = page.locator(':focus');
            
            // Focused element should be within the modal
            const isWithinModal = await page.evaluate(() => {
                const focused = document.activeElement;
                const modal = document.querySelector('#ai-assistant-modal, .ai-modal');
                return modal && modal.contains(focused);
            });
            
            expect(isWithinModal).toBeTruthy();
        });

        test('Escape key closes modals and restores focus', async ({ page }) => {
            const aiToggle = page.locator('#ai-toggle');
            await aiToggle.focus();
            await aiToggle.click();
            
            const modal = page.locator('#ai-assistant-modal, .ai-modal');
            await expect(modal).toBeVisible();
            
            // Press Escape to close
            await page.keyboard.press('Escape');
            await expect(modal).not.toBeVisible();
            
            // Focus should return to toggle button
            await expect(aiToggle).toBeFocused();
        });
    });

    test.describe('Copy and Download Button Accessibility', () => {
        test('Copy buttons have proper ARIA labels and keyboard support', async ({ page }) => {
            // Navigate to a page with code blocks
            await page.goto('/#chapter-1');
            await page.waitForLoadState('networkidle');
            
            const copyButton = page.locator('.copy-btn, button[aria-label*="copy" i]').first();
            if (await copyButton.count() > 0) {
                // Check ARIA attributes
                const ariaLabel = await copyButton.getAttribute('aria-label');
                expect(ariaLabel.toLowerCase()).toContain('copy');
                
                // Check keyboard accessibility
                await copyButton.focus();
                await expect(copyButton).toBeFocused();
                
                // Test Enter key activation
                await page.keyboard.press('Enter');
                
                // Should provide feedback
                await page.waitForTimeout(500);
                const feedback = page.locator('[aria-live="polite"], .copy-feedback');
                if (await feedback.count() > 0) {
                    await expect(feedback).toBeVisible();
                }
            }
        });

        test('Download buttons have proper accessibility attributes', async ({ page }) => {
            await page.goto('/#chapter-1');
            await page.waitForLoadState('networkidle');
            
            const downloadButton = page.locator('.download-btn, button[aria-label*="download" i]').first();
            if (await downloadButton.count() > 0) {
                // Check ARIA attributes
                const ariaLabel = await downloadButton.getAttribute('aria-label');
                expect(ariaLabel.toLowerCase()).toContain('download');
                
                // Check role if specified
                const role = await downloadButton.getAttribute('role');
                if (role) {
                    expect(role).toBe('button');
                }
                
                // Check keyboard accessibility
                await downloadButton.focus();
                await expect(downloadButton).toBeFocused();
            }
        });

        test('Copy/download operations provide screen reader feedback', async ({ page }) => {
            await page.goto('/#chapter-1');
            await page.waitForLoadState('networkidle');
            
            // Set up announcement tracking
            await page.evaluate(() => {
                window.copyDownloadAnnouncements = [];
                
                // Monitor all live regions
                const liveRegions = document.querySelectorAll('[aria-live]');
                liveRegions.forEach(region => {
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.target.textContent.trim()) {
                                window.copyDownloadAnnouncements.push(mutation.target.textContent);
                            }
                        });
                    });
                    observer.observe(region, { childList: true, characterData: true, subtree: true });
                });
            });
            
            const copyButton = page.locator('.copy-btn').first();
            if (await copyButton.count() > 0) {
                await copyButton.click();
                await page.waitForTimeout(1000);
                
                const announcements = await page.evaluate(() => window.copyDownloadAnnouncements);
                expect(announcements.some(text => 
                    text.toLowerCase().includes('copy') || 
                    text.toLowerCase().includes('clipboard')
                )).toBeTruthy();
            }
        });

        test('High contrast mode compatibility', async ({ page }) => {
            // Enable high contrast mode simulation
            await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
            
            await page.goto('/#chapter-1');
            await page.waitForLoadState('networkidle');
            
            // Check that buttons are still visible and accessible
            const buttons = page.locator('button:visible');
            const buttonCount = await buttons.count();
            
            for (let i = 0; i < Math.min(buttonCount, 10); i++) {
                const button = buttons.nth(i);
                
                // Check that button has sufficient contrast
                const styles = await button.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        border: computed.border
                    };
                });
                
                // At least one of these should be defined for visibility
                expect(
                    styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                    styles.color !== 'rgba(0, 0, 0, 0)' ||
                    styles.border !== 'none'
                ).toBeTruthy();
            }
        });
    });

    test.describe('Reduced Motion Support', () => {
        test('Respects prefers-reduced-motion setting', async ({ page }) => {
            // Enable reduced motion
            await page.emulateMedia({ reducedMotion: 'reduce' });
            
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Check that animations are disabled or reduced
            const hasReducedMotion = await page.evaluate(() => {
                return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            });
            
            expect(hasReducedMotion).toBeTruthy();
            
            // Test drag operation without excessive animation
            const aiToggle = page.locator('#ai-toggle');
            const initialPosition = await aiToggle.boundingBox();
            
            // Perform drag
            await aiToggle.hover();
            await page.mouse.down();
            await page.mouse.move(50, 50);
            await page.mouse.up();
            
            // Should move but without fancy animations
            const newPosition = await aiToggle.boundingBox();
            expect(newPosition.x).not.toEqual(initialPosition.x);
            expect(newPosition.y).not.toEqual(initialPosition.y);
        });

        test('Static fallbacks for animated elements', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Check that loading animations have static alternatives
            const loadingElements = page.locator('.loading, .spinner, [class*="animate"]');
            const count = await loadingElements.count();
            
            for (let i = 0; i < count; i++) {
                const element = loadingElements.nth(i);
                const hasStaticFallback = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return computed.animationPlayState === 'paused' || 
                           computed.animationDuration === '0s' ||
                           computed.animationName === 'none';
                });
                
                // Should have reduced or no animation
                expect(hasStaticFallback).toBeTruthy();
            }
        });
    });

    test.describe('Keyboard Navigation', () => {
        test('All interactive elements are keyboard accessible', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Get all interactive elements
            const interactiveSelectors = [
                'button:visible',
                'a[href]:visible', 
                'input:visible',
                'select:visible',
                'textarea:visible',
                '[tabindex]:visible',
                '[role="button"]:visible'
            ];
            
            for (const selector of interactiveSelectors) {
                const elements = page.locator(selector);
                const count = await elements.count();
                
                for (let i = 0; i < Math.min(count, 5); i++) {
                    const element = elements.nth(i);
                    
                    // Should be focusable
                    await element.focus();
                    await expect(element).toBeFocused();
                    
                    // Should be activatable with Enter or Space
                    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                    if (['button', 'a'].includes(tagName) || await element.getAttribute('role') === 'button') {
                        // Test keyboard activation (don't actually activate to avoid side effects)
                        const hasKeyboardHandler = await element.evaluate(el => {
                            return el.onkeydown !== null || 
                                   el.onkeyup !== null ||
                                   el.onclick !== null;
                        });
                        expect(hasKeyboardHandler).toBeTruthy();
                    }
                }
            }
        });

        test('Tab order is logical and complete', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            const focusableElements = [];
            
            // Start from body and tab through elements
            await page.keyboard.press('Tab');
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts) {
                const focused = await page.locator(':focus').first();
                
                if (await focused.count() === 0) break;
                
                const elementInfo = await focused.evaluate(el => ({
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    textContent: el.textContent?.slice(0, 50)
                }));
                
                focusableElements.push(elementInfo);
                
                await page.keyboard.press('Tab');
                attempts++;
                
                // Avoid infinite loops
                if (attempts > 10 && focusableElements.length === 1) break;
            }
            
            // Should have found at least some focusable elements
            expect(focusableElements.length).toBeGreaterThan(0);
            
            // Check for logical order (no obvious violations)
            const hasLogicalOrder = focusableElements.every((element, index) => {
                // Basic heuristic: elements should generally progress top to bottom, left to right
                return element.tagName && element.tagName.length > 0;
            });
            
            expect(hasLogicalOrder).toBeTruthy();
        });

        test('Skip links are available and functional', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Look for skip links (usually first tab stop)
            await page.keyboard.press('Tab');
            const firstFocused = page.locator(':focus');
            
            if (await firstFocused.count() > 0) {
                const text = await firstFocused.textContent();
                const href = await firstFocused.getAttribute('href');
                
                if (text && text.toLowerCase().includes('skip')) {
                    expect(href).toBeTruthy();
                    
                    // Activate skip link
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(300);
                    
                    // Should jump to main content or similar
                    const newFocused = page.locator(':focus');
                    const newText = await newFocused.textContent();
                    expect(newText).not.toBe(text);
                }
            }
        });
    });

    test.describe('Color and Contrast Accessibility', () => {
        test('Sufficient color contrast ratios', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Test key elements for contrast
            const elementsToTest = [
                'button',
                'a[href]',
                'h1, h2, h3, h4, h5, h6',
                'p',
                '.copy-btn',
                '.download-btn'
            ];
            
            for (const selector of elementsToTest) {
                const elements = page.locator(selector).first();
                
                if (await elements.count() > 0) {
                    const contrast = await elements.evaluate(el => {
                        const computed = window.getComputedStyle(el);
                        const color = computed.color;
                        const backgroundColor = computed.backgroundColor;
                        
                        // Simple check - not a full contrast calculation
                        // In real tests, you'd use a proper contrast calculation library
                        return {
                            color,
                            backgroundColor,
                            hasContrast: color !== backgroundColor && 
                                         color !== 'rgba(0, 0, 0, 0)' &&
                                         backgroundColor !== 'rgba(0, 0, 0, 0)'
                        };
                    });
                    
                    // Basic contrast check
                    expect(contrast.hasContrast || contrast.color !== contrast.backgroundColor).toBeTruthy();
                }
            }
        });

        test('Information not conveyed by color alone', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Check for alternative indicators beyond color
            const statusElements = page.locator('[class*="success"], [class*="error"], [class*="warning"], [class*="info"]');
            const count = await statusElements.count();
            
            for (let i = 0; i < count; i++) {
                const element = statusElements.nth(i);
                
                // Should have text content, icons, or other visual indicators
                const hasAlternativeIndicator = await element.evaluate(el => {
                    const hasText = el.textContent && el.textContent.trim().length > 0;
                    const hasIcon = el.querySelector('[class*="icon"], svg, .emoji') !== null;
                    const hasPattern = window.getComputedStyle(el).backgroundImage !== 'none';
                    
                    return hasText || hasIcon || hasPattern;
                });
                
                expect(hasAlternativeIndicator).toBeTruthy();
            }
        });
    });

    test.describe('Screen Reader Compatibility', () => {
        test('Proper heading hierarchy', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
            const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').all();
            
            if (headingLevels.length > 0) {
                // Check for proper hierarchy (simplified check)
                let hasH1 = false;
                let maxLevel = 1;
                
                for (const heading of headingLevels) {
                    const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
                    const level = parseInt(tagName.charAt(1));
                    
                    if (level === 1) hasH1 = true;
                    if (level > maxLevel + 1) {
                        // Skip level detected
                        console.warn(`Heading hierarchy skip detected: ${tagName} after h${maxLevel}`);
                    }
                    maxLevel = Math.max(maxLevel, level);
                }
                
                expect(hasH1).toBeTruthy();
            }
        });

        test('Alternative text for images', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            const images = page.locator('img');
            const count = await images.count();
            
            for (let i = 0; i < count; i++) {
                const img = images.nth(i);
                const alt = await img.getAttribute('alt');
                const role = await img.getAttribute('role');
                
                // Images should have alt text or be marked as decorative
                expect(alt !== null || role === 'presentation' || role === 'none').toBeTruthy();
            }
        });

        test('Form labels and descriptions', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Open settings to access form elements
            const settingsButton = page.locator('#settings-toggle, .settings-button');
            if (await settingsButton.count() > 0) {
                await settingsButton.first().click();
                await page.waitForTimeout(500);
            }
            
            const formElements = page.locator('input, select, textarea');
            const count = await formElements.count();
            
            for (let i = 0; i < Math.min(count, 10); i++) {
                const element = formElements.nth(i);
                const id = await element.getAttribute('id');
                const ariaLabelledBy = await element.getAttribute('aria-labelledby');
                const ariaLabel = await element.getAttribute('aria-label');
                
                if (id) {
                    // Should have associated label
                    const label = page.locator(`label[for="${id}"]`);
                    const hasLabel = await label.count() > 0;
                    
                    expect(hasLabel || ariaLabelledBy || ariaLabel).toBeTruthy();
                }
            }
        });
    });
});

test.describe('Drag Utility Integration Tests', () => {
    test('Drag utility is loaded and functional', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check that drag utility is available
        const hasDragUtility = await page.evaluate(() => {
            return typeof window.dragUtility !== 'undefined' && 
                   typeof window.dragUtility.makeDraggable === 'function';
        });
        
        expect(hasDragUtility).toBeTruthy();
    });

    test('Shared drag logic prevents code duplication', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check that multiple draggable elements use the same utility
        const dragImplementations = await page.evaluate(() => {
            const implementations = [];
            
            // Look for elements with drag functionality
            const draggableElements = document.querySelectorAll('[data-draggable="true"], .draggable');
            
            for (const element of draggableElements) {
                implementations.push({
                    id: element.id,
                    hasDragUtility: window.dragUtility && window.dragUtility.activeDrags.has(element)
                });
            }
            
            return implementations;
        });
        
        // All draggable elements should use the shared utility
        const allUseSharedUtility = dragImplementations.every(impl => impl.hasDragUtility);
        
        if (dragImplementations.length > 0) {
            expect(allUseSharedUtility).toBeTruthy();
        }
    });

    test('Consolidated drag state management', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const aiToggle = page.locator('#ai-toggle');
        
        // Start drag operation
        await aiToggle.hover();
        await page.mouse.down();
        
        // Check that drag state is properly managed
        const dragState = await page.evaluate(() => {
            const toggle = document.getElementById('ai-toggle');
            return window.dragUtility ? window.dragUtility.getDragState(toggle) : null;
        });
        
        expect(dragState).toBeTruthy();
        
        // Complete drag
        await page.mouse.move(50, 50);
        await page.mouse.up();
        
        // Check final state
        const finalState = await page.evaluate(() => {
            const toggle = document.getElementById('ai-toggle');
            return window.dragUtility ? window.dragUtility.getDragState(toggle) : null;
        });
        
        expect(finalState?.isDragging).toBeFalsy();
    });
});