// Debug AI window expansion
import { test, expect } from '@playwright/test';

test('debug AI window expansion', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  const aiToggle = page.locator('#ai-toggle');
  const aiWindow = page.locator('#ai-window');
  
  // Open AI window
  await aiToggle.click();
  await page.waitForTimeout(500);
  
  console.log('=== BEFORE EXPAND ===');
  let box = await aiWindow.boundingBox();
  console.log('AI window box:', box);
  console.log('AI window visible:', await aiWindow.isVisible());
  
  // Find expand button
  const expandBtn = aiWindow.locator('.ai-expand-btn');
  const expandBtnExists = await expandBtn.count();
  console.log('Expand button count:', expandBtnExists);
  
  if (expandBtnExists > 0) {
    await expandBtn.click();
    await page.waitForTimeout(1000);
    
    console.log('=== AFTER EXPAND ===');
    box = await aiWindow.boundingBox();
    console.log('AI window box after expand:', box);
    console.log('AI window visible after expand:', await aiWindow.isVisible());
    
    const classes = await aiWindow.getAttribute('class');
    const style = await aiWindow.getAttribute('style');
    console.log('Classes after expand:', classes);
    console.log('Style after expand:', style);
    
    // Check computed styles
    const computedStyle = await page.evaluate(() => {
      const el = document.getElementById('ai-window');
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        width: computed.width,
        height: computed.height,
        left: computed.left,
        top: computed.top,
        transform: computed.transform,
        zIndex: computed.zIndex
      };
    });
    console.log('Computed style after expand:', computedStyle);
    
    // Check if window is actually expanded
    if (box) {
      console.log('Width:', box.width, 'Height:', box.height);
      expect(box.width).toBeGreaterThan(800);
    } else {
      throw new Error('AI window disappeared after expansion');
    }
  } else {
    console.log('No expand button found');
  }
});