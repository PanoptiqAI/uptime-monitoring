import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from '../../env';
import { BasePage, type PageConfig } from './base-page';

const STUDIO_CONFIG: PageConfig = {
  url: env.PANOPTIQ_STUDIO_URL,
  name: 'Studio',
  timeout: 60000,
  performanceThreshold: 60000,
  lcpThreshold: 10000,
  customValidations: true,
};

/** Studio root - auto-redirects to /en/explore, validates redirect + explore link */
export class StudioPage extends BasePage {
  constructor(page: Page) {
    super(page, STUDIO_CONFIG);
  }

  protected override async validatePageSpecific(): Promise<void> {
    // Verify we've been redirected to /en/explore (location agnostic)
    await this.page.waitForURL('**/en/explore', { timeout: 10000 });

    const currentUrl = this.page.url();
    expect(currentUrl).toMatch(/\/en\/explore$/);

    // Check for explore link with href="/explore" on the page
    const exploreLink = this.page.locator('a[href="/explore"]', {
      hasText: 'explore',
    });
    await expect(exploreLink).toBeVisible({ timeout: 10000 });

    this.logResult('Auto-redirected to /en/explore and found explore link');
  }
}
