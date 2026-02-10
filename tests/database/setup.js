// Database Test Setup
// Provides utilities for testing Oracle DB integration

import oracledb from 'oracledb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test database configuration
 */
export const testConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectionString: process.env.ORACLE_CONNECTION_STRING,
  poolMin: 1,
  poolMax: 3,
  poolIncrement: 1,
  poolTimeout: 60,
  stmtCacheSize: 23
};

/**
 * Check if Oracle DB credentials are configured
 */
export function isOracleConfigured() {
  return !!(testConfig.user && testConfig.password && testConfig.connectionString);
}

/**
 * Create test connection pool
 */
export async function createTestPool() {
  if (!isOracleConfigured()) {
    throw new Error('Oracle DB credentials not configured. Set ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING.');
  }

  return await oracledb.createPool(testConfig);
}

/**
 * Clean up test data
 */
export async function cleanupTestData(pool, testAgentId) {
  const connection = await pool.getConnection();

  try {
    // Clean up in correct order due to foreign keys
    await connection.execute(
      `DELETE FROM game_actions WHERE game_id IN (SELECT game_id FROM games WHERE agent_id = :1)`,
      [testAgentId]
    );

    await connection.execute(
      `DELETE FROM games WHERE agent_id = :1`,
      [testAgentId]
    );

    await connection.execute(
      `DELETE FROM submissions WHERE agent_id = :1`,
      [testAgentId]
    );

    await connection.execute(
      `DELETE FROM api_keys WHERE agent_id = :1`,
      [testAgentId]
    );

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

/**
 * Create test challenge
 */
export async function createTestChallenge(connection, challengeData) {
  const defaultChallenge = {
    challengeId: `test_chal_${Date.now()}`,
    title: 'Test Challenge',
    description: 'A test challenge for unit testing',
    type: 'chainOfThoughtExplosion',
    difficulty: 'easy',
    expectedTokensMin: 1000,
    expectedTokensMax: 5000
  };

  const challenge = { ...defaultChallenge, ...challengeData };

  await connection.execute(
    `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
     VALUES (:1, :2, :3, :4, :5, :6, :7)`,
    [
      challenge.challengeId,
      challenge.title,
      challenge.description,
      challenge.type,
      challenge.difficulty,
      challenge.expectedTokensMin,
      challenge.expectedTokensMax
    ]
  );

  await connection.commit();

  return challenge;
}

/**
 * Clean up test challenge
 */
export async function cleanupTestChallenge(connection, challengeId) {
  await connection.execute(
    `DELETE FROM submissions WHERE challenge_id = :1`,
    [challengeId]
  );

  await connection.execute(
    `DELETE FROM challenges WHERE challenge_id LIKE :1`,
    [`${challengeId}%`]
  );

  await connection.commit();
}

/**
 * Create test API key
 */
export async function createTestApiKey(connection, agentId) {
  const apiKey = `test_key_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  await connection.execute(
    `INSERT INTO api_keys (api_key, agent_id, ip) VALUES (:1, :2, :3)`,
    [apiKey, agentId, '127.0.0.1']
  );

  await connection.commit();

  return apiKey;
}

/**
 * Assert helper
 */
export function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert equals helper
 */
export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

/**
 * Assert not null helper
 */
export function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message} - value is null or undefined`);
  }
}

/**
 * Assert throws helper
 */
export async function assertThrows(fn, expectedMessage = null) {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", but got "${error.message}"`);
    }
    return error;
  }
}

/**
 * Test runner
 */
export class TestRunner {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  async run() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${this.name}`);
    console.log('='.repeat(60));

    for (const { description, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`  ✅ ${description}`);
      } catch (error) {
        this.failed++;
        console.log(`  ❌ ${description}`);
        console.log(`     Error: ${error.message}`);
      }
    }

    console.log('-'.repeat(60));
    console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(60));

    return this.failed === 0;
  }
}

/**
 * Create a test runner instance
 */
export function createTestRunner(name) {
  return new TestRunner(name);
}
