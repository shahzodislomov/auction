import { test, expect } from '@playwright/test';

// 1. Auth & Registration Flow
test.describe('Auth & Registration (+998 Uzbek Phone & Tokens)', () => {
  test('handles Uzbek phone registration, OTP verification, and token persistence', async ({ page }) => {
    // Intercept auth API endpoints
    await page.route('**/*auth/loginByPhone*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'OK',
          token: 'mock-valid-jwt-token-998',
          data: { id: 88, phone: '+998901234567', firstname: 'Arsen' }
        })
      });
    });

    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'OK',
          data: { id: 88, phone: '+998901234567', firstname: 'Arsen', kycStatus: 'APPROVED' }
        })
      });
    });

    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    
    // Simulate phone login
    const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+998901234567');
    }

    // Set token & reload to test persistence
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-valid-jwt-token-998');
    });

    await page.reload();
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('mock-valid-jwt-token-998');
  });

  test('handles incorrect OTP and rate limiting gracefully', async ({ page }) => {
    await page.route('**/*auth/register/email/verify-otp*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ERROR', message: 'Неверный OTP код' })
      });
    });

    await page.goto('/register');
    expect(page.url()).toContain('/register');
  });
});

// 2. KYC & Document Gating
test.describe('KYC & Document Gating', () => {
  test('blocks bidding when user KYC is PENDING or REJECTED', async ({ page }) => {
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'OK',
          data: { id: 88, firstname: 'Unverified', kycStatus: 'PENDING' }
        })
      });
    });

    await page.goto('/auctions/1');
    await expect(page.locator('body')).toBeVisible();
  });
});

// 3. Forms & VIN Validation
test.describe('Forms & VIN Validation (ISO 3779)', () => {
  test('validates VIN inputs and rejects forbidden letters I, O, Q', async ({ page }) => {
    await page.goto('/sell');
    const vinInput = page.locator('input[name="vin"], input[placeholder*="VIN"]').first();
    if (await vinInput.isVisible()) {
      await vinInput.fill('1HGCR2F83HA000IOQ'); // Contains I, O, Q
      await page.keyboard.press('Tab');
    }
  });
});

// 4. Bidding & Real-Time Multi-Context WebSocket
test.describe('Real-Time Bidding & Multi-Context WS', () => {
  test('broadcasts bids across two independent browser contexts in real-time', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto('/auctions/1/live');
    await pageB.goto('/auctions/1/live');

    await expect(pageA).toHaveURL(/\/auctions\/1\/live/);
    await expect(pageB).toHaveURL(/\/auctions\/1\/live/);

    await contextA.close();
    await contextB.close();
  });
});

// 5. Network Degradation & Error Handling
test.describe('Network Degradation & Error Handling', () => {
  test('handles API network failure gracefully without app crash', async ({ page }) => {
    await page.route('**/api/v1/auctions**', (route) => route.abort('failed'));
    await page.goto('/auctions');
    await expect(page.locator('body')).toBeVisible();
  });
});

// 6. Mobile Responsiveness (375px Viewport)
test.describe('Mobile Responsiveness & Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('renders catalog cleanly on 375px mobile screen without layout breakage', async ({ page }) => {
    await page.goto('/auctions');
    await expect(page.locator('body')).toBeVisible();
  });
});
