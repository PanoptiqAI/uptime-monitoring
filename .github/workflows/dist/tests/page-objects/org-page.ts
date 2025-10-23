import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from '../../env';
import { BasePage, type PageConfig } from './base-page';

const ORG_CONFIG: PageConfig = {
  url: env.PANOPTIQ_STUDIO_ORG_URL,
  name: 'Studio Organization Page',
  timeout: 60000,
  performanceThreshold: 60000,
  lcpThreshold: 10000,
  customValidations: true,
};

/** Organization page - validates Panoptiq org profile is visible */
export class OrgPage extends BasePage {
  constructor(page: Page) {
    super(page, ORG_CONFIG);
  }

  protected override async validatePageSpecific(): Promise<void> {
    // Check for organization name PANOPTIQ
    await expect(this.page.locator('text="PANOPTIQ"')).toBeVisible({
      timeout: 10000,
    });

    // Check for @panoptiq identifier
    await expect(this.page.locator('text="@panoptiq"')).toBeVisible({
      timeout: 10000,
    });

    this.logResult('Found PANOPTIQ organization name and @panoptiq identifier');
  }
}
