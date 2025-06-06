import type { APIRequestContext, Page, Response } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  loadPageWithMetrics,
  measureLCP,
  validatePageContent,
  validateSecurityHeaders,
} from '../test-utils';

const REDIRECT_STATUS_CODES = [301, 302, 307, 308] as const;

export interface PageConfig {
  readonly url: string;
  readonly name: string;
  readonly timeout?: number;
  readonly performanceThreshold?: number;
  readonly lcpThreshold?: number;
  readonly customValidations?: boolean;
}

interface PageLoadResult {
  loadTime: number;
  response: Response | null;
  consoleErrors: string[];
}

/** Page object with unified loading strategy: domcontentloaded + race(networkidle, 10s timeout) */
export abstract class BasePage {
  protected page: Page;
  protected config: PageConfig;

  constructor(page: Page, config: PageConfig) {
    this.page = page;
    this.config = config;

    // Register URL as test annotation for CTRF metadata collection
    test.info().annotations.push({
      type: 'target-url',
      description: config.url,
    });
  }

  get url(): string {
    return this.config.url;
  }

  get name(): string {
    return this.config.name;
  }

  get timeout(): number {
    return this.config.timeout ?? 60000;
  }

  get performanceThreshold(): number {
    return this.config.performanceThreshold ?? 60000;
  }

  get lcpThreshold(): number {
    return this.config.lcpThreshold ?? 10000;
  }

  /** Load page with metrics collection. Uses unified strategy for both text-heavy and WebGL/interactive pages */
  async load(): Promise<PageLoadResult> {
    return loadPageWithMetrics(this.page, this.url, this.timeout);
  }

  async validateBasics(): Promise<void> {
    await validatePageContent(this.page, this.name, this.url);
  }

  /** Full health check: load + validate content + check JS errors + custom validations */
  async runHealthCheck(): Promise<PageLoadResult> {
    const result = await this.load();

    // Verify response status
    expect(
      result.response?.status(),
      `${this.name} should return 200 (URL: ${this.url})`,
    ).toBe(200);

    // Validate page content
    await this.validateBasics();

    // Log console errors as warnings without failing the test
    if (result.consoleErrors.length > 0) {
      console.warn(`⚠️ Console errors detected on ${this.name} (${this.url}):`);
      for (const error of result.consoleErrors) {
        console.warn(`  - ${error}`);
      }
    }

    // Run page-specific validations if enabled
    if (this.config.customValidations) {
      await this.validatePageSpecific();
    }

    return result;
  }

  async validatePerformance(result: PageLoadResult): Promise<void> {
    expect(
      result.response?.status(),
      `${this.name} should return success status (URL: ${this.url})`,
    ).toBeLessThan(400);

    expect(
      result.loadTime,
      `${this.name} should load within ${this.performanceThreshold}ms (actual: ${result.loadTime}ms) (URL: ${this.url})`,
    ).toBeLessThan(this.performanceThreshold);

    console.log(`${this.name}: ${result.loadTime}ms (URL: ${this.url})`);
  }

  /** Override for page-specific validations (e.g., check for specific elements, text, redirects) */
  protected async validatePageSpecific(): Promise<void> {
    // Default implementation - override in subclasses
  }

  /** Measure LCP via PerformanceObserver with fallback timeout */
  async validateLCP(): Promise<void> {
    const lcp = await measureLCP(this.page);

    if (lcp > 0) {
      expect(
        lcp,
        `LCP should be under ${this.lcpThreshold}ms (actual: ${lcp}ms) (URL: ${this.url})`,
      ).toBeLessThan(this.lcpThreshold);
      this.logResult(`LCP: ${lcp}ms`);
    } else {
      this.logResult('LCP measurement not supported or failed');
    }
  }

  async validateSecurityHeaders(request: APIRequestContext): Promise<void> {
    const response = await request.get(this.url);
    const headers = response.headers();
    validateSecurityHeaders(headers, this.url);
    this.logResult('Security headers validated');
  }

  /** Test HTTP→HTTPS redirect with maxRedirects=0 to catch redirect status codes */
  async validateHttpsRedirect(request: APIRequestContext): Promise<void> {
    const httpUrl = this.url.replace('https://', 'http://');

    const response = await request.get(httpUrl, {
      maxRedirects: 0,
      failOnStatusCode: false,
    });

    const status = response.status();
    expect(
      REDIRECT_STATUS_CODES,
      `Expected redirect status code for ${this.name}, got ${status}`,
    ).toContain(status);

    const location = response.headers().location;
    expect(
      location,
      `${this.name} should have redirect location header`,
    ).toBeTruthy();
    expect(
      location,
      `Expected HTTPS redirect location for ${this.name}`,
    ).toContain('https://');

    this.logResult('HTTPS redirect validated');
  }

  protected logResult(message: string): void {
    console.log(`${this.name}: ${message} (URL: ${this.url})`);
  }
}
