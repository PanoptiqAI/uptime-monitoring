import { expect, test } from '@playwright/test';
import { TEST_URLS } from './config';
import { testHttpsRedirect, validateSecurityHeaders } from './test-utils';

test.describe('Security Headers', () => {
  test('should have proper security headers', async ({ request }) => {
    for (const testUrl of TEST_URLS) {
      await test.step(`Security headers for ${testUrl.url}`, async () => {
        const response = await request.get(testUrl.url);
        const headers = response.headers();

        validateSecurityHeaders(headers, testUrl.url);
      });
    }
  });

  test('should redirect HTTP to HTTPS', async ({ request }) => {
    for (const testUrl of TEST_URLS) {
      await test.step(`Check HTTP redirect for ${testUrl.name}`, async () => {
        await testHttpsRedirect(request, testUrl);
      });
    }
  });
});
