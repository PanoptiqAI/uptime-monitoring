import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { env } from '../../env';
import { makeRequest, makeRequestWithText } from '../test-utils';

const EMBED_CONFIG = {
  url: env.PANOPTIQ_EMBED_DEMO_URL,
  name: 'Embed Demo',
  timeout: 15000,
} as const;

/**
 * WebGL embed demo - HTTP-only validation approach
 *
 * Note: This "page object" doesn't use browser automation due to WebGL/GPU limitations.
 * WebGL/Canvas content requires hardware acceleration which is not available in headless CI.
 * Instead of using Playwright's page automation, we use direct HTTP requests to validate:
 * - Server responds with 200 status
 * - Content-Type is HTML
 * - Response contains meaningful content
 * - No obvious error indicators in HTML
 *
 * This approach is much faster and more reliable in CI environments while still
 * validating that the embed endpoint is functional and serving content.
 */
export class EmbedPage {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;

    // Register URL as test annotation for CTRF metadata collection
    test.info().annotations.push({
      type: 'target-url',
      description: EMBED_CONFIG.url,
    });
  }

  get url(): string {
    return EMBED_CONFIG.url;
  }

  get name(): string {
    return EMBED_CONFIG.name;
  }

  async runHealthCheck(): Promise<void> {
    const result = await makeRequest(this.request, EMBED_CONFIG.url, {
      timeout: EMBED_CONFIG.timeout,
      failOnStatusCode: false,
    });

    expect(result.status, `${this.name} should return 200 status`).toBe(200);
    expect(result.contentType, 'Should return HTML content').toContain(
      'text/html',
    );

    console.log(
      `✓ ${this.name} accessible: ${result.status} (${result.responseTime}ms)`,
    );
  }

  async validateContent(): Promise<void> {
    const { result, text } = await makeRequestWithText(
      this.request,
      EMBED_CONFIG.url,
      {
        timeout: EMBED_CONFIG.timeout,
        failOnStatusCode: false,
      },
    );

    expect(result.status, `${this.name} should return 200 status`).toBe(200);

    expect(
      text.length,
      'Response should contain meaningful content',
    ).toBeGreaterThan(1000);
    expect(text, 'Should contain HTML structure').toContain('<html');

    // Validate the page title to ensure it's the correct embed page
    expect(text, 'Should contain expected page title').toContain(
      '<title>Arosa Hörnli - Switzerland | PANOPTIQ</title>',
    );

    // Ensure it's a Next.js app
    expect(text, 'Should contain Next.js app structure').toContain('__next');

    console.log(
      `✓ ${this.name} returned ${text.length} characters of HTML content`,
    );
  }

  async validatePerformance(): Promise<void> {
    const result = await makeRequest(this.request, EMBED_CONFIG.url, {
      timeout: EMBED_CONFIG.timeout,
      failOnStatusCode: false,
    });

    expect(result.status, `${this.name} should return 200 status`).toBe(200);
    expect(
      result.responseTime,
      `${this.name} should respond quickly`,
    ).toBeLessThan(10000);

    console.log(`✓ ${this.name} performance: ${result.responseTime}ms`);
  }
}
