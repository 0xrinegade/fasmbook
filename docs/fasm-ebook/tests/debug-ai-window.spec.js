// Debug script to check AI window state
import { test, expect } from '@playwright/test';

test('debug AI window state', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000); // Let scripts initialize
  
  // Check initial state
  const aiWindow = page.locator('#ai-window');
  const classes = await aiWindow.getAttribute('class');
  const style = await aiWindow.getAttribute('style');
  const computedStyle = await page.evaluate(() => {
    const el = document.getElementById('ai-window');
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    return {
      display: computed.display,
      opacity: computed.opacity,
      visibility: computed.visibility,
      transform: computed.transform
    };
  });
  
  console.log('AI Window Debug Info:');
  console.log('Classes:', classes);
  console.log('Style attr:', style);
  console.log('Computed style:', computedStyle);
  
  // Check Playwright's visibility determination
  const isVisible = await aiWindow.isVisible();
  const isHidden = await aiWindow.isHidden();
  
  console.log('Playwright visibility:');
  console.log('isVisible():', isVisible);
  console.log('isHidden():', isHidden);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: '/tmp/debug-ai-window.png', fullPage: true });
  
  expect(isHidden).toBe(true);
});