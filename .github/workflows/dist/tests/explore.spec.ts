import { test } from '@playwright/test';
import { ExplorePage } from './page-objects/explore-page';

test.describe('Explore Page Health Check', () => {
  test('should load and show experience list items', async ({ page }) => {
    const explorePage = new ExplorePage(page);
    await explorePage.runHealthCheck();
  });

  test('should meet performance requirements', async ({ page }) => {
    const explorePage = new ExplorePage(page);
    const result = await explorePage.load();
    await explorePage.validatePerformance(result);
  });
});
