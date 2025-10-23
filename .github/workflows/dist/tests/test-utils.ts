import {
  type APIRequestContext,
  type Page,
  type Response,
  expect,
} from '@playwright/test';

const TIMEOUTS = {
  DEFAULT_HEALTH_CHECK: 30000,
  HEALTHZ_RESPONSE: 5000,
  JS_ERROR_WAIT: 2000,
  LCP_MEASUREMENT: 5000,
} as const;

const NON_CRITICAL_ERROR_PATTERNS = [
  /favicon.*404/i,
  /google.*analytics/i,
  /gtag.*not.*defined/i,
  /third.*party.*script/i,
  /mixpanel/i,
  /hotjar/i,
  /401.*\(\)/i,
  /failed.*to.*load.*resource.*401/i,
  /initFromEdgeConfig/i,
  /hypertune.*failed/i,
  /hypertune.*edge.*failed/i,
  /initialize.*from.*hypertune.*edge.*failed/i,
  /failed.*to.*initialize.*from.*hypertune.*edge/i,
  /initialize.*from.*edge.*failed/i,
  /all.*attempts.*to.*initialize.*from.*hypertune.*edge.*failed/i,
] as const;

interface RequestOptions {
  timeout?: number;
  maxRedirects?: number;
  failOnStatusCode?: boolean;
}

interface PageLoadResult {
  loadTime: number;
  response: Response | null;
  consoleErrors: string[];
}

interface HealthCheckResult {
  status: number;
  responseTime: number;
  contentType: string;
  body?: Record<string, unknown>;
}

export async function makeRequest(
  request: APIRequestContext,
  url: string,
  options: RequestOptions = {},
): Promise<HealthCheckResult> {
  const {
    timeout = TIMEOUTS.DEFAULT_HEALTH_CHECK,
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

export async function loadPageWithMetrics(
  page: Page,
  url: string,
  timeout: number = TIMEOUTS.DEFAULT_HEALTH_CHECK,
): Promise<PageLoadResult> {
  const jsErrors: string[] = [];

  // Set up error collection for warnings (not test failures)
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      jsErrors.push(`${msg.text()} (Source: ${url})`);
    }
  });

  // Also capture page errors with URL context
  page.on('pageerror', (error) => {
    jsErrors.push(`Page Error: ${error.message} (Source: ${url})`);
  });

  const startTime = Date.now();

  let response: Response | null = null;
  try {
    // Use a race between domcontentloaded, networkidle, and a 10-second timeout
    // This ensures we don't wait too long for pages that continuously load assets
    const gotoPromise = page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    const networkIdlePromise = page
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {
        // Ignore timeout, we'll use domcontentloaded result
      });

    response = await gotoPromise;

    // Race between network idle and 10-second timeout
    await Promise.race([networkIdlePromise, page.waitForTimeout(10000)]);

    // Wait for body content to be present to avoid race conditions
    // Use a more lenient check that works for both text-heavy and visual pages
    try {
      await page.waitForFunction(
        () => {
          const body = document.body;
          return (
            body &&
            (body.innerText.trim().length > 10 ||
              body.querySelector('canvas, img, video'))
          );
        },
        { timeout: 5000 },
      );
    } catch {
      // If content doesn't load within 5s, continue
      // The validation will catch if it's actually empty
    }
  } catch (error) {
    // Add URL context to navigation errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load ${url}: ${errorMessage}`);
  }

  const loadTime = Date.now() - startTime;

  // Wait for any late-loading errors, but handle page closure gracefully
  try {
    await page.waitForTimeout(TIMEOUTS.JS_ERROR_WAIT);
  } catch {
    // If the page was closed during the wait, just continue
  }

  // Filter out non-critical errors for cleaner warnings
  const consoleErrors = jsErrors.filter((error) => {
    const lowerError = error.toLowerCase();
    return !NON_CRITICAL_ERROR_PATTERNS.some((pattern) =>
      pattern.test(lowerError),
    );
  });

  return {
    loadTime,
    response,
    consoleErrors,
  };
}

export async function validatePageContent(
  page: Page,
  name: string,
  url?: string,
): Promise<void> {
  const urlContext = url ? ` (URL: ${url})` : '';

  // Check if page is still valid
  if (page.isClosed()) {
    throw new Error(
      `Page was closed before validation could complete${urlContext}`,
    );
  }

  // Simple smoke test: verify we have basic HTML content
  const content = await page.content();
  expect(
    content.length,
    `${name} should have HTML content${urlContext}. Current content length: ${content.length}`,
  ).toBeGreaterThan(100);

  // Verify it looks like HTML (has basic HTML tags)
  expect(
    content.includes('<html') ||
      content.includes('<body') ||
      content.includes('<head'),
    `${name} should contain basic HTML structure${urlContext}`,
  ).toBe(true);

  // More sophisticated error detection: look for actual error page indicators
  const bodyText = (await page.textContent('body')) || '';
  const title = await page.title();
  const lowerBodyText = bodyText.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // Check for actual 404 error pages (not just the string "404" which might appear in legitimate content)
  const is404Error =
    (lowerTitle.includes('404') &&
      (lowerTitle.includes('not found') ||
        lowerTitle.includes('page not found'))) ||
    (lowerBodyText.includes('404') &&
      lowerBodyText.includes('not found') &&
      lowerBodyText.length < 1000) ||
    lowerTitle === '404' ||
    lowerTitle === 'not found' ||
    (bodyText.trim().length < 200 &&
      lowerBodyText.includes('404') &&
      lowerBodyText.includes('not found'));

  // Check for actual 500 error pages
  const is500Error =
    (lowerTitle.includes('500') &&
      (lowerTitle.includes('server error') ||
        lowerTitle.includes('internal server error'))) ||
    (lowerBodyText.includes('500') &&
      lowerBodyText.includes('server error') &&
      lowerBodyText.length < 1000) ||
    lowerTitle === '500' ||
    lowerTitle === 'server error' ||
    lowerTitle === 'internal server error' ||
    (bodyText.trim().length < 200 &&
      lowerBodyText.includes('500') &&
      lowerBodyText.includes('server error'));

  if (is404Error) {
    throw new Error(
      `${name} appears to be a 404 error page${urlContext}. Title: "${title}", Body text length: ${bodyText.length}, Body preview: "${bodyText.substring(0, 200)}..."`,
    );
  }

  if (is500Error) {
    throw new Error(
      `${name} appears to be a 500 error page${urlContext}. Title: "${title}", Body text length: ${bodyText.length}, Body preview: "${bodyText.substring(0, 200)}..."`,
    );
  }

  // Additional check: if the page is very short and mentions errors, it might be an error page
  // Only flag as error if it has very little content AND contains error keywords
  if (bodyText.trim().length < 50) {
    const errorKeywords = [
      'error',
      'not found',
      'server error',
      'unavailable',
      'maintenance',
    ];
    const hasErrorKeyword = errorKeywords.some((keyword) =>
      lowerBodyText.includes(keyword),
    );
    if (hasErrorKeyword) {
      throw new Error(
        `${name} appears to be an error page with minimal content${urlContext}. Title: "${title}", Body: "${bodyText}"`,
      );
    }
  }
}

export function validateHealthCheckResponse(
  result: HealthCheckResult,
  endpoint: {
    readonly url: string;
    readonly name: string;
    readonly expectedStatus: number;
    readonly expectedContent?: Record<string, unknown>;
  },
): void {
  const { status, responseTime, contentType, body } = result;
  const { name, expectedStatus, expectedContent, url } = endpoint;

  // Verify status code
  expect(status, `${name} should return ${expectedStatus} (URL: ${url})`).toBe(
    expectedStatus,
  );

  // Verify response time
  expect(
    responseTime,
    `${name} should respond within ${TIMEOUTS.HEALTHZ_RESPONSE}ms (actual: ${responseTime}ms) (URL: ${url})`,
  ).toBeLessThan(TIMEOUTS.HEALTHZ_RESPONSE);

  // Verify content type
  expect(
    contentType,
    `${name} should have valid content-type (URL: ${url})`,
  ).toBeTruthy();

  // Verify expected content if specified
  if (expectedContent && body) {
    expect(
      body,
      `${name} should return expected JSON content (URL: ${url})`,
    ).toMatchObject(expectedContent);
  }
}

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

export async function measureLCP(page: Page): Promise<number> {
  const timeout = TIMEOUTS.LCP_MEASUREMENT;

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
