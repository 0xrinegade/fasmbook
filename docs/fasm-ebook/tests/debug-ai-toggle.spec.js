// Debug AI window open/close
import { test, expect } from '@playwright/test';

test('debug AI window toggle', async ({ page }) => {
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  // Listen for JavaScript errors
  page.on('pageerror', error => {
    console.log('JAVASCRIPT ERROR:', error.message);
  });
  
  await page.goto('/');
  await page.waitForTimeout(5000); // Give more time for scripts to load
  
  const aiToggle = page.locator('#ai-toggle');
  const aiWindow = page.locator('#ai-window');
  
  // Check if scripts are loaded
  const scriptsLoaded = await page.evaluate(() => {
    return {
      dragUtility: typeof window.dragUtility !== 'undefined',
      fasmAI: typeof window.fasmAI !== 'undefined',
      DOMContentLoaded: document.readyState
    };
  });
  console.log('Scripts loaded:', scriptsLoaded);
  
  // Check initial state
  console.log('=== INITIAL STATE ===');
  const initialHidden = await aiWindow.isHidden();
  console.log('AI window hidden initially:', initialHidden);
  
  // Check if toggle button exists and is clickable
  await expect(aiToggle).toBeVisible();
  console.log('AI toggle button is visible');
  
  // Check if there's a click event listener
  const hasClickListener = await page.evaluate(() => {
    const button = document.getElementById('ai-toggle');
    return button && button.onclick !== null;
  });
  console.log('Toggle button has click listener:', hasClickListener);
  
  // Click the toggle button
  console.log('=== CLICKING TOGGLE ===');
  await aiToggle.click();
  
  // Wait a moment for JavaScript to respond
  await page.waitForTimeout(1000);
  
  // Check what happened
  const classes = await aiWindow.getAttribute('class');
  const style = await aiWindow.getAttribute('style');
  const isVisible = await aiWindow.isVisible();
  const isHidden = await aiWindow.isHidden();
  
  console.log('=== AFTER CLICK ===');
  console.log('Classes:', classes);
  console.log('Style attr:', style);
  console.log('isVisible():', isVisible);
  console.log('isHidden():', isHidden);
  
  expect(isVisible).toBe(true);
});