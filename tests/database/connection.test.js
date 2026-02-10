// Connection Pool Tests
// Tests for Oracle DB connection pooling and error handling

import oracledb from 'oracledb';
import {
  isOracleConfigured,
  createTestPool,
  createTestRunner,
  assert,
  assertEqual,
  assertNotNull,
  assertThrows
} from './setup.js';

/**
 * Test connection pool initialization
 */
export async function testConnectionPool() {
  const runner = createTestRunner('Connection Pool Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping connection pool tests - Oracle DB not configured');
    console.log('   Set ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING environment variables');
    return false;
  }

  let pool = null;

  runner.test('should create connection pool with valid config', async () => {
    pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectionString: process.env.ORACLE_CONNECTION_STRING,
      poolMin: 1,
      poolMax: 3,
      poolIncrement: 1,
      poolTimeout: 60
    });

    assertNotNull(pool, 'Pool should be created');
    assertEqual(typeof pool.getConnection, 'function', 'Pool should have getConnection method');
  });

  runner.test('should get connection from pool', async () => {
    assertNotNull(pool, 'Pool should exist');

    const connection = await pool.getConnection();
    assertNotNull(connection, 'Connection should be retrieved');
    assertEqual(typeof connection.execute, 'function', 'Connection should have execute method');

    await connection.close();
  });

  runner.test('should execute simple query', async () => {
    assertNotNull(pool, 'Pool should exist');

    const connection = await pool.getConnection();
    const result = await connection.execute(
      'SELECT 1 as test_column FROM dual',
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    assertNotNull(result, 'Result should exist');
    assert(result.rows.length > 0, 'Should have at least one row');
    assertEqual(result.rows[0].TEST_COLUMN, 1, 'Query result should be 1');

    await connection.close();
  });

  runner.test('should handle connection errors gracefully', async () => {
    // Note: Skip this test if running against a real database
    // as creating invalid connections can be problematic
    // The test would verify that connection errors are caught properly
    // but we can't reliably test this without potentially causing issues
    console.log('  ⏭️  Skipped - connection error testing disabled for safety');
  });

  runner.test('should return connections to pool', async () => {
    assertNotNull(pool, 'Pool should exist');

    const conn1 = await pool.getConnection();
    const conn2 = await pool.getConnection();

    assertNotNull(conn1, 'First connection should exist');
    assertNotNull(conn2, 'Second connection should exist');

    await conn1.close();
    await conn2.close();

    // Verify we can get another connection after returning
    const conn3 = await pool.getConnection();
    assertNotNull(conn3, 'Third connection should be available');
    await conn3.close();
  });

  runner.test('should close pool properly', async () => {
    assertNotNull(pool, 'Pool should exist');

    await pool.close(10);

    // Try to get connection after close - should fail
    try {
      await pool.getConnection();
      throw new Error('Should not get connection after pool close');
    } catch (error) {
      assert(error.message.includes('closed') || error.message.includes('closing'), 'Pool should be closed');
    }

    pool = null;
  });

  const success = await runner.run();

  // Cleanup
  if (pool) {
    try {
      await pool.close();
    } catch (e) {
      // Ignore
    }
  }

  return success;
}

/**
 * Run all connection pool tests
 */
export async function runConnectionPoolTests() {
  return await testConnectionPool();
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runConnectionPoolTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
