import { expect, test } from '@playwright/test';
import { PERFORMANCE_THRESHOLDS, TEST_URLS } from './config';
import { loadPageWithMetrics, measureLCP } from './test-utils';

test.describe('Performance Metrics', () => {
  test('should load pages within acceptable time limits', async ({ page }) => {
    for (const testUrl of TEST_URLS) {
      await test.step(`${testUrl.name} loads within ${PERFORMANCE_THRESHOLDS.MAX_PERFORMANCE_TIME}ms`, async () => {
        const { loadTime, response } = await loadPageWithMetrics(
          page,
          testUrl.url,
          PERFORMANCE_THRESHOLDS.MAX_HEALTH_CHECK_TIME,
        );

        expect(
          response?.status(),
          `${testUrl.name} should return success status`,
        ).toBeLessThan(400);
        expect(
          loadTime,
          `${testUrl.name} should load within ${PERFORMANCE_THRESHOLDS.MAX_PERFORMANCE_TIME}ms (actual: ${loadTime}ms)`,
        ).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_PERFORMANCE_TIME);

        console.log(`${testUrl.name}: ${loadTime}ms`);
      });
    }
  });

  test('should have acceptable Largest Contentful Paint', async ({ page }) => {
    const testUrl = TEST_URLS[0];

    await page.goto(testUrl.url, {
      waitUntil: 'networkidle',
      timeout: PERFORMANCE_THRESHOLDS.MAX_HEALTH_CHECK_TIME,
    });

    const lcp = await measureLCP(page);

    console.log(`LCP: ${lcp}ms`);

    if (lcp > 0) {
      expect(
        lcp,
        `LCP should be under ${PERFORMANCE_THRESHOLDS.MAX_LCP}ms (actual: ${lcp}ms)`,
      ).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_LCP);
    } else {
      console.warn('LCP measurement failed or not supported');
    }
  });
});
