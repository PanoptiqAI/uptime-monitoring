import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from '../../env';
import { BasePage, type PageConfig } from './base-page';

const USERS_CONFIG: PageConfig = {
  url: env.PANOPTIQ_STUDIO_USERS_URL,
  name: 'Studio User Page',
  timeout: 60000,
  performanceThreshold: 60000,
  lcpThreshold: 10000,
  customValidations: true,
};

/** User profile page - validates @panoptiq user identifier is visible */
export class UsersPage extends BasePage {
  constructor(page: Page) {
    super(page, USERS_CONFIG);
  }

  protected override async validatePageSpecific(): Promise<void> {
    // Check for @panoptiq text
    await expect(this.page.locator('text="@panoptiq"')).toBeVisible({
      timeout: 10000,
    });

    this.logResult('Found @panoptiq user identifier');
  }
}
