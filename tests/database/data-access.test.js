// Data Access Layer Tests
// Tests for database query and client functions

import oracledb from 'oracledb';
import {
  isOracleConfigured,
  createTestPool,
  createTestRunner,
  assert,
  assertEqual,
  assertNotNull,
  cleanupTestData,
  createTestChallenge,
  cleanupTestChallenge,
  createTestApiKey
} from './setup.js';
import db from '../../services/db.js';

/**
 * Test basic query function
 */
export async function testQueryFunction() {
  const runner = createTestRunner('Query Function Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping query function tests - Oracle DB not configured');
    return false;
  }

  let pool = null;
  let connection = null;

  try {
    pool = await createTestPool();
    connection = await pool.getConnection();

    runner.test('should execute simple SELECT query', async () => {
      const result = await db.query('SELECT 1 as test_val FROM dual');
      assertNotNull(result, 'Result should exist');
      assertNotNull(result.rows, 'Result should have rows');
      assert(result.rows.length > 0, 'Should have at least one row');
    });

    runner.test('should handle query with parameters', async () => {
      const result = await db.query('SELECT :1 as val FROM dual', [42]);
      assertEqual(result.rows[0].val, 42, 'Parameter value should match');
    });

    runner.test('should handle multiple parameters', async () => {
      const result = await db.query(
        'SELECT :1 as a, :2 as b, :3 as c FROM dual',
        [1, 2, 3]
      );
      assertEqual(result.rows[0].a, 1, 'First param should be 1');
      assertEqual(result.rows[0].b, 2, 'Second param should be 2');
      assertEqual(result.rows[0].c, 3, 'Third param should be 3');
    });

    runner.test('should return empty array for no results', async () => {
      const result = await db.query(
        'SELECT * FROM challenges WHERE challenge_id = :1',
        ['nonexistent_challenge']
      );
      assertEqual(result.rows.length, 0, 'Should return empty array');
    });

    runner.test('should convert column names to lowercase', async () => {
      const result = await db.query('SELECT 1 as TestColumn FROM dual');
      assert(result.rows[0].testcolumn !== undefined || result.rows[0].test_column !== undefined,
        'Column name should be lowercase');
    });

  } finally {
    if (connection) await connection.close();
    if (pool) await pool.close();
  }

  return await runner.run();
}

/**
 * Test client/transaction function
 */
export async function testClientFunction() {
  const runner = createTestRunner('Client/Transaction Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping client function tests - Oracle DB not configured');
    return false;
  }

  let pool = null;

  try {
    pool = await createTestPool();

    runner.test('should get client from pool', async () => {
      const client = await db.getClient();
      assertNotNull(client, 'Client should exist');
      assertNotNull(client.conn, 'Client should have connection');
      assertNotNull(client.query, 'Client should have query method');
      assertNotNull(client.release, 'Client should have release method');
      await client.release();
    });

    runner.test('should execute BEGIN transaction', async () => {
      const client = await db.getClient();
      const result = await client.query('BEGIN');
      assertEqual(result.rows.length, 0, 'BEGIN should return empty rows');
      await client.release();
    });

    runner.test('should execute COMMIT', async () => {
      const client = await db.getClient();
      await client.query('BEGIN');
      const result = await client.query('COMMIT');
      assertEqual(result.rows.length, 0, 'COMMIT should return empty rows');
      await client.release();
    });

    runner.test('should execute ROLLBACK', async () => {
      const client = await db.getClient();
      await client.query('BEGIN');
      const result = await client.query('ROLLBACK');
      assertEqual(result.rows.length, 0, 'ROLLBACK should return empty rows');
      await client.release();
    });

    runner.test('should handle query within transaction', async () => {
      const client = await db.getClient();

      await client.query('BEGIN');
      const result = await client.query('SELECT 1 as val FROM dual', []);
      assertEqual(result.rows[0].val, 1, 'Query in transaction should work');
      await client.query('COMMIT');

      await client.release();
    });

    runner.test('should rollback on release when in transaction', async () => {
      const client = await db.getClient();
      const connection = await pool.getConnection();

      // Create a test table for this test
      try {
        await connection.execute(`CREATE TABLE test_rollback_table (id NUMBER, name VARCHAR2(50))`);
        await connection.commit();
      } catch (e) {
        // Table might exist, drop it first
        try {
          await connection.execute(`DROP TABLE test_rollback_table PURGE`);
          await connection.execute(`CREATE TABLE test_rollback_table (id NUMBER, name VARCHAR2(50))`);
          await connection.commit();
        } catch (e2) {
          // Ignore
        }
      }
      await connection.close();

      await client.query('BEGIN');
      await client.query('INSERT INTO test_rollback_table VALUES (:1, :2)', [1, 'test']);

      // Release without commit - should rollback
      await client.release();

      // Verify rollback worked
      const checkConn = await pool.getConnection();
      const result = await checkConn.execute('SELECT COUNT(*) as cnt FROM test_rollback_table', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      assertEqual(result.rows[0].CNT, 0, 'Row should have been rolled back');
      await checkConn.close();

      // Cleanup
      const cleanupConn = await pool.getConnection();
      await cleanupConn.execute(`DROP TABLE test_rollback_table PURGE`);
      await cleanupConn.commit();
      await cleanupConn.close();
    });

  } finally {
    if (pool) await pool.close();
  }

  return await runner.run();
}

/**
 * Test CRUD operations
 */
export async function testCRUDOperations() {
  const runner = createTestRunner('CRUD Operations Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping CRUD tests - Oracle DB not configured');
    return false;
  }

  let pool = null;
  const testAgentId = `test_agent_${Date.now()}`;
  let testChallengeId = null;
  let testSubmissionId = null;

  try {
    pool = await createTestPool();
    const connection = await pool.getConnection();

    // Create test challenge
    const challenge = await createTestChallenge(connection, {
      challengeId: `test_chal_${Date.now()}`,
      difficulty: 'easy'
    });
    testChallengeId = challenge.challengeId;

    await connection.close();

    runner.test('should insert submission record', async () => {
      testSubmissionId = `sub_${Date.now()}`;

      await db.query(
        `INSERT INTO submissions (submission_id, agent_id, challenge_id, tokens_used, answer, response_time, score)
         VALUES (:1, :2, :3, :4, :5, :6, :7)`,
        [testSubmissionId, testAgentId, testChallengeId, 1000, 'test answer', 500, 100]
      );

      // Verify insertion
      const result = await db.query(
        'SELECT * FROM submissions WHERE submission_id = :1',
        [testSubmissionId]
      );

      assert(result.rows.length > 0, 'Submission should be inserted');
      assertEqual(result.rows[0].agent_id, testAgentId, 'Agent ID should match');
    });

    runner.test('should update submission record', async () => {
      await db.query(
        'UPDATE submissions SET score = :1 WHERE submission_id = :2',
        [200, testSubmissionId]
      );

      const result = await db.query(
        'SELECT score FROM submissions WHERE submission_id = :1',
        [testSubmissionId]
      );

      assertEqual(result.rows[0].score, 200, 'Score should be updated');
    });

    runner.test('should select with filters', async () => {
      const result = await db.query(
        'SELECT * FROM submissions WHERE agent_id = :1 AND challenge_id = :2',
        [testAgentId, testChallengeId]
      );

      assert(result.rows.length > 0, 'Should find submission with filters');
      assertEqual(result.rows[0].agent_id, testAgentId, 'Filter should work');
    });

    runner.test('should handle pagination with LIMIT and OFFSET', async () => {
      // Insert multiple submissions
      for (let i = 0; i < 5; i++) {
        await db.query(
          `INSERT INTO submissions (submission_id, agent_id, challenge_id, tokens_used, answer, response_time, score)
           VALUES (:1, :2, :3, :4, :5, :6, :7)`,
          [`sub_${Date.now()}_${i}`, testAgentId, testChallengeId, 1000 + i, 'test answer', 500, 100]
        );
      }

      const result = await db.query(
        'SELECT * FROM submissions WHERE agent_id = :1 LIMIT :2 OFFSET :3',
        [testAgentId, 2, 0]
      );

      assert(result.rows.length <= 2, 'Should respect LIMIT');
    });

    runner.test('should delete submission record', async () => {
      await db.query(
        'DELETE FROM submissions WHERE submission_id = :1',
        [testSubmissionId]
      );

      const result = await db.query(
        'SELECT * FROM submissions WHERE submission_id = :1',
        [testSubmissionId]
      );

      assertEqual(result.rows.length, 0, 'Submission should be deleted');
    });

    // Cleanup
    const cleanupConn = await pool.getConnection();
    await cleanupTestData(pool, testAgentId);
    await cleanupTestChallenge(cleanupConn, testChallengeId);
    await cleanupConn.close();

  } finally {
    if (pool) await pool.close();
  }

  return await runner.run();
}

/**
 * Test CLOB handling
 */
export async function testCLOBHandling() {
  const runner = createTestRunner('CLOB Handling Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping CLOB tests - Oracle DB not configured');
    return false;
  }

  let pool = null;
  const testAgentId = `test_clob_${Date.now()}`;
  let testChallengeId = null;

  try {
    pool = await createTestPool();
    const connection = await pool.getConnection();

    // Create test challenge with long description
    const longDescription = 'a'.repeat(10000); // 10KB of text
    const challenge = await createTestChallenge(connection, {
      challengeId: `test_chal_clob_${Date.now()}`,
      description: longDescription
    });
    testChallengeId = challenge.challengeId;

    await connection.close();

    runner.test('should store CLOB data', async () => {
      const result = await db.query(
        'SELECT description FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      assertNotNull(result.rows[0], 'Challenge should exist');
      assertNotNull(result.rows[0].description, 'Description (CLOB) should be retrieved');
      assert(result.rows[0].description.length > 0, 'CLOB should have content');
    });

    runner.test('should retrieve large CLOB data', async () => {
      const result = await db.query(
        'SELECT description FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      // The CLOB should be converted to string
      const description = result.rows[0].description;
      assert(description.length === longDescription.length, 'CLOB length should match');
      assert(description.startsWith('aaa'), 'CLOB content should match');
    });

    runner.test('should handle JSON in CLOB', async () => {
      const jsonData = JSON.stringify({ error: ['Error 1', 'Error 2'], warning: ['Warning'] });

      await db.query(
        'UPDATE challenges SET description = :1 WHERE challenge_id = :2',
        [jsonData, testChallengeId]
      );

      const result = await db.query(
        'SELECT description FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      const parsed = JSON.parse(result.rows[0].description);
      assert(parsed.error.length === 2, 'JSON should be parsed correctly');
    });

    // Cleanup
    const cleanupConn = await pool.getConnection();
    await cleanupTestChallenge(cleanupConn, testChallengeId);
    await cleanupConn.close();

  } finally {
    if (pool) await pool.close();
  }

  return await runner.run();
}

/**
 * Test connection pool persistence
 */
export async function testConnectionPoolPersistence() {
  const runner = createTestRunner('Connection Pool Persistence Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping pool persistence tests - Oracle DB not configured');
    return false;
  }

  // Close existing pool if any
  await db.closePool();

  runner.test('should initialize pool on first query', async () => {
    const poolBefore = db.pool;
    assert(poolBefore === null, 'Pool should be null before first query');

    await db.query('SELECT 1 FROM dual');

    const poolAfter = db.pool;
    assertNotNull(poolAfter, 'Pool should be initialized after first query');
  });

  runner.test('should reuse pool for subsequent queries', async () => {
    const pool1 = db.pool;

    await db.query('SELECT 1 FROM dual');

    const pool2 = db.pool;
    assert(pool1 === pool2, 'Pool should be reused');
  });

  runner.test('should handle multiple concurrent queries', async () => {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(db.query('SELECT :1 as val FROM dual', [i]));
    }

    const results = await Promise.all(promises);
    assert(results.length === 10, 'All queries should complete');
    assert(results.every(r => r.rows.length > 0), 'All queries should return results');
  });

  runner.test('should close pool gracefully', async () => {
    assertNotNull(db.pool, 'Pool should exist');

    await db.closePool();

    const poolAfter = db.pool;
    assert(poolAfter === null, 'Pool should be null after close');
  });

  return await runner.run();
}

/**
 * Run all data access tests
 */
export async function runDataAccessTests() {
  const results = [];

  results.push(await testQueryFunction());
  results.push(await testClientFunction());
  results.push(await testCRUDOperations());
  results.push(await testCLOBHandling());
  results.push(await testConnectionPoolPersistence());

  return results.every(r => r);
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDataAccessTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
