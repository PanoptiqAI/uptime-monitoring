import { test } from '@playwright/test';
import { env } from '../env';
import { StatusPage } from './page-objects/status-page';

test.describe('Status Page Health Check', () => {
  test.beforeEach(async () => {
    if (!env.PANOPTIQ_STATUS_URL) {
      test.skip(
        true,
        'PANOPTIQ_STATUS_URL not configured - status page tests skipped',
      );
    }
  });

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
