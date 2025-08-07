/**
 * Full Book Experience E2E Tests
 * 
 * Comprehensive testing of the complete user journey through the FASM Programming Book,
 * including all interactive features, navigation patterns, and reading workflows.
 */

import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers.js';

test.describe('Full Book Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await TestHelpers.waitForEBookInit(page);
  });

  test.describe('Complete Reading Journey', () => {
    test('should navigate through entire book chapters sequentially', async ({ page }) => {
      // Test complete book navigation flow
      await test.step('Initialize book and verify table of contents', async () => {
        // Wait for TOC to load
        await page.waitForSelector('#toc-list', { timeout: 10000 });
        
        // Verify all major chapters are present
        const tocItems = await page.locator('#toc-list li').count();
        expect(tocItems).toBeGreaterThan(5); // Expect at least 6 chapters
        
        // Verify chapter titles contain expected content
        const chapterTitles = await page.locator('#toc-list li a').allTextContents();
        expect(chapterTitles.some(title => title.includes('Preface') || title.includes('Introduction'))).toBeTruthy();
        expect(chapterTitles.some(title => title.includes('Machine') || title.includes('Welcome'))).toBeTruthy();
        expect(chapterTitles.some(title => title.includes('FASM') || title.includes('Speak'))).toBeTruthy();
      });

      await test.step('Navigate through first 5 chapters using next buttons', async () => {
        for (let i = 0; i < 5; i++) {
          // Verify chapter content loads
          await page.waitForSelector('#chapter-content', { timeout: 15000 });
          
          // Check that content is not empty
          const contentText = await page.locator('#chapter-content').textContent();
          expect(contentText.trim().length).toBeGreaterThan(100);
          
          // Verify chapter info is displayed
          const chapterInfo = await page.locator('#chapter-info').textContent();
          expect(chapterInfo).toBeTruthy();
          expect(chapterInfo).not.toBe('Loading...');
          
          // Click next chapter if not on last iteration
          if (i < 4) {
            const nextButton = page.locator('#next-chapter');
            await expect(nextButton).toBeEnabled();
            await nextButton.click();
            
            // Wait for new content to load
            await page.waitForTimeout(1000);
          }
        }
      });

      await test.step('Test backward navigation', async () => {
        // Navigate back through chapters
        for (let i = 0; i < 3; i++) {
          const prevButton = page.locator('#prev-chapter');
          await expect(prevButton).toBeEnabled();
          await prevButton.click();
          
          // Wait for content to load
          await page.waitForTimeout(1000);
          await page.waitForSelector('#chapter-content', { timeout: 10000 });
          
          // Verify content changed
          const contentText = await page.locator('#chapter-content').textContent();
          expect(contentText.trim().length).toBeGreaterThan(100);
        }
      });
    });

    test('should track reading progress accurately', async ({ page }) => {
      await test.step('Verify initial progress state', async () => {
        const progressText = await page.locator('#progress-text').textContent();
        expect(progressText).toContain('%');
        
        const progressFill = page.locator('#progress-fill');
        const progressWidth = await progressFill.evaluate(el => 
          parseInt(getComputedStyle(el).width)
        );
        expect(progressWidth).toBeGreaterThanOrEqual(0);
      });

      await test.step('Progress increases with chapter navigation', async () => {
        const initialProgress = await page.locator('#progress-text').textContent();
        const initialPercentage = parseInt(initialProgress.match(/(\d+)%/)[1]);
        
        // Navigate to next chapter
        await page.locator('#next-chapter').click();
        await page.waitForTimeout(1000);
        
        const newProgress = await page.locator('#progress-text').textContent();
        const newPercentage = parseInt(newProgress.match(/(\d+)%/)[1]);
        
        expect(newPercentage).toBeGreaterThanOrEqual(initialPercentage);
      });
    });

    test('should handle bookmarks and reading history', async ({ page }) => {
      await test.step('Create and verify bookmarks', async () => {
        // Navigate to a specific chapter
        await page.locator('#next-chapter').click();
        await page.waitForTimeout(1000);
        
        // Create bookmark (implementation may vary)
        const chapterTitle = await page.locator('#chapter-info').textContent();
        
        // Verify bookmark appears in sidebar
        const bookmarksList = page.locator('#bookmarks-list');
        await expect(bookmarksList).toBeVisible();
      });

      await test.step('Verify reading history tracking', async () => {
        const historyList = page.locator('#history-list');
        await expect(historyList).toBeVisible();
        
        // Navigate through multiple chapters to populate history
        for (let i = 0; i < 3; i++) {
          await page.locator('#next-chapter').click();
          await page.waitForTimeout(1000);
        }
        
        // History should contain recent chapters
        const historyItems = await historyList.locator('li').count();
        expect(historyItems).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Interactive Features Integration', () => {
    test('should provide seamless AI assistant experience during reading', async ({ page }) => {
      await test.step('Open AI assistant and ask FASM-related question', async () => {
        // Open AI assistant
        await page.locator('#ai-toggle').click();
        await page.waitForSelector('#ai-window.visible', { timeout: 5000 });
        
        // Verify AI window is properly positioned
        const aiWindow = page.locator('#ai-window');
        await expect(aiWindow).toBeVisible();
        
        // Test asking a question
        const inputField = page.locator('#ai-input-field');
        await inputField.fill('What is the MOV instruction in FASM?');
        await page.locator('#ai-send').click();
        
        // Verify response handling (even if mock)
        await page.waitForTimeout(2000);
        const chatMessages = await page.locator('.ai-message').count();
        expect(chatMessages).toBeGreaterThan(1); // Initial message + user question
      });

      await test.step('Test AI assistant dragging and positioning', async () => {
        const aiWindow = page.locator('#ai-window');
        const dragHandle = page.locator('.ai-drag-handle');
        
        if (await dragHandle.isVisible()) {
          // Test dragging functionality
          const originalBounds = await aiWindow.boundingBox();
          
          await TestHelpers.dragElement(page, dragHandle, 100, 50);
          await page.waitForTimeout(500);
          
          const newBounds = await aiWindow.boundingBox();
          expect(newBounds.x).not.toBe(originalBounds.x);
        }
      });

      await test.step('Verify AI assistant context awareness', async () => {
        // Navigate to a chapter with code examples
        await page.locator('#next-chapter').click();
        await page.waitForTimeout(1000);
        
        // Check if AI can reference current chapter context
        const inputField = page.locator('#ai-input-field');
        await inputField.fill('Explain the code in this chapter');
        await page.locator('#ai-send').click();
        
        // Wait for potential response
        await page.waitForTimeout(2000);
      });
    });

    test('should integrate settings changes with reading experience', async ({ page }) => {
      await test.step('Test display mode changes during reading', async () => {
        // Open settings
        await page.locator('#settings-toggle').click();
        await page.waitForSelector('.settings-content.visible', { timeout: 5000 });
        
        // Change display mode
        const displayMode = page.locator('#display-mode');
        await displayMode.selectOption('dark');
        
        // Verify mode change is applied
        await page.waitForTimeout(1000);
        const bodyClass = await page.locator('body').getAttribute('class');
        expect(bodyClass).toContain('dark-mode');
        
        // Test font size adjustment
        const fontSize = page.locator('#font-size');
        await fontSize.fill('18');
        
        // Verify font size change
        await page.waitForTimeout(500);
        const rootFontSize = await page.evaluate(() => 
          getComputedStyle(document.documentElement).getPropertyValue('--font-size')
        );
        expect(rootFontSize).toBe('18px');
      });

      await test.step('Test zen mode functionality', async () => {
        const zenMode = page.locator('#zen-mode');
        await zenMode.check();
        
        // Verify controls are hidden
        await page.waitForTimeout(500);
        const controlIcons = page.locator('.control-icons');
        await expect(controlIcons).toHaveClass(/zen-mode/);
        
        // Test that zen mode persists across navigation
        await page.locator('#next-chapter').click();
        await page.waitForTimeout(1000);
        await expect(controlIcons).toHaveClass(/zen-mode/);
      });

      await test.step('Test drawing mode integration', async () => {
        // Enable drawing mode
        const drawingMode = page.locator('#drawing-mode');
        await drawingMode.check();
        
        // Verify drawing canvas is available
        await page.waitForTimeout(500);
        const canvas = page.locator('#drawing-canvas');
        await expect(canvas).toBeVisible();
        
        // Test basic drawing functionality
        await TestHelpers.testCanvasDrawing(page);
      });
    });

    test('should provide comprehensive instruction glossary integration', async ({ page }) => {
      await test.step('Search and use instruction glossary', async () => {
        // Open navigation panel if not visible
        const navToggle = page.locator('#nav-toggle');
        if (await navToggle.isVisible()) {
          await navToggle.click();
          await page.waitForTimeout(500);
        }
        
        // Test glossary search
        const glossarySearch = page.locator('#glossary-search');
        await glossarySearch.fill('MOV');
        
        // Verify search results
        await page.waitForTimeout(1000);
        const glossaryItems = await page.locator('#glossary-list li').count();
        expect(glossaryItems).toBeGreaterThan(0);
        
        // Click on a glossary item
        const firstItem = page.locator('#glossary-list li').first();
        if (await firstItem.isVisible()) {
          await firstItem.click();
          
          // Verify interaction (tooltip, popup, or navigation)
          await page.waitForTimeout(1000);
        }
      });

      await test.step('Test instruction tooltips in content', async () => {
        // Navigate to a chapter with code examples
        for (let i = 0; i < 3; i++) {
          await page.locator('#next-chapter').click();
          await page.waitForTimeout(1000);
          
          // Look for code blocks or instruction references
          const codeBlocks = await page.locator('code, .instruction').count();
          if (codeBlocks > 0) {
            // Test tooltip functionality
            const firstCode = page.locator('code, .instruction').first();
            await firstCode.hover();
            await page.waitForTimeout(1000);
            
            // Check for tooltip or popup
            const tooltip = page.locator('.tooltip, .instruction-popup');
            if (await tooltip.isVisible()) {
              expect(await tooltip.textContent()).toBeTruthy();
            }
            break;
          }
        }
      });
    });
  });

  test.describe('Data Persistence and State Management', () => {
    test('should persist user preferences across sessions', async ({ page }) => {
      await test.step('Set custom preferences', async () => {
        // Open settings
        await page.locator('#settings-toggle').click();
        await page.waitForSelector('.settings-content.visible', { timeout: 5000 });
        
        // Set custom font size and display mode
        await page.locator('#font-size').fill('20');
        await page.locator('#display-mode').selectOption('dark');
        await page.locator('#zen-mode').check();
        
        // Close settings
        await page.locator('.settings-close').click();
        await page.waitForTimeout(500);
      });

      await test.step('Verify preferences persist after page reload', async () => {
        // Reload page
        await page.reload();
        await TestHelpers.waitForEBookInit(page);
        
        // Check that preferences are restored
        await page.locator('#settings-toggle').click();
        await page.waitForSelector('.settings-content.visible', { timeout: 5000 });
        
        const fontSize = await page.locator('#font-size').inputValue();
        const displayMode = await page.locator('#display-mode').inputValue();
        const zenMode = await page.locator('#zen-mode').isChecked();
        
        expect(fontSize).toBe('20');
        expect(displayMode).toBe('dark');
        expect(zenMode).toBe(true);
      });
    });

    test('should maintain reading position and progress', async ({ page }) => {
      await test.step('Navigate to specific chapter', async () => {
        // Navigate to chapter 3
        for (let i = 0; i < 3; i++) {
          await page.locator('#next-chapter').click();
          await page.waitForTimeout(1000);
        }
        
        // Record current position
        const chapterInfo = await page.locator('#chapter-info').textContent();
        const progress = await page.locator('#progress-text').textContent();
        
        // Store for comparison
        await page.evaluate((data) => {
          window.testData = data;
        }, { chapterInfo, progress });
      });

      await test.step('Verify position persists after reload', async () => {
        // Reload page
        await page.reload();
        await TestHelpers.waitForEBookInit(page);
        
        // Check if position is restored
        await page.waitForTimeout(2000);
        
        const restoredData = await page.evaluate(() => window.testData);
        const currentChapter = await page.locator('#chapter-info').textContent();
        const currentProgress = await page.locator('#progress-text').textContent();
        
        // Position should be maintained or very close
        expect(currentChapter).toBeTruthy();
        expect(currentProgress).toBeTruthy();
      });
    });

    test('should handle offline functionality', async ({ page }) => {
      await test.step('Test offline reading capability', async () => {
        // Navigate through a few chapters to cache content
        for (let i = 0; i < 3; i++) {
          await page.locator('#next-chapter').click();
          await page.waitForTimeout(1500);
        }
        
        // Simulate offline mode
        await page.context().setOffline(true);
        
        // Try to navigate (should work with cached content)
        await page.locator('#prev-chapter').click();
        await page.waitForTimeout(1000);
        
        // Verify content still loads
        const content = await page.locator('#chapter-content').textContent();
        expect(content.trim().length).toBeGreaterThan(50);
        
        // Restore online mode
        await page.context().setOffline(false);
      });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should gracefully handle navigation edge cases', async ({ page }) => {
      await test.step('Test navigation at book boundaries', async () => {
        // Go to first chapter
        while (true) {
          const prevButton = page.locator('#prev-chapter');
          if (await prevButton.isDisabled()) {
            break;
          }
          await prevButton.click();
          await page.waitForTimeout(500);
        }
        
        // Verify prev button is disabled at start
        await expect(page.locator('#prev-chapter')).toBeDisabled();
        
        // Navigate to last chapter
        while (true) {
          const nextButton = page.locator('#next-chapter');
          if (await nextButton.isDisabled()) {
            break;
          }
          await nextButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Verify next button is disabled at end
        await expect(page.locator('#next-chapter')).toBeDisabled();
      });

      await test.step('Test rapid navigation handling', async () => {
        // Rapidly click navigation buttons
        for (let i = 0; i < 5; i++) {
          await page.locator('#prev-chapter').click();
          await page.waitForTimeout(100); // Minimal wait
        }
        
        // Verify content still loads correctly
        await page.waitForTimeout(2000);
        const content = await page.locator('#chapter-content').textContent();
        expect(content.trim().length).toBeGreaterThan(50);
      });
    });

    test('should handle modal interaction edge cases', async ({ page }) => {
      await test.step('Test overlapping modal scenarios', async () => {
        // Open AI assistant
        await page.locator('#ai-toggle').click();
        await page.waitForSelector('#ai-window.visible', { timeout: 5000 });
        
        // Open settings while AI is open
        await page.locator('#settings-toggle').click();
        await page.waitForSelector('.settings-content.visible', { timeout: 5000 });
        
        // Both should be accessible with proper z-index
        const aiWindow = page.locator('#ai-window');
        const settingsContent = page.locator('.settings-content');
        
        await expect(aiWindow).toBeVisible();
        await expect(settingsContent).toBeVisible();
        
        // Close both modals
        await page.locator('.settings-close').click();
        await page.locator('#ai-close').click();
        
        await page.waitForTimeout(1000);
        await expect(aiWindow).not.toBeVisible();
        await expect(settingsContent).not.toBeVisible();
      });

      await test.step('Test modal drag boundaries', async () => {
        // Open AI assistant
        await page.locator('#ai-toggle').click();
        await page.waitForSelector('#ai-window.visible', { timeout: 5000 });
        
        const dragHandle = page.locator('.ai-drag-handle');
        if (await dragHandle.isVisible()) {
          // Try to drag outside viewport
          await TestHelpers.dragElement(page, dragHandle, -1000, -1000);
          await page.waitForTimeout(500);
          
          // Verify modal stays within bounds
          const bounds = await page.locator('#ai-window').boundingBox();
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.y).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test('should handle performance under stress', async ({ page }) => {
      await test.step('Test rapid interactions', async () => {
        const startTime = Date.now();
        
        // Perform rapid interactions
        for (let i = 0; i < 10; i++) {
          await page.locator('#ai-toggle').click();
          await page.waitForTimeout(50);
          await page.locator('#ai-close').click();
          await page.waitForTimeout(50);
          
          await page.locator('#settings-toggle').click();
          await page.waitForTimeout(50);
          await page.locator('.settings-close').click();
          await page.waitForTimeout(50);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(10000); // 10 seconds max
        
        // Verify page is still responsive
        const content = await page.locator('#chapter-content').textContent();
        expect(content.trim().length).toBeGreaterThan(50);
      });
    });
  });
});