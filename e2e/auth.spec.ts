import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route, request) => {
      const body = request.postDataJSON();
      if (body.username === 'receptionist' && body.password === 'password') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token',
            token_type: 'bearer',
            role: 'receptionist',
          }),
        });
      }
      if (body.username === 'locked' && body.password === 'password') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'ACCOUNT_LOCKED', message: 'Your account is locked.' },
          }),
        });
      }
      if (body.username === 'inactive' && body.password === 'password') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'ACCOUNT_INACTIVE', message: 'Your account is inactive.' },
          }),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' },
        }),
      });
    });

    await page.route('**/api/v1/auth/logout', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out successfully.' }),
      });
    });
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'UroLens LIS' })).toBeVisible();

    await page.fill('#username', 'receptionist');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/receptionist/);
    await expect(page.getByRole('heading', { name: 'Receptionist Dashboard' })).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Invalid username or password. Please try again.')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('login with locked account shows locked message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', 'locked');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Your account has been locked. Please contact the administrator.')).toBeVisible();
  });

  test('login with inactive account shows inactive message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', 'inactive');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Your account is inactive. Please contact the administrator.')).toBeVisible();
  });

  test('empty fields show validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Username is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });

  test('logout redirects to login page', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'receptionist');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/receptionist/);

    await page.click('text=Logout');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'UroLens LIS' })).toBeVisible();
  });

  test('session timeout redirects to login with timeout banner', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'receptionist');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/receptionist/);

    await page.goto('/login?reason=timeout');
    await expect(page.getByText('You were logged out due to inactivity.')).toBeVisible();

    await page.click('text=Dismiss');
    await expect(page.getByText('You were logged out due to inactivity.')).not.toBeVisible();
  });

  test('unauthenticated user accessing dashboard is redirected to login', async ({ page }) => {
    await page.goto('/dashboard/receptionist');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'UroLens LIS' })).toBeVisible();
  });

  test('already authenticated user is redirected to dashboard on login visit by router', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'receptionist');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/receptionist/);

    await page.evaluate(() => {
      window.history.pushState({}, '', '/login');
    });

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Receptionist Dashboard' })).toBeVisible();
  });

});
