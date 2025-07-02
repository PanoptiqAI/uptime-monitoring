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

/** Marketing landing page - checks for "Visualise and collaborate in 3D" text + Panoptiq logo */
export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page, LANDING_CONFIG);
  }

  /**
   * Simple validation: check for specific text and logo
   */
  protected override async validatePageSpecific(): Promise<void> {
    // Check for "Visualise and collaborate in 3D" text
    await expect(this.page.locator('text="Visualise and collaborate in 3D"')).toBeVisible({
      timeout: 10000,
    });

    // Check for Panoptiq logo (main header logo)
    await expect(this.page.locator('img[alt="PANOPTIQ logo"]')).toBeVisible({
      timeout: 10000,
    });

    this.logResult('Found "Visualise and collaborate in 3D" text and Panoptiq logo');
  }
}
