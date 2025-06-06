import { expect, test } from '@playwright/test';
import { TEST_URLS } from './config';
import {
  loadPageWithMetrics,
  makeRequest,
  validatePageContent,
} from './test-utils';

test.describe('Health Check Tests', () => {
  for (const testUrl of TEST_URLS) {
    test(`should load ${testUrl.name}`, async ({ page }) => {
      const { loadTime, response, criticalErrors } = await loadPageWithMetrics(
        page,
        testUrl.url,
      );

      // Verify response status
      expect(response?.status(), `${testUrl.name} should return 200`).toBe(200);

      // Validate page content and structure
      await validatePageContent(page, testUrl.name);

      // Verify no critical JavaScript errors
      expect(
        criticalErrors,
        `${testUrl.name} should not have critical JavaScript errors: ${criticalErrors.join(', ')}`,
      ).toHaveLength(0);

      console.log(`${testUrl.name} loaded in ${loadTime}ms`);
    });
  }

  test('should verify APIs are responding', async ({ request }) => {
    for (const testUrl of TEST_URLS) {
      await test.step(`Check ${testUrl.name}`, async () => {
        const result = await makeRequest(request, testUrl.url);
        expect(result.status, `${testUrl.name} should be accessible`).toBe(200);
      });
    }
  });
});
