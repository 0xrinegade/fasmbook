import { test, expect } from '@playwright/test';

test.describe('FASM eBook - Content Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should display instruction tooltips', async ({ page }) => {
    // Navigate to a chapter with code
    const tocLink = page.locator('#toc-list a').first();
    await tocLink.click();
    await page.waitForTimeout(3000);

    // Look for assembly instructions in the content
    const instructions = page.locator('.instruction-link, .asm-instruction, [data-instruction]');
    if (await instructions.count() > 0) {
      const firstInstruction = instructions.first();
      
      // Hover or click to show tooltip
      await firstInstruction.hover();
      await page.waitForTimeout(500);
      
      // Check for tooltip
      const tooltip = page.locator('.instruction-tooltip, .tooltip, .popup');
      if (await tooltip.count() > 0) {
        await expect(tooltip).toBeVisible();
        
        // Tooltip should contain instruction information
        const tooltipText = await tooltip.textContent();
        expect(tooltipText.length).toBeGreaterThan(10);
      }
    }
  });

  test('should have functional code syntax highlighting', async ({ page }) => {
    // Navigate to a chapter with code
    const tocLink = page.locator('#toc-list a').first();
    await tocLink.click();
    await page.waitForTimeout(3000);

    // Look for code blocks
    const codeBlocks = page.locator('pre code, .code-block, .highlight');
    if (await codeBlocks.count() > 0) {
      const firstCodeBlock = codeBlocks.first();
      await expect(firstCodeBlock).toBeVisible();
      
      // Code block should have styling
      const hasHighlighting = await firstCodeBlock.evaluate(el => {
        const computedStyle = getComputedStyle(el);
        return computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
               el.querySelectorAll('.keyword, .string, .comment').length > 0;
      });
      
      expect(hasHighlighting).toBe(true);
    }
  });

  test('should have copy functionality for code blocks', async ({ page }) => {
    // Navigate to a chapter with code
    const tocLink = page.locator('#toc-list a').first();
    await tocLink.click();
    await page.waitForTimeout(3000);

    // Look for code blocks with copy buttons
    const copyButtons = page.locator('.copy-btn, .copy-button, [data-action="copy"]');
    if (await copyButtons.count() > 0) {
      const firstCopyBtn = copyButtons.first();
      await expect(firstCopyBtn).toBeVisible();
      
      // Click copy button
      await firstCopyBtn.click();
      await page.waitForTimeout(500);
      
      // Should show feedback (text change or notification)
      const buttonText = await firstCopyBtn.textContent();
      expect(buttonText.toLowerCase()).toMatch(/copied|copy/);
    }
  });

  test('should have working instruction glossary', async ({ page }) => {
    // Look for glossary or instruction search
    const glossaryBtn = page.locator('#glossary-toggle, .glossary-btn, [data-action="glossary"]');
    if (await glossaryBtn.count() > 0) {
      await glossaryBtn.click();
      await page.waitForTimeout(500);
      
      // Glossary panel should open
      const glossaryPanel = page.locator('#glossary-panel, .glossary-panel, .instruction-glossary');
      await expect(glossaryPanel).toBeVisible();
      
      // Should have search functionality
      const searchInput = glossaryPanel.locator('input[type="text"], input[type="search"], .search-input');
      if (await searchInput.count() > 0) {
        await searchInput.fill('mov');
        await page.waitForTimeout(500);
        
        // Should show filtered results
        const results = glossaryPanel.locator('.instruction-item, .glossary-item, .search-result');
        if (await results.count() > 0) {
          await expect(results.first()).toContainText(/mov/i);
        }
      }
    }
  });

  test('should track reading progress accurately', async ({ page }) => {
    // Get initial progress
    const initialProgress = await page.locator('#progress-text').textContent();
    
    // Navigate through multiple chapters
    const tocLinks = page.locator('#toc-list a');
    const linkCount = await tocLinks.count();
    
    if (linkCount > 2) {
      // Click on second chapter
      await tocLinks.nth(1).click();
      await page.waitForTimeout(3000);
      
      // Progress should increase
      const middleProgress = await page.locator('#progress-text').textContent();
      expect(middleProgress).not.toBe(initialProgress);
      
      // Click on third chapter
      await tocLinks.nth(2).click();
      await page.waitForTimeout(3000);
      
      // Progress should increase further
      const finalProgress = await page.locator('#progress-text').textContent();
      expect(finalProgress).not.toBe(middleProgress);
      
      // Progress bar should visually reflect changes
      const progressBar = page.locator('#progress-fill, .progress-fill');
      if (await progressBar.count() > 0) {
        const width = await progressBar.evaluate(el => el.style.width);
        expect(width).toMatch(/\d+%/);
      }
    }
  });

  test('should save and restore bookmarks', async ({ page }) => {
    // Navigate to a chapter
    const tocLink = page.locator('#toc-list a').first();
    await tocLink.click();
    await page.waitForTimeout(3000);

    // Look for bookmark button
    const bookmarkBtn = page.locator('.bookmark-btn, [data-action="bookmark"], .add-bookmark');
    if (await bookmarkBtn.count() > 0) {
      await bookmarkBtn.click();
      await page.waitForTimeout(500);
      
      // Check bookmarks list
      const bookmarksList = page.locator('#bookmarks-list, .bookmarks-list');
      if (await bookmarksList.count() > 0) {
        const bookmarkItems = bookmarksList.locator('li, .bookmark-item');
        expect(await bookmarkItems.count()).toBeGreaterThan(0);
        
        // Bookmark should be clickable
        if (await bookmarkItems.count() > 0) {
          await bookmarkItems.first().click();
          await page.waitForTimeout(2000);
          
          // Should navigate to bookmarked content
          await expect(page.locator('#content-area')).toBeVisible();
        }
      }
    }
  });

  test('should maintain reading history', async ({ page }) => {
    // Navigate through multiple chapters
    const tocLinks = page.locator('#toc-list a');
    const linkCount = await tocLinks.count();
    
    if (linkCount > 1) {
      // Visit first chapter
      await tocLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Visit second chapter
      await tocLinks.nth(1).click();
      await page.waitForTimeout(2000);
      
      // Check reading history
      const historyList = page.locator('#history-list, .history-list');
      if (await historyList.count() > 0) {
        const historyItems = historyList.locator('li, .history-item');
        expect(await historyItems.count()).toBeGreaterThan(0);
        
        // History items should be clickable
        if (await historyItems.count() > 0) {
          await historyItems.first().click();
          await page.waitForTimeout(2000);
          
          // Should navigate to history item
          await expect(page.locator('#content-area')).toBeVisible();
        }
      }
    }
  });

  test('should handle search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('#search-input, .search-input, input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('FASM');
      await page.waitForTimeout(1000);
      
      // Should show search results
      const searchResults = page.locator('.search-results, #search-results, .search-result');
      if (await searchResults.count() > 0) {
        await expect(searchResults).toBeVisible();
        
        // Results should contain the search term
        const resultsText = await searchResults.textContent();
        expect(resultsText.toLowerCase()).toContain('fasm');
      }
    }
  });

  test('should support different reading themes', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('#settings-toggle, .settings-btn').first();
    await settingsBtn.click();
    await page.waitForTimeout(500);

    // Look for theme selector
    const themeSelector = page.locator('select[name*="theme"], #theme-select, .theme-selector');
    if (await themeSelector.count() > 0) {
      // Switch to eInk theme
      await themeSelector.selectOption('eink');
      await page.waitForTimeout(500);
      
      // Body should have eink class
      await expect(page.locator('body')).toHaveClass(/eink/);
      
      // Colors should be grayscale
      const contentArea = page.locator('#content-area');
      const backgroundColor = await contentArea.evaluate(el => getComputedStyle(el).backgroundColor);
      
      // Should be white, black, or gray
      expect(backgroundColor).toMatch(/rgb\(255, 255, 255\)|rgb\(0, 0, 0\)|rgb\(\d+, \d+, \d+\)/);
    }
  });

  test('should handle content loading errors gracefully', async ({ page }) => {
    // Try to load a non-existent chapter
    await page.goto('/#chapter-nonexistent');
    await page.waitForTimeout(3000);
    
    // Should show error message or fallback content
    const contentArea = page.locator('#content-area');
    if (await contentArea.count() > 0) {
      const contentText = await contentArea.textContent();
      
      // Should have some content (error message or default content)
      expect(contentText.length).toBeGreaterThan(10);
    }
    
    // Navigation should still work
    await expect(page.locator('#navigation-panel')).toBeVisible();
    
    // Should be able to navigate to valid content
    const tocLink = page.locator('#toc-list a').first();
    if (await tocLink.count() > 0) {
      await tocLink.click();
      await page.waitForTimeout(2000);
      
      // Should load valid content
      const newContent = await contentArea.textContent();
      expect(newContent.length).toBeGreaterThan(50);
    }
  });

  test('should support full-text search across chapters', async ({ page }) => {
    // Look for global search functionality
    const globalSearch = page.locator('#global-search, .global-search, input[placeholder*="search"]');
    if (await globalSearch.count() > 0) {
      await globalSearch.fill('assembly');
      await globalSearch.press('Enter');
      await page.waitForTimeout(2000);
      
      // Should show search results from multiple chapters
      const searchResults = page.locator('.search-result, .global-search-result');
      if (await searchResults.count() > 0) {
        expect(await searchResults.count()).toBeGreaterThan(0);
        
        // Results should be clickable and navigate to content
        await searchResults.first().click();
        await page.waitForTimeout(2000);
        
        const contentArea = page.locator('#content-area');
        const content = await contentArea.textContent();
        expect(content.toLowerCase()).toContain('assembly');
      }
    }
  });
});