import { test } from '@playwright/test';
import { OrgPage } from './page-objects/org-page';

test.describe('Organization Page Health Check', () => {
  test('should load and show organization profile', async ({ page }) => {
    const orgPage = new OrgPage(page);
    await orgPage.runHealthCheck();
  });

  test('should meet performance requirements', async ({ page }) => {
    const orgPage = new OrgPage(page);
    const result = await orgPage.load();
    await orgPage.validatePerformance(result);
  });
});
