import { test } from '@playwright/test';
import { LandingPage } from './page-objects/landing-page';

test.describe('Landing Page Health Check', () => {
  test('should load and show key elements', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.runHealthCheck();
  });

  test('should meet performance requirements', async ({ page }) => {
    const landingPage = new LandingPage(page);
    const result = await landingPage.load();
    await landingPage.validatePerformance(result);
  });

  test('should have proper security headers', async ({ page, request }) => {
    const landingPage = new LandingPage(page);
    await landingPage.validateSecurityHeaders(request);
  });

  test('should redirect HTTP to HTTPS', async ({ page, request }) => {
    const landingPage = new LandingPage(page);
    await landingPage.validateHttpsRedirect(request);
  });

  test('should have acceptable LCP performance', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.load();
    await landingPage.validateLCP();
  });
});
