// SQL Conversion Tests
// Tests for PostgreSQL to Oracle SQL syntax conversion

import { convertSQL } from '../../services/db-oracle.js';
import { createTestRunner, assertEqual } from './setup.js';

/**
 * Test SQL parameter conversion ($1, $2 -> :1, :2)
 */
export async function testParameterConversion() {
  const runner = createTestRunner('SQL Parameter Conversion Tests');

  runner.test('should convert $1 to :1', () => {
    const input = 'SELECT * FROM users WHERE id = $1';
    const expected = 'SELECT * FROM users WHERE id = :1';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Single parameter conversion');
  });

  runner.test('should convert multiple parameters', () => {
    const input = 'SELECT * FROM users WHERE id = $1 AND status = $2';
    const expected = 'SELECT * FROM users WHERE id = :1 AND status = :2';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Multiple parameter conversion');
  });

  runner.test('should convert parameters in complex query', () => {
    const input = 'INSERT INTO submissions (agent_id, tokens_used, score) VALUES ($1, $2, $3)';
    const expected = 'INSERT INTO submissions (agent_id, tokens_used, score) VALUES (:1, :2, :3)';
    const result = convertSQL(input);
    assertEqual(result, expected, 'INSERT with parameters');
  });

  return await runner.run();
}

/**
 * Test LIMIT/OFFSET conversion
 */
export async function testLimitOffsetConversion() {
  const runner = createTestRunner('LIMIT/OFFSET Conversion Tests');

  runner.test('should convert LIMIT with parameter to Oracle syntax', () => {
    const input = 'SELECT * FROM challenges LIMIT $1';
    const expected = 'SELECT * FROM challenges OFFSET 0 ROWS FETCH NEXT :1 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'LIMIT with parameter');
  });

  runner.test('should convert LIMIT and OFFSET with parameters', () => {
    const input = 'SELECT * FROM challenges LIMIT $1 OFFSET $2';
    const expected = 'SELECT * FROM challenges OFFSET :2 ROWS FETCH NEXT :1 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'LIMIT and OFFSET with parameters');
  });

  runner.test('should convert literal LIMIT', () => {
    const input = 'SELECT * FROM challenges LIMIT 10';
    const expected = 'SELECT * FROM challenges OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Literal LIMIT');
  });

  runner.test('should convert literal LIMIT and OFFSET', () => {
    const input = 'SELECT * FROM challenges LIMIT 10 OFFSET 5';
    const expected = 'SELECT * FROM challenges OFFSET 5 ROWS FETCH NEXT 10 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Literal LIMIT and OFFSET');
  });

  runner.test('should handle LIMIT with ORDER BY', () => {
    const input = 'SELECT * FROM challenges ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const expected = 'SELECT * FROM challenges ORDER BY created_at DESC OFFSET :2 ROWS FETCH NEXT :1 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'LIMIT with ORDER BY');
  });

  return await runner.run();
}

/**
 * Test CURRENT_TIMESTAMP conversion
 */
export async function testCurrentTimestampConversion() {
  const runner = createTestRunner('CURRENT_TIMESTAMP Conversion Tests');

  runner.test('should convert CURRENT_TIMESTAMP to SYSTIMESTAMP', () => {
    const input = 'UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE game_id = $1';
    const expected = 'UPDATE games SET updated_at = SYSTIMESTAMP WHERE game_id = :1';
    const result = convertSQL(input);
    assertEqual(result, expected, 'CURRENT_TIMESTAMP in UPDATE');
  });

  runner.test('should convert multiple CURRENT_TIMESTAMP occurrences', () => {
    const input = 'INSERT INTO games (created_at, updated_at) VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
    const expected = 'INSERT INTO games (created_at, updated_at) VALUES (SYSTIMESTAMP, SYSTIMESTAMP)';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Multiple CURRENT_TIMESTAMP');
  });

  return await runner.run();
}

/**
 * Test complex combined conversions
 */
export async function testComplexConversions() {
  const runner = createTestRunner('Complex SQL Conversion Tests');

  runner.test('should handle query with parameters, LIMIT, and OFFSET', () => {
    const input = 'SELECT * FROM submissions WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const expected = 'SELECT * FROM submissions WHERE agent_id = :1 ORDER BY created_at DESC OFFSET :3 ROWS FETCH NEXT :2 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Complex query with all conversions');
  });

  runner.test('should handle INSERT with CURRENT_TIMESTAMP', () => {
    const input = 'INSERT INTO api_keys (api_key, agent_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)';
    const expected = 'INSERT INTO api_keys (api_key, agent_id, created_at) VALUES (:1, :2, SYSTIMESTAMP)';
    const result = convertSQL(input);
    assertEqual(result, expected, 'INSERT with CURRENT_TIMESTAMP');
  });

  runner.test('should handle UPDATE with parameters and timestamp', () => {
    const input = 'UPDATE challenges SET times_completed = times_completed + 1, updated_at = CURRENT_TIMESTAMP WHERE challenge_id = $1';
    const expected = 'UPDATE challenges SET times_completed = times_completed + 1, updated_at = SYSTIMESTAMP WHERE challenge_id = :1';
    const result = convertSQL(input);
    assertEqual(result, expected, 'UPDATE with timestamp');
  });

  runner.test('should preserve query without conversions', () => {
    const input = 'SELECT * FROM challenges WHERE difficulty = \'easy\'';
    const result = convertSQL(input);
    assertEqual(result, input, 'Query without conversions should be preserved');
  });

  return await runner.run();
}

/**
 * Test Oracle-specific SQL syntax
 */
export async function testOracleSpecificSyntax() {
  const runner = createTestRunner('Oracle-Specific SQL Syntax Tests');

  runner.test('should properly format FETCH NEXT clause', () => {
    const input = 'SELECT * FROM games LIMIT 20';
    const expected = 'SELECT * FROM games OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY';
    const result = convertSQL(input);
    assertEqual(result, expected, 'Should have proper FETCH NEXT syntax');
  });

  runner.test('should handle FOR UPDATE clause', () => {
    const input = 'SELECT * FROM challenges WHERE challenge_id = $1 FOR UPDATE';
    const expected = 'SELECT * FROM challenges WHERE challenge_id = :1 FOR UPDATE';
    const result = convertSQL(input);
    assertEqual(result, expected, 'FOR UPDATE should be preserved');
  });

  runner.test('should handle JOIN queries with parameters', () => {
    const input = `SELECT s.*, c.title FROM submissions s
                   LEFT JOIN challenges c ON s.challenge_id = c.challenge_id
                   WHERE s.agent_id = $1 LIMIT $2`;
    const expected = `SELECT s.*, c.title FROM submissions s
                   LEFT JOIN challenges c ON s.challenge_id = c.challenge_id
                   WHERE s.agent_id = :1 OFFSET 0 ROWS FETCH NEXT :2 ROWS ONLY`;
    const result = convertSQL(input);
    assertEqual(result.trim(), expected.trim(), 'JOIN with parameters');
  });

  return await runner.run();
}

/**
 * Run all SQL conversion tests
 */
export async function runSQLConversionTests() {
  const results = [];

  results.push(await testParameterConversion());
  results.push(await testLimitOffsetConversion());
  results.push(await testCurrentTimestampConversion());
  results.push(await testComplexConversions());
  results.push(await testOracleSpecificSyntax());

  return results.every(r => r);
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSQLConversionTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
