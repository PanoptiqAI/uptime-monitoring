import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from '../../env';
import { BasePage, type PageConfig } from './base-page';

const STATUS_CONFIG: PageConfig = {
  url: env.PANOPTIQ_STATUS_URL || '',
  name: 'Status Page',
  timeout: 60000,
  performanceThreshold: 60000,
  lcpThreshold: 10000,
  customValidations: true,
};

/** Status monitoring page - validates "All services are online" text */
export class StatusPage extends BasePage {
  constructor(page: Page) {
    super(page, STATUS_CONFIG);
  }

  protected override async validatePageSpecific(): Promise<void> {
    await expect(
      this.page.locator('text="All services are online"'),
    ).toBeVisible({ timeout: 10000 });

    this.logResult('Confirmed: All services are online');
  }
}
