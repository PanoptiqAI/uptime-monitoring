export interface TestUrl {
  readonly url: string;
  readonly name: string;
}

export interface HealthzEndpoint {
  readonly url: string;
  readonly name: string;
  readonly expectedStatus: number;
  readonly expectedContent?: Record<string, unknown>;
}

interface UrlConfig {
  readonly url: string;
  readonly name: string;
}

interface HealthzConfig {
  readonly url: string;
  readonly name: string;
  readonly expectedStatus: number;
  readonly expectedContent?: Record<string, unknown>;
}

/**
 * URL configuration structure
 */
const URL_CONFIGS: readonly UrlConfig[] = [
  {
    url: 'https://www.panoptiq.ai',
    name: 'Landing Page',
  },
  {
    url: 'https://studio.panoptiq.ai',
    name: 'Studio',
  },
  {
    url: 'https://studio.panoptiq.ai/en/users/panoptiq',
    name: 'Studio User Page',
  },
  {
    url: 'https://studio.panoptiq.ai/en/experiences/embed/qh79fsny7p6kkx22n8vnv1m6fh7gx8cb',
    name: 'Embed Demo',
  },
];

/**
 * Health check endpoints configuration structure
 */
const HEALTHZ_CONFIGS: readonly HealthzConfig[] = [
  {
    url: 'https://www.panoptiq.ai/healthz',
    name: 'Landing Page Healthz',
    expectedStatus: 200,
  },
  {
    url: 'https://studio.panoptiq.ai/healthz',
    name: 'Studio Healthz',
    expectedStatus: 200,
  },
  {
    url: 'https://chttp.panoptiq.ai/healthz',
    name: 'Core API Healthz',
    expectedStatus: 200,
    expectedContent: { status: 'ok' },
  },
];

export const TEST_URLS: readonly TestUrl[] = URL_CONFIGS;
export const HEALTHZ_ENDPOINTS: readonly HealthzEndpoint[] = HEALTHZ_CONFIGS;

/**
 * Centralized performance thresholds for consistent testing
 */
export const PERFORMANCE_THRESHOLDS = {
  // Maximum load time for health checks (in milliseconds)
  MAX_HEALTH_CHECK_TIME: 30000,

  // Maximum load time for performance tests (in milliseconds)
  MAX_PERFORMANCE_TIME: 25000,

  // Healthz endpoint timeout (in milliseconds)
  MAX_HEALTHZ_TIMEOUT: 15000,

  // Response time SLA for health checks (in milliseconds)
  MAX_HEALTHZ_RESPONSE_TIME: 5000,

  // Performance SLA timeout (in milliseconds)
  MAX_PERFORMANCE_SLA_TIME: 3000,

  // Wait timeout for JavaScript errors (in milliseconds)
  JS_ERROR_WAIT_TIME: 2000,

  // Web vitals thresholds
  MAX_LCP: 6000, // Largest Contentful Paint
  MAX_LCP_TIMEOUT: 5000, // LCP measurement timeout
} as const;

/**
 * Error patterns to filter out from console logs
 */
export const NON_CRITICAL_ERROR_PATTERNS = [
  /favicon.*404/i,
  /google.*analytics/i,
  /gtag.*not.*defined/i,
  /third.*party.*script/i,
  /mixpanel/i,
  /hotjar/i,
  /401.*\(\)/i,
  /failed.*to.*load.*resource.*401/i, // Resource loading 401 errors
] as const;

/**
 * HTTP redirect status codes
 */
export const REDIRECT_STATUS_CODES = [301, 302, 307, 308] as const;
