import { test } from '@playwright/test';
import { env } from '../env';
import { makeRequest, validateHealthCheckResponse } from './test-utils';

interface HealthzEndpoint {
  readonly url: string;
  readonly name: string;
  readonly expectedStatus: number;
  readonly expectedContent?: Record<string, unknown>;
}

const HEALTHZ_ENDPOINTS: readonly HealthzEndpoint[] = [
  {
    url: env.PANOPTIQ_LANDING_HEALTHZ_URL,
    name: 'Landing Page Healthz',
    expectedStatus: 200,
  },
  {
    url: env.PANOPTIQ_STUDIO_HEALTHZ_URL,
    name: 'Studio Healthz',
    expectedStatus: 200,
  },
  {
    url: env.PANOPTIQ_CORE_API_HEALTHZ_URL,
    name: 'Core API Healthz',
    expectedStatus: 200,
    expectedContent: { status: 'ok' },
  },
];

test.describe('Health Check Endpoints', () => {
  for (const endpoint of HEALTHZ_ENDPOINTS) {
    test(`${endpoint.name} should be healthy`, async ({ request }) => {
      // Register URL as test annotation for CTRF metadata collection
      test.info().annotations.push({
        type: 'target-url',
        description: endpoint.url,
      });

      const result = await makeRequest(request, endpoint.url, {
        timeout: 15000,
        failOnStatusCode: false,
      });

      validateHealthCheckResponse(result, endpoint);
    });
  }
});
