import { test } from '@playwright/test';
import { StudioPage } from './page-objects/studio-page';

test.describe('Studio Health Check', () => {
  test('should redirect to explore and show navigation', async ({ page }) => {
    const studioPage = new StudioPage(page);
    await studioPage.runHealthCheck();
  });

  test('should meet performance requirements', async ({ page }) => {
    const studioPage = new StudioPage(page);
    const result = await studioPage.load();
    await studioPage.validatePerformance(result);
  });

  test('should have proper security headers', async ({ page, request }) => {
    const studioPage = new StudioPage(page);
    await studioPage.validateSecurityHeaders(request);
  });

  test('should redirect HTTP to HTTPS', async ({ page, request }) => {
    const studioPage = new StudioPage(page);
    await studioPage.validateHttpsRedirect(request);
  });

  test('should have acceptable LCP performance', async ({ page }) => {
    const studioPage = new StudioPage(page);
    await studioPage.load();
    await studioPage.validateLCP();
  });
});
