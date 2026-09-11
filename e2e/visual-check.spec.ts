import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const screenshotsDir = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// 1. Home
test('Capture screenshots for home', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'home-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'home-mobile.png'), fullPage: false });
});

// 2. Auctions
test('Capture screenshots for auctions', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/auctions', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'auctions-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'auctions-mobile.png'), fullPage: false });
});

// 3. Lot Detail
test('Capture screenshots for lot-detail', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/auctions/1', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'lot-detail-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'lot-detail-mobile.png'), fullPage: false });
});

// 4. Live Auction Room
test('Capture screenshots for live-auction', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/auctions/1/live', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'live-auction-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'live-auction-mobile.png'), fullPage: false });
});

// 5. Sell
test('Capture screenshots for sell', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/sell', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'sell-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'sell-mobile.png'), fullPage: false });
});

// 6. Dashboard (Authenticated Cabinet Shell)
test('Capture screenshots for dashboard', async ({ page }) => {
  test.setTimeout(30000);

  await page.route('**/*auth/me*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        status: 'OK',
        data: {
          id: 101,
          userId: 101,
          firstName: 'Arsen',
          lastName: 'Developer',
          email: 'arsen@tezauksion.uz',
          phone: '+998901234567',
          roles: ['ROLE_USER', 'ROLE_SELLER'],
          balance: 15000000,
          kycStatus: 'APPROVED',
        },
      }),
    });
  });

  await page.route('**/*notifications*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'OK', data: [] }),
    });
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    window.localStorage.setItem('token', 'mock-authenticated-jwt-token');
    window.localStorage.setItem('userId', '101');
  });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'dashboard-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'dashboard-mobile.png'), fullPage: false });
});

// 7. Login
test('Capture screenshots for login', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'login-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'login-mobile.png'), fullPage: false });
});

// 8. Register
test('Capture screenshots for register', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'register-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'register-mobile.png'), fullPage: false });
});

// 9. FAQ
test('Capture screenshots for faq', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('http://localhost:3000/faq', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(screenshotsDir, 'faq-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: path.join(screenshotsDir, 'faq-mobile.png'), fullPage: false });
});
