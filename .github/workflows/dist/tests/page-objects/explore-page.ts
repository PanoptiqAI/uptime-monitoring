import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from '../../env';
import { BasePage, type PageConfig } from './base-page';

const EXPLORE_CONFIG: PageConfig = {
  url: env.PANOPTIQ_STUDIO_EXPLORE_URL,
  name: 'Studio Explore Page',
  timeout: 60000,
  performanceThreshold: 60000,
  lcpThreshold: 10000,
  customValidations: true,
};

/** Studio explore page - validates ≥2 experience list item buttons are visible */
export class ExplorePage extends BasePage {
  constructor(page: Page) {
    super(page, EXPLORE_CONFIG);
  }

  protected override async validatePageSpecific(): Promise<void> {
    // Check for buttons with testid matching experience-list-item-<any id>
    const experienceButtons = this.page.locator(
      'button[data-testid^="experience-list-item-"]',
    );

    await expect(experienceButtons.first()).toBeVisible({ timeout: 15000 });
    await expect(experienceButtons.nth(1)).toBeVisible({ timeout: 15000 });

    const count = await experienceButtons.count();
    this.logResult(`Found ${count} experience list item buttons`);
  }
}
