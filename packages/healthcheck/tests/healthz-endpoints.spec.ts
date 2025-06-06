import { expect, test } from '@playwright/test';
import { HEALTHZ_ENDPOINTS, PERFORMANCE_THRESHOLDS } from './config';
import { makeRequest, validateHealthCheckResponse } from './test-utils';

test.describe('Healthz Endpoint Tests', () => {
  test('should verify all healthz endpoints are responding', async ({
    request,
  }) => {
    for (const endpoint of HEALTHZ_ENDPOINTS) {
      await test.step(`Check ${endpoint.name}`, async () => {
        const result = await makeRequest(request, endpoint.url, {
          timeout: PERFORMANCE_THRESHOLDS.MAX_HEALTHZ_TIMEOUT,
        });

        validateHealthCheckResponse(result, endpoint);
      });
    }
  });

  test('should verify healthz endpoints respond within SLA', async ({
    request,
  }) => {
    for (const endpoint of HEALTHZ_ENDPOINTS) {
      await test.step(`Check response time for ${endpoint.name}`, async () => {
        const startTime = Date.now();

        const result = await makeRequest(request, endpoint.url, {
          timeout: PERFORMANCE_THRESHOLDS.MAX_PERFORMANCE_SLA_TIME + 1000,
        });

        const responseTime = Date.now() - startTime;

        expect(result.status, `${endpoint.name} should be healthy`).toBe(200);
        expect(
          responseTime,
          `${endpoint.name} should respond within ${PERFORMANCE_THRESHOLDS.MAX_PERFORMANCE_SLA_TIME}ms (actual: ${responseTime}ms)`,
        ).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_PERFORMANCE_SLA_TIME);

        console.log(`${endpoint.name}: ${responseTime}ms`);
      });
    }
  });
});
