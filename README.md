# Uptime Monitoring

Uptime monitoring for PANOPTIQ services. 

## Structure

- `.github/workflows/health-check.yml` - Main workflow with scheduling and SMS notifications
- `.github/workflows/cli.js` - Prebuilt health check CLI
- `.github/workflows/extract-ctrf-metadata.js` - Metadata extraction for SMS alerts
