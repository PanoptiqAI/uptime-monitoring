import { test } from '@playwright/test';
import { EmbedPage } from './page-objects/embed-page';

test.describe('Embed Page Health Check', () => {
  test('should load and be accessible', async ({ request }) => {
    const embedPage = new EmbedPage(request);
    await embedPage.runHealthCheck();
  });

  test('should return valid HTML content', async ({ request }) => {
    const embedPage = new EmbedPage(request);
    await embedPage.validateContent();
  });

  test('should meet performance requirements', async ({ request }) => {
    const embedPage = new EmbedPage(request);
    await embedPage.validatePerformance();
  });
});
