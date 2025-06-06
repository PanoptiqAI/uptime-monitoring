import {
  type APIRequestContext,
  type Page,
  type Response,
  expect,
} from '@playwright/test';
import type { HealthzEndpoint, TestUrl } from './config';
import {
  NON_CRITICAL_ERROR_PATTERNS,
  PERFORMANCE_THRESHOLDS,
  REDIRECT_STATUS_CODES,
} from './config';

/**
 * Common request options for API calls
 */
interface RequestOptions {
  timeout?: number;
  maxRedirects?: number;
  failOnStatusCode?: boolean;
}

/**
 * Results from a page load test
 */
interface PageLoadResult {
  loadTime: number;
  response: Response | null;
  criticalErrors: string[];
}

/**
 * Results from a health check test
 */
interface HealthCheckResult {
  status: number;
  responseTime: number;
  contentType: string;
  body?: Record<string, unknown>;
}

/**
 * Make a request with common error handling and timeout
 */
export async function makeRequest(
  request: APIRequestContext,
  url: string,
  options: RequestOptions = {},
): Promise<HealthCheckResult> {
  const {
    timeout = PERFORMANCE_THRESHOLDS.MAX_HEALTH_CHECK_TIME,
    maxRedirects = 5,
    failOnStatusCode = true,
  } = options;

  const startTime = Date.now();

  const response = await request.get(url, {
    timeout,
    maxRedirects,
    failOnStatusCode,
  });

  const responseTime = Date.now() - startTime;
  const contentType = response.headers()['content-type'] || '';

  let body: Record<string, unknown> | undefined;
  try {
    if (contentType.includes('application/json')) {
      body = await response.json();
    }
  } catch {
    // Ignore JSON parsing errors
  }

  return {
    status: response.status(),
    responseTime,
    contentType,
    body,
  };
}

/**
 * Load a page and collect performance and error metrics
 */
export async function loadPageWithMetrics(
  page: Page,
  url: string,
  timeout: number = PERFORMANCE_THRESHOLDS.MAX_HEALTH_CHECK_TIME,
): Promise<PageLoadResult> {
  const jsErrors: string[] = [];

  // Set up error collection
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      jsErrors.push(msg.text());
    }
  });

  const startTime = Date.now();

  const response = await page.goto(url, {
    waitUntil: 'networkidle',
    timeout,
  });

  const loadTime = Date.now() - startTime;

  // Wait for any late-loading errors
  await page.waitForTimeout(PERFORMANCE_THRESHOLDS.JS_ERROR_WAIT_TIME);

  const criticalErrors = jsErrors.filter((error) => {
    const lowerError = error.toLowerCase();
    return !NON_CRITICAL_ERROR_PATTERNS.some((pattern) =>
      pattern.test(lowerError),
    );
  });

  return {
    loadTime,
    response,
    criticalErrors,
  };
}

/**
 * Validate basic page content and structure
 */
export async function validatePageContent(
  page: Page,
  name: string,
): Promise<void> {
  // Verify page has content
  const content = await page.content();
  expect(
    content.length,
    `${name} should have substantial content`,
  ).toBeGreaterThan(100);

  // Verify no error pages
  await expect(
    page.locator('title'),
    `${name} should not show error in title`,
  ).not.toContainText('Error');
  await expect(
    page.locator('body'),
    `${name} should not show 404 error`,
  ).not.toContainText('404');
  await expect(
    page.locator('body'),
    `${name} should not show 500 error`,
  ).not.toContainText('500');
}

/**
 * Validate health check response
 */
export function validateHealthCheckResponse(
  result: HealthCheckResult,
  endpoint: HealthzEndpoint,
): void {
  const { status, responseTime, contentType, body } = result;
  const { name, expectedStatus, expectedContent } = endpoint;

  // Verify status code
  expect(status, `${name} should return ${expectedStatus}`).toBe(
    expectedStatus,
  );

  // Verify response time
  expect(
    responseTime,
    `${name} should respond within ${PERFORMANCE_THRESHOLDS.MAX_HEALTHZ_RESPONSE_TIME}ms (actual: ${responseTime}ms)`,
  ).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_HEALTHZ_RESPONSE_TIME);

  // Verify content type
  expect(contentType, `${name} should have valid content-type`).toBeTruthy();

  // Verify expected content if specified
  if (expectedContent && body) {
    expect(body, `${name} should return expected JSON content`).toMatchObject(
      expectedContent,
    );
  }
}

/**
 * Test HTTP to HTTPS redirect for a URL
 */
export async function testHttpsRedirect(
  request: APIRequestContext,
  testUrl: TestUrl,
): Promise<void> {
  const { url, name } = testUrl;
  const httpUrl = url.replace('https://', 'http://');

  const response = await request.get(httpUrl, {
    maxRedirects: 0,
    failOnStatusCode: false,
  });

  const status = response.status();
  expect(
    REDIRECT_STATUS_CODES,
    `Expected redirect status code for ${name}, got ${status}`,
  ).toContain(status);

  const location = response.headers().location;
  expect(location, `${name} should have redirect location header`).toBeTruthy();
  expect(location, `Expected HTTPS redirect location for ${name}`).toContain(
    'https://',
  );
}

/**
 * Validate security headers
 */
export function validateSecurityHeaders(
  headers: Record<string, string>,
  url: string,
): void {
  const requiredHeaders = {
    'strict-transport-security': (value: string) => value.includes('max-age='),
  };

  const optionalHeaders = {
    'x-frame-options': (value: string) =>
      ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase()),
    'x-content-type-options': (value: string) =>
      value.toLowerCase() === 'nosniff',
    'content-security-policy': (value: string) => value.length > 0,
    'referrer-policy': (value: string) =>
      [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
      ].includes(value.toLowerCase()),
  };

  const forbiddenHeaders = ['x-debug'];
  const warningHeaders = ['x-powered-by'];

  // Check required headers
  for (const [header, validator] of Object.entries(requiredHeaders)) {
    const value = headers[header];
    expect(value, `${header} is required for ${url}`).toBeTruthy();
    expect(
      validator(value),
      `${header} has invalid value: ${value} for ${url}`,
    ).toBe(true);
  }

  // Check optional headers (warn if missing, validate if present)
  for (const [header, validator] of Object.entries(optionalHeaders)) {
    const value = headers[header];
    if (value) {
      expect(
        validator(value),
        `${header} has invalid value: ${value} for ${url}`,
      ).toBe(true);
    }
  }

  // Check forbidden headers are not present
  for (const header of forbiddenHeaders) {
    expect(
      headers[header],
      `${header} should not be exposed for ${url}`,
    ).toBeUndefined();
  }

  // Warn about headers that should ideally be removed
  for (const header of warningHeaders) {
    if (headers[header]) {
      console.warn(
        `Warning: ${header} header exposed for ${url}: ${headers[header]}`,
      );
    }
  }
}

/**
 * Measure Largest Contentful Paint with proper error handling
 */
export async function measureLCP(page: Page): Promise<number> {
  const timeout = PERFORMANCE_THRESHOLDS.MAX_LCP_TIMEOUT;

  return page.evaluate((timeoutMs) => {
    return new Promise<number>((resolve) => {
      let lcpValue = 0;
      let resolved = false;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0 && !resolved) {
          lcpValue = entries[entries.length - 1].startTime;
          observer.disconnect();
          resolved = true;
          resolve(lcpValue);
        }
      });

      try {
        observer.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        });
      } catch (error) {
        console.warn('LCP observation not supported:', error);
        resolved = true;
        resolve(0);
      }

      // Fallback timeout with proper cleanup
      setTimeout(() => {
        if (!resolved) {
          observer.disconnect();
          resolved = true;
          resolve(lcpValue);
        }
      }, timeoutMs);
    });
  }, timeout);
}
