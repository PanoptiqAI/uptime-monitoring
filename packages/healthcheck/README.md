# Health Check Tests

This package contains health check tests that run against live online services to monitor uptime and performance.

## Setup

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm run playwright:install
```

## Running Tests

```bash
# Run health checks against development environment
pnpm run healthcheck:development

# Run health checks against production environment
pnpm run healthcheck:production

# Run health checks with Playwright UI mode
pnpm run healthcheck:development:ui
```

## GitHub Actions

These tests run automatically every 30 minutes via the Health Check workflow to monitor service uptime.

## Tests

### Smoke Tests
- **Panoptiq Landing Page**: Verifies the landing page loads without console errors and displays the "Showcase your" text
- **Studio Smoke Test**: Verifies the Studio featured page loads without console errors and displays experiences
- **Health Check**: Verifies critical pages (landing, studio) are accessible and APIs are responding

### Performance Tests
- **Performance Metrics**: Measures page load times and Core Web Vitals (LCP, CLS)
- **Load Time Limits**: Ensures pages load within acceptable time limits (5s for landing, 7s for studio)

### Accessibility Tests
- **WCAG Compliance**: Checks for proper headings, alt text, ARIA labels, and keyboard navigation
- **Color Contrast**: Verifies text has sufficient contrast against backgrounds
- **Form Labels**: Ensures all form inputs have associated labels

### Mobile Tests
- **Responsive Design**: Tests on iPhone 12, Pixel 5, and iPad Mini viewports
- **Touch Targets**: Verifies interactive elements are at least 44x44px for touch
- **Orientation Changes**: Ensures no horizontal scroll in portrait/landscape modes

### Security Tests
- **Security Headers**: Verifies X-Frame-Options, CSP, HSTS, and other security headers
- **Information Disclosure**: Ensures no sensitive server information is exposed
- **HTTPS Redirect**: Verifies HTTP traffic is redirected to HTTPS