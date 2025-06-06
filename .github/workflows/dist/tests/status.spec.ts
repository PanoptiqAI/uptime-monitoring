import { test } from '@playwright/test';
import { StatusPage } from './page-objects/status-page';

test.describe('Status Page Health Check', () => {
  test('should show all services online', async ({ page }) => {
    const statusPage = new StatusPage(page);
    await statusPage.runHealthCheck();
  });

  test('should meet performance requirements', async ({ page }) => {
    const statusPage = new StatusPage(page);
    const result = await statusPage.load();
    await statusPage.validatePerformance(result);
  });
});
