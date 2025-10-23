import { test } from '@playwright/test';
import { UsersPage } from './page-objects/users-page';

test.describe('Users Page Health Check', () => {
  test('should load and show user profile', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.runHealthCheck();
  });

  test('should meet performance requirements', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const result = await usersPage.load();
    await usersPage.validatePerformance(result);
  });
});
