// Main Test Runner for Oracle DB Integration
// Runs all database unit tests

import { isOracleConfigured } from './setup.js';
import { runConnectionPoolTests } from './connection.test.js';
import { runSQLConversionTests } from './sql-conversion.test.js';
import { runDataAccessTests } from './data-access.test.js';
import { runChallengeServiceTests } from './challenge-service.test.js';
import { runSubmissionServiceTests } from './submission-service.test.js';
import { runGameServiceTests } from './game-service.test.js';

/**
 * Print test header
 */
function printHeader(text) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${text}`);
  console.log('='.repeat(80));
}

/**
 * Print test section
 */
function printSection(text) {
  console.log('\n' + '-'.repeat(80));
  console.log(`  ${text}`);
  console.log('-'.repeat(80));
}

/**
 * Main test execution
 */
async function main() {
  printHeader('Oracle DB Integration Test Suite');

  // Check if Oracle is configured
  if (!isOracleConfigured()) {
    console.log('\n⚠️  WARNING: Oracle DB credentials not configured!');
    console.log('   Set the following environment variables:');
    console.log('   - ORACLE_USER');
    console.log('   - ORACLE_PASSWORD');
    console.log('   - ORACLE_CONNECTION_STRING');
    console.log('\n   Only SQL conversion tests will run (they don\'t require a connection).\n');
  }

  const results = {
    passed: 0,
    failed: 0,
    suites: []
  };

  // Test Suite 1: SQL Conversion Tests (no DB required)
  printSection('Test Suite 1: SQL Conversion Tests');
  try {
    const sqlConversionPassed = await runSQLConversionTests();
    results.suites.push({ name: 'SQL Conversion', passed: sqlConversionPassed });
    if (sqlConversionPassed) {
      results.passed++;
      console.log('  ✅ SQL Conversion Tests PASSED');
    } else {
      results.failed++;
      console.log('  ❌ SQL Conversion Tests FAILED');
    }
  } catch (error) {
    results.failed++;
    results.suites.push({ name: 'SQL Conversion', passed: false, error: error.message });
    console.error(`  ❌ SQL Conversion Tests ERROR: ${error.message}`);
  }

  // Skip remaining tests if Oracle is not configured
  if (!isOracleConfigured()) {
    printHeader('Test Results Summary');
    console.log(`  Total Suites: ${results.suites.length}`);
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    console.log(`  Skipped: 5 (Oracle DB not configured)`);
    console.log('\n⚠️  Configure Oracle DB credentials to run all tests.');
    console.log('='.repeat(80) + '\n');
    return results.failed === 0;
  }

  // Test Suite 2: Connection Pool Tests
  printSection('Test Suite 2: Connection Pool Tests');
  try {
    const connectionPoolPassed = await runConnectionPoolTests();
    results.suites.push({ name: 'Connection Pool', passed: connectionPoolPassed });
    if (connectionPoolPassed) {
      results.passed++;
      console.log('  ✅ Connection Pool Tests PASSED');
    } else {
      results.failed++;
      console.log('  ❌ Connection Pool Tests FAILED');
    }
  } catch (error) {
    results.failed++;
    results.suites.push({ name: 'Connection Pool', passed: false, error: error.message });
    console.error(`  ❌ Connection Pool Tests ERROR: ${error.message}`);
  }

  // Test Suite 3: Data Access Tests
  printSection('Test Suite 3: Data Access Layer Tests');
  try {
    const dataAccessPassed = await runDataAccessTests();
    results.suites.push({ name: 'Data Access Layer', passed: dataAccessPassed });
    if (dataAccessPassed) {
      results.passed++;
      console.log('  ✅ Data Access Layer Tests PASSED');
    } else {
      results.failed++;
      console.log('  ❌ Data Access Layer Tests FAILED');
    }
  } catch (error) {
    results.failed++;
    results.suites.push({ name: 'Data Access Layer', passed: false, error: error.message });
    console.error(`  ❌ Data Access Layer Tests ERROR: ${error.message}`);
  }

  // Test Suite 4: Challenge Service Tests
  printSection('Test Suite 4: Challenge Service Tests');
  try {
    const challengeServicePassed = await runChallengeServiceTests();
    results.suites.push({ name: 'Challenge Service', passed: challengeServicePassed });
    if (challengeServicePassed) {
      results.passed++;
      console.log('  ✅ Challenge Service Tests PASSED');
    } else {
      results.failed++;
      console.log('  ❌ Challenge Service Tests FAILED');
    }
  } catch (error) {
    results.failed++;
    results.suites.push({ name: 'Challenge Service', passed: false, error: error.message });
    console.error(`  ❌ Challenge Service Tests ERROR: ${error.message}`);
  }

  // Test Suite 5: Submission Service Tests
  printSection('Test Suite 5: Submission Service Tests');
  try {
    const submissionServicePassed = await runSubmissionServiceTests();
    results.suites.push({ name: 'Submission Service', passed: submissionServicePassed });
    if (submissionServicePassed) {
      results.passed++;
      console.log('  ✅ Submission Service Tests PASSED');
    } else {
      results.failed++;
      console.log('  ❌ Submission Service Tests FAILED');
    }
  } catch (error) {
    results.failed++;
    results.suites.push({ name: 'Submission Service', passed: false, error: error.message });
    console.error(`  ❌ Submission Service Tests ERROR: ${error.message}`);
  }

  // Test Suite 6: Game Service Tests
  printSection('Test Suite 6: Game Service Tests');
  try {
    const gameServicePassed = await runGameServiceTests();
    results.suites.push({ name: 'Game Service', passed: gameServicePassed });
    if (gameServicePassed) {
      results.passed++;
      console.log('  ✅ Game Service Tests PASSED');
    } else {
      results.failed++;
      console.log('  ❌ Game Service Tests FAILED');
    }
  } catch (error) {
    results.failed++;
    results.suites.push({ name: 'Game Service', passed: false, error: error.message });
    console.error(`  ❌ Game Service Tests ERROR: ${error.message}`);
  }

  // Print final summary
  printHeader('Test Results Summary');
  console.log(`  Total Test Suites: ${results.suites.length}`);
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Success Rate: ${((results.passed / results.suites.length) * 100).toFixed(1)}%`);

  // Detailed results
  if (results.failed > 0) {
    console.log('\n  Failed Suites:');
    results.suites
      .filter(suite => !suite.passed)
      .forEach(suite => {
        console.log(`    - ${suite.name}${suite.error ? `: ${suite.error}` : ''}`);
      });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  return results.failed === 0;
}

// Run tests
main().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});
