import { test, expect } from '@playwright/test';

test('Verify Agent Connection Indicator', async ({ page }) => {
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');

  // Wait for sidebar
  const sidebar = page.locator('.bg-gray-900').first();
  await sidebar.waitFor({ state: 'visible' });
  console.log('Sidebar loaded.');

  // Check if the icon container exists at all
  // It has classes: flex items-center justify-center w-8 h-8 rounded-lg
  // We can look for the tooltip title attribute which should be present

  // Let's try to find the CpuChipIcon directly.
  // It usually has some class or just be an svg.
  // But searching by title is safer if the component rendered.

  try {
    await page.waitForSelector('[title^="Agent "]', { timeout: 5000 });
  } catch (e) {
    console.log('Timeout waiting for Agent indicator. Dumping HTML...');
    console.log(await sidebar.innerHTML());
  }

  const indicator = page.locator('[title^="Agent "]');
  const title = await indicator.getAttribute('title');
  console.log(`Indicator Title: "${title}"`);

  // Wait for connection (title becomes "Agent Connected")
  // Retry a few times or wait
  await expect(indicator).toHaveAttribute('title', 'Agent Connected', { timeout: 10000 });

  const isConnected = await indicator.getAttribute('title') === 'Agent Connected';
  expect(isConnected).toBe(true);
});
