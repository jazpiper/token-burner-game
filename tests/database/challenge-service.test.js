// Challenge Service Tests
// Tests for challenge service database operations

import oracledb from 'oracledb';
import {
  isOracleConfigured,
  createTestPool,
  createTestRunner,
  assert,
  assertEqual,
  assertNotNull,
  cleanupTestChallenge
} from './setup.js';
import * as challengeService from '../../services/challengeService.js';
import db from '../../services/db.js';

/**
 * Test getRandomChallenge
 */
export async function testGetRandomChallenge() {
  const runner = createTestRunner('getRandomChallenge Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping getRandomChallenge tests - Oracle DB not configured');
    return false;
  }

  const testChallengeId = `test_random_${Date.now()}`;

  try {
    // Create test challenge using db module
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [testChallengeId, 'Test Random Challenge', 'A test challenge', 'chainOfThoughtExplosion', 'easy', 1000, 5000]
    );

    runner.test('should get a random challenge', async () => {
      const challenge = await challengeService.getRandomChallenge();

      assertNotNull(challenge, 'Should return a challenge');
      assertNotNull(challenge.challengeId, 'Should have challengeId');
      assertNotNull(challenge.title, 'Should have title');
      assertNotNull(challenge.description, 'Should have description');
      assertNotNull(challenge.type, 'Should have type');
      assertNotNull(challenge.difficulty, 'Should have difficulty');
    });

    runner.test('should get random challenge with difficulty filter', async () => {
      const challenge = await challengeService.getRandomChallenge({ difficulty: 'easy' });

      assertNotNull(challenge, 'Should return a challenge');
      assertEqual(challenge.difficulty, 'easy', 'Should match difficulty filter');
    });

    runner.test('should get random challenge with type filter', async () => {
      const challenge = await challengeService.getRandomChallenge({ type: 'chainOfThoughtExplosion' });

      assertNotNull(challenge, 'Should return a challenge');
      assertEqual(challenge.type, 'chainOfThoughtExplosion', 'Should match type filter');
    });

    runner.test('should get random challenge with both filters', async () => {
      const challenge = await challengeService.getRandomChallenge({
        difficulty: 'easy',
        type: 'chainOfThoughtExplosion'
      });

      assertNotNull(challenge, 'Should return a challenge');
      assertEqual(challenge.difficulty, 'easy', 'Should match difficulty');
      assertEqual(challenge.type, 'chainOfThoughtExplosion', 'Should match type');
    });

    runner.test('should return expectedTokens object', async () => {
      const challenge = await challengeService.getRandomChallenge();

      assertNotNull(challenge.expectedTokens, 'Should have expectedTokens');
      assertNotNull(challenge.expectedTokens.min, 'Should have min tokens');
      assertNotNull(challenge.expectedTokens.max, 'Should have max tokens');
      assert(challenge.expectedTokens.min <= challenge.expectedTokens.max, 'Min should be <= max');
    });

    // Cleanup
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId]);

  } catch (error) {
    console.error('Error in testGetRandomChallenge:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test getChallengeById
 */
export async function testGetChallengeById() {
  const runner = createTestRunner('getChallengeById Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping getChallengeById tests - Oracle DB not configured');
    return false;
  }

  const testChallengeId = `test_by_id_${Date.now()}`;

  try {
    // Use the db module's query to insert challenge
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [testChallengeId, 'Test By ID Challenge', 'A test challenge for ID lookup', 'recursiveQueryLoop', 'medium', 5000, 10000]
    );

    runner.test('should get challenge by ID', async () => {
      const challenge = await challengeService.getChallengeById(testChallengeId);

      assertNotNull(challenge, 'Should return a challenge');
      assertEqual(challenge.challengeId, testChallengeId, 'Should match challenge ID');
      assertEqual(challenge.title, 'Test By ID Challenge', 'Should match title');
      assertEqual(challenge.type, 'recursiveQueryLoop', 'Should match type');
      assertEqual(challenge.difficulty, 'medium', 'Should match difficulty');
    });

    runner.test('should return null for non-existent challenge', async () => {
      const challenge = await challengeService.getChallengeById('nonexistent_challenge');

      assert(challenge === null, 'Should return null for non-existent challenge');
    });

    runner.test('should return all expected fields', async () => {
      const challenge = await challengeService.getChallengeById(testChallengeId);

      assertNotNull(challenge.description, 'Should have description');
      assertNotNull(challenge.expectedTokens, 'Should have expectedTokens');
      assertNotNull(challenge.timesCompleted, 'Should have timesCompleted');
      assertNotNull(challenge.avgTokensPerAttempt, 'Should have avgTokensPerAttempt');
      assertNotNull(challenge.createdAt, 'Should have createdAt');
    });

    // Cleanup
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId]);

  } catch (error) {
    console.error('Error in testGetChallengeById:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test getAllChallenges
 */
export async function testGetAllChallenges() {
  const runner = createTestRunner('getAllChallenges Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping getAllChallenges tests - Oracle DB not configured');
    return false;
  }

  const testPrefix = `test_all_${Date.now()}`;
  const challengeIds = [];

  try {
    // Create test challenges using db module
    for (let i = 0; i < 3; i++) {
      const challengeId = `${testPrefix}_${i}`;
      challengeIds.push(challengeId);
      await db.query(
        `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
         VALUES (:1, :2, :3, :4, :5, :6, :7)`,
        [challengeId, `Test Challenge ${i}`, `Description ${i}`, 'chainOfThoughtExplosion', i === 0 ? 'easy' : 'medium', 1000 + i * 1000, 5000 + i * 1000]
      );
    }

    runner.test('should get all challenges with pagination', async () => {
      const result = await challengeService.getAllChallenges({}, 1, 10);

      assertNotNull(result, 'Should return a result object');
      assertNotNull(result.challenges, 'Should have challenges array');
      assertNotNull(result.total, 'Should have total count');
      assertNotNull(result.page, 'Should have page number');
      assertNotNull(result.limit, 'Should have limit');
      assertNotNull(result.totalPages, 'Should have total pages');
    });

    runner.test('should filter by difficulty', async () => {
      const result = await challengeService.getAllChallenges({ difficulty: 'easy' }, 1, 10);

      assertNotNull(result.challenges, 'Should have challenges');
      assert(result.challenges.length > 0, 'Should have at least one easy challenge');
      assert(result.challenges.every(c => c.difficulty === 'easy'), 'All should be easy');
    });

    runner.test('should filter by type', async () => {
      const result = await challengeService.getAllChallenges({ type: 'chainOfThoughtExplosion' }, 1, 10);

      assertNotNull(result.challenges, 'Should have challenges');
      assert(result.challenges.length > 0, 'Should have at least one challenge');
      assert(result.challenges.every(c => c.type === 'chainOfThoughtExplosion'), 'All should match type');
    });

    runner.test('should respect limit parameter', async () => {
      const result = await challengeService.getAllChallenges({}, 1, 2);

      assert(result.challenges.length <= 2, 'Should respect limit');
    });

    runner.test('should handle pagination correctly', async () => {
      const page1 = await challengeService.getAllChallenges({}, 1, 2);
      const page2 = await challengeService.getAllChallenges({}, 2, 2);

      assertEqual(page1.page, 1, 'Page 1 should have page number 1');
      assertEqual(page2.page, 2, 'Page 2 should have page number 2');

      // If there are enough challenges, pages should be different
      if (page1.challenges.length === 2 && page2.challenges.length > 0) {
        assert(page1.challenges[0].challengeId !== page2.challenges[0].challengeId,
          'Different pages should have different challenges');
      }
    });

    runner.test('should return correct total count', async () => {
      const result = await challengeService.getAllChallenges({}, 1, 100);

      assert(result.total >= 3, 'Should have at least our test challenges');
      assertEqual(result.challenges.length, Math.min(result.total, 100), 'Challenge count should match or be limited');
    });

    // Cleanup
    for (const challengeId of challengeIds) {
      await db.query('DELETE FROM challenges WHERE challenge_id = :1', [challengeId]);
    }

  } catch (error) {
    console.error('Error in testGetAllChallenges:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test updateChallengeStats
 */
export async function testUpdateChallengeStats() {
  const runner = createTestRunner('updateChallengeStats Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping updateChallengeStats tests - Oracle DB not configured');
    return false;
  }

  const testChallengeId = `test_stats_${Date.now()}`;

  try {
    // Create test challenge using db module
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt)
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)`,
      [testChallengeId, 'Test Stats Challenge', 'A test challenge', 'chainOfThoughtExplosion', 'easy', 1000, 5000, 5, 3000]
    );

    runner.test('should update challenge stats', async () => {
      await challengeService.updateChallengeStats(testChallengeId, 4000, 100);

      const result = await db.query(
        'SELECT times_completed, avg_tokens_per_attempt FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      assertNotNull(result.rows[0], 'Should have result row');
      assertEqual(result.rows[0].times_completed, 6, 'Times completed should increment');
      // Average should be (3000 * 5 + 4000) / 6 = 3166.66 -> floor = 3166
      assert(result.rows[0].avg_tokens_per_attempt >= 3166 && result.rows[0].avg_tokens_per_attempt <= 3167,
        'Average should be calculated correctly');
    });

    runner.test('should handle multiple updates', async () => {
      const beforeResult = await db.query(
        'SELECT times_completed FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );
      const before = beforeResult.rows[0].times_completed;

      await challengeService.updateChallengeStats(testChallengeId, 5000, 100);

      const afterResult = await db.query(
        'SELECT times_completed FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );
      const after = afterResult.rows[0].times_completed;

      assertEqual(after, before + 1, 'Should increment by 1');
    });

    runner.test('should handle non-existent challenge gracefully', async () => {
      // Should not throw error
      await challengeService.updateChallengeStats('nonexistent_challenge', 1000, 50);
      // Test passes if no error thrown
    });

    // Cleanup
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId]);

  } catch (error) {
    console.error('Error in testUpdateChallengeStats:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Run all challenge service tests
 */
export async function runChallengeServiceTests() {
  const results = [];

  results.push(await testGetRandomChallenge());
  results.push(await testGetChallengeById());
  results.push(await testGetAllChallenges());
  results.push(await testUpdateChallengeStats());

  return results.every(r => r);
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runChallengeServiceTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
