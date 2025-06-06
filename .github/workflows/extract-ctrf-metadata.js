#!/usr/bin/env node

/**
 * CTRF Metadata Extraction for GitHub Actions
 *
 * Parses CTRF test report and extracts metadata for SMS notifications.
 * Replaces the old custom metadata collection system with standardized CTRF format.
 *
 * Outputs GitHub Actions environment variables:
 * - target_url: The monitored endpoint URL from test annotations
 * - error_message: Test failure message for debugging context
 */

const fs = require('node:fs');

const CTRF_REPORT_PATH = 'ctrf/ctrf-report.json';

/**
 * Extract target URL from test annotations
 * @param {Object} test - CTRF test object
 * @returns {string|null} - Target URL or null if not found
 */
function extractTargetUrl(test) {
  // Check CTRF extra.annotations (playwright-ctrf-json-reporter format)
  if (test.extra?.annotations) {
    const targetUrlAnnotation = test.extra.annotations.find(
      (annotation) => annotation.type === 'target-url',
    );
    if (targetUrlAnnotation) {
      return targetUrlAnnotation.description;
    }
  }

  // Check if test has annotations (CTRF standard allows custom properties)
  if (test.annotations) {
    const targetUrlAnnotation = test.annotations.find(
      (annotation) => annotation.type === 'target-url',
    );
    if (targetUrlAnnotation) {
      return targetUrlAnnotation.description;
    }
  }

  // Fallback: check if targetUrl is a direct property (some CTRF reporters support this)
  if (test.targetUrl) {
    return test.targetUrl;
  }

  // Last resort: try to extract URL from test name or message patterns
  const urlPattern = /https?:\/\/[^\s)]+/;
  const nameMatch = test.name?.match(urlPattern);
  if (nameMatch) {
    return nameMatch[0];
  }

  const messageMatch = test.message?.match(urlPattern);
  if (messageMatch) {
    return messageMatch[0];
  }

  return null;
}

/**
 * Extract error message from failed test
 * @param {Object} test - CTRF test object
 * @returns {string} - Error message or default message
 */
function extractErrorMessage(test) {
  if (test.message) {
    return test.message;
  }

  if (test.error?.message) {
    return test.error.message;
  }

  if (test.trace) {
    // Extract first line of stack trace as error summary
    const firstLine = test.trace.split('\n')[0];
    return firstLine || 'Test failed without specific error message';
  }

  return `${test.name} failed`;
}

/**
 * Main extraction function
 */
function extractMetadata() {
  console.log('🔍 Extracting metadata from CTRF report...');

  if (!fs.existsSync(CTRF_REPORT_PATH)) {
    console.error(`❌ CTRF report not found at ${CTRF_REPORT_PATH}`);
    console.log('target_url=');
    console.log('error_message=CTRF report not found');
    process.exit(1);
  }

  let ctrfReport;
  try {
    const reportContent = fs.readFileSync(CTRF_REPORT_PATH, 'utf8');
    ctrfReport = JSON.parse(reportContent);
  } catch (error) {
    console.error(`❌ Failed to parse CTRF report: ${error.message}`);
    console.log('target_url=');
    console.log('error_message=Failed to parse CTRF report');
    process.exit(1);
  }

  const tests = ctrfReport.results?.tests || [];
  console.log(`📊 Found ${tests.length} tests in CTRF report`);

  // Find failed tests
  const failedTests = tests.filter((test) => test.status === 'failed');

  if (failedTests.length === 0) {
    console.log('✅ No failed tests found');
    console.log('target_url=');
    console.log('error_message=');
    return;
  }

  console.log(`❌ Found ${failedTests.length} failed test(s)`);

  // For SMS notifications, we'll report the first failed test
  // (GitHub Actions matrix will handle multiple failures separately)
  const firstFailedTest = failedTests[0];

  const targetUrl = extractTargetUrl(firstFailedTest);
  const errorMessage = extractErrorMessage(firstFailedTest);

  console.log(`🎯 Target URL: ${targetUrl || 'unknown'}`);
  console.log(`💬 Error: ${errorMessage}`);

  // Output for GitHub Actions
  console.log(`target_url=${targetUrl || ''}`);
  console.log(`error_message=${errorMessage}`);

  // Also set GitHub Actions output format (appends to $GITHUB_OUTPUT)
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `target_url=${targetUrl || ''}\n`,
    );
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `error_message=${errorMessage}\n`,
    );
  }

  // Additional debug info
  console.log('\n📋 All failed tests:');
  failedTests.forEach((test, index) => {
    const url = extractTargetUrl(test);
    console.log(`   ${index + 1}. ${test.name} (${url || 'no URL'})`);
  });
}

// Run the extraction
extractMetadata();
