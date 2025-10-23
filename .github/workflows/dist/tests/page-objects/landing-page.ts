import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from '../../env';
import { BasePage, type PageConfig } from './base-page';

const LANDING_CONFIG: PageConfig = {
  url: env.PANOPTIQ_LANDING_URL,
  name: 'Landing Page',
  timeout: 60000,
  performanceThreshold: 60000,
  lcpThreshold: 15000,
  customValidations: true,
};

/** Marketing landing page - checks for structural elements (heading, logo, interactive elements) */
export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page, LANDING_CONFIG);
  }

  /**
   * Simple validation: check for key structural elements
   * Language-agnostic: doesn't check specific text, just that page loaded correctly
   */
  protected override async validatePageSpecific(): Promise<void> {
    // Check for main heading (any h1 is sufficient)
    await expect(this.page.locator('h1').first()).toBeVisible({
      timeout: 10000,
    });

    // Check for Panoptiq logo (main header logo)
    await expect(this.page.locator('img[alt="PANOPTIQ logo"]')).toBeVisible({
      timeout: 10000,
    });

    // Verify CTA buttons are present (key interactive elements)
    const buttonCount = await this.page.locator('button, a[href]').count();
    expect(
      buttonCount,
      'Landing page should have interactive elements (buttons/links)',
    ).toBeGreaterThan(0);

    this.logResult(
      `Found main heading, Panoptiq logo, and ${buttonCount} interactive elements`,
    );
  }
}
