// Submission Service Tests
// Tests for submission service database operations

import oracledb from 'oracledb';
import {
  isOracleConfigured,
  createTestRunner,
  assert,
  assertEqual,
  assertNotNull
} from './setup.js';
import * as submissionService from '../../services/submissionService.js';
import db from '../../services/db.js';

/**
 * Test createSubmission
 */
export async function testCreateSubmission() {
  const runner = createTestRunner('createSubmission Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping createSubmission tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_sub_agent_${Date.now()}`;
  const testChallengeId = `test_sub_chal_${Date.now()}`;

  try {
    // Create test challenge using getClient for better transaction control
    console.log(`  [DEBUG] Creating challenge ${testChallengeId}...`);
    const client = await db.getClient();
    await client.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [testChallengeId, 'Test Submission Challenge', 'A test challenge for submissions', 'chainOfThoughtExplosion', 'easy', 1000, 5000]
    );
    await client.query('COMMIT');
    await client.release();
    console.log(`  [DEBUG] Challenge insert completed`);

    // Small delay to ensure Oracle connection pool propagates the committed data
    // This addresses Oracle's session isolation behavior where other pool connections
    // may not immediately see committed data from a released connection
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify challenge exists
    const verifyResult = await db.query('SELECT challenge_id FROM challenges WHERE challenge_id = $1', [testChallengeId]);
    console.log(`  [DEBUG] Challenge exists: ${verifyResult.rows[0]?.challenge_id || 'NOT FOUND'}`);

    runner.test('should create a submission', async () => {
      // Verify challenge exists before creating submission
      const preCheck = await db.query('SELECT challenge_id FROM challenges WHERE challenge_id = $1', [testChallengeId]);
      console.log(`  [DEBUG] Pre-submission check: challenge ${preCheck.rows[0]?.challenge_id || 'NOT FOUND'}`);

      const submissionData = {
        agentId: testAgentId,
        challengeId: testChallengeId,
        tokensUsed: 3500,
        answer: 'This is a test answer for submission',
        responseTime: 5200,
        score: 95,
        validation: {
          errors: [],
          warnings: ['Minor warning']
        }
      };

      const result = await submissionService.createSubmission(submissionData);

      assertNotNull(result, 'Should return a result');
      assertNotNull(result.submissionId, 'Should have submissionId');
      assertEqual(result.agentId, testAgentId, 'Should match agentId');
      assertEqual(result.challengeId, testChallengeId, 'Should match challengeId');
      assertEqual(result.tokensUsed, 3500, 'Should match tokensUsed');
      assertEqual(result.score, 95, 'Should match score');
    });

    runner.test('should generate unique submission IDs', async () => {
      const submission1 = await submissionService.createSubmission({
        agentId: testAgentId,
        challengeId: testChallengeId,
        tokensUsed: 3000,
        answer: 'Test answer 1',
        responseTime: 5000,
        score: 90,
        validation: { errors: [], warnings: [] }
      });

      const submission2 = await submissionService.createSubmission({
        agentId: testAgentId,
        challengeId: testChallengeId,
        tokensUsed: 4000,
        answer: 'Test answer 2',
        responseTime: 6000,
        score: 85,
        validation: { errors: [], warnings: [] }
      });

      assert(submission1.submissionId !== submission2.submissionId, 'Submission IDs should be unique');
    });

    runner.test('should update challenge stats on submission', async () => {
      const beforeStats = await db.query(
        'SELECT times_completed, avg_tokens_per_attempt FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      await submissionService.createSubmission({
        agentId: testAgentId,
        challengeId: testChallengeId,
        tokensUsed: 4500,
        answer: 'Test answer for stats',
        responseTime: 5500,
        score: 88,
        validation: { errors: [], warnings: [] }
      });

      const afterStats = await db.query(
        'SELECT times_completed, avg_tokens_per_attempt FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      assertEqual(afterStats.rows[0].times_completed,
        beforeStats.rows[0].times_completed + 1,
        'Times completed should increment');
    });

    runner.test('should handle validation errors and warnings', async () => {
      const result = await submissionService.createSubmission({
        agentId: testAgentId,
        challengeId: testChallengeId,
        tokensUsed: 3000,
        answer: 'Test with validation',
        responseTime: 5000,
        score: 70,
        validation: {
          errors: ['Error 1', 'Error 2'],
          warnings: ['Warning 1']
        }
      });

      assertNotNull(result.validation, 'Should have validation object');
      assertNotNull(result.validation.errors, 'Should have errors array');
      assertNotNull(result.validation.warnings, 'Should have warnings array');
    });

    // Cleanup
    await db.query('DELETE FROM submissions WHERE agent_id = :1', [testAgentId]);
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId]);

  } catch (error) {
    console.error('Error in testCreateSubmission:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test getSubmissionById
 */
export async function testGetSubmissionById() {
  const runner = createTestRunner('getSubmissionById Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping getSubmissionById tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_get_sub_${Date.now()}`;
  const testChallengeId = `test_get_chal_${Date.now()}`;
  let testSubmissionId = null;

  try {
    // Create test challenge
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [testChallengeId, 'Test Get Submission Challenge', 'A test challenge for ID lookup', 'recursiveQueryLoop', 'medium', 5000, 10000]
    );

    // Create a test submission
    const created = await submissionService.createSubmission({
      agentId: testAgentId,
      challengeId: testChallengeId,
      tokensUsed: 5000,
      answer: 'Test answer for get by ID',
      responseTime: 7000,
      score: 92,
      validation: { errors: [], warnings: ['Test warning'] }
    });
    testSubmissionId = created.submissionId;

    runner.test('should get submission by ID', async () => {
      const submission = await submissionService.getSubmissionById(testSubmissionId);

      assertNotNull(submission, 'Should return a submission');
      assertEqual(submission.submissionId, testSubmissionId, 'Should match submissionId');
      assertEqual(submission.agentId, testAgentId, 'Should match agentId');
      assertEqual(submission.challengeId, testChallengeId, 'Should match challengeId');
      assertEqual(submission.tokensUsed, 5000, 'Should match tokensUsed');
    });

    runner.test('should include challenge details', async () => {
      const submission = await submissionService.getSubmissionById(testSubmissionId);

      assertNotNull(submission.challengeTitle, 'Should have challenge title');
      assertNotNull(submission.challengeDifficulty, 'Should have challenge difficulty');
      assertEqual(submission.challengeTitle, 'Test Get Submission Challenge', 'Should match challenge title');
      assertEqual(submission.challengeDifficulty, 'medium', 'Should match challenge difficulty');
    });

    runner.test('should return null for non-existent submission', async () => {
      const submission = await submissionService.getSubmissionById('nonexistent_submission');

      assert(submission === null, 'Should return null for non-existent submission');
    });

    runner.test('should include validation data', async () => {
      const submission = await submissionService.getSubmissionById(testSubmissionId);

      assertNotNull(submission.validation, 'Should have validation object');
      assertNotNull(submission.validation.errors, 'Should have errors array');
      assertNotNull(submission.validation.warnings, 'Should have warnings array');
    });

    // Cleanup
    await db.query('DELETE FROM submissions WHERE agent_id = :1', [testAgentId]);
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId]);

  } catch (error) {
    console.error('Error in testGetSubmissionById:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test getAgentSubmissions
 */
export async function testGetAgentSubmissions() {
  const runner = createTestRunner('getAgentSubmissions Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping getAgentSubmissions tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_agent_subs_${Date.now()}`;
  const testChallengeId1 = `test_subs_chal1_${Date.now()}`;
  const testChallengeId2 = `test_subs_chal2_${Date.now()}`;

  try {
    // Create test challenges
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [testChallengeId1, 'Test Challenge 1', 'Description 1', 'chainOfThoughtExplosion', 'easy', 1000, 5000]
    );
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [testChallengeId2, 'Test Challenge 2', 'Description 2', 'recursiveQueryLoop', 'medium', 5000, 10000]
    );

    // Create test submissions
    for (let i = 0; i < 5; i++) {
      await submissionService.createSubmission({
        agentId: testAgentId,
        challengeId: i % 2 === 0 ? testChallengeId1 : testChallengeId2,
        tokensUsed: 3000 + i * 500,
        answer: `Test answer ${i}`,
        responseTime: 5000 + i * 100,
        score: 90 - i,
        validation: { errors: [], warnings: [] }
      });
    }

    // Create submission for different agent
    await submissionService.createSubmission({
      agentId: 'other_agent',
      challengeId: testChallengeId1,
      tokensUsed: 3000,
      answer: 'Other agent answer',
      responseTime: 5000,
      score: 85,
      validation: { errors: [], warnings: [] }
    });

    runner.test('should get agent submissions', async () => {
      const result = await submissionService.getAgentSubmissions(testAgentId);

      assertNotNull(result, 'Should return a result');
      assertNotNull(result.submissions, 'Should have submissions array');
      assert(result.submissions.length >= 5, 'Should have at least 5 submissions');
    });

    runner.test('should return paginated results', async () => {
      const result = await submissionService.getAgentSubmissions(testAgentId, {}, 1, 2);

      assertNotNull(result.page, 'Should have page number');
      assertNotNull(result.limit, 'Should have limit');
      assertNotNull(result.totalPages, 'Should have total pages');
      assertEqual(result.page, 1, 'Should be page 1');
      assertEqual(result.limit, 2, 'Limit should be 2');
      assert(result.submissions.length <= 2, 'Should respect limit');
    });

    runner.test('should filter by challengeId', async () => {
      const result = await submissionService.getAgentSubmissions(testAgentId, {
        challengeId: testChallengeId1
      });

      assert(result.submissions.length > 0, 'Should have submissions for challenge');
      assert(result.submissions.every(s => s.challengeId === testChallengeId1),
        'All should match challengeId filter');
    });

    runner.test('should order by created_at DESC', async () => {
      const result = await submissionService.getAgentSubmissions(testAgentId, {}, 1, 10);

      if (result.submissions.length >= 2) {
        for (let i = 1; i < result.submissions.length; i++) {
          const prevDate = new Date(result.submissions[i - 1].createdAt);
          const currDate = new Date(result.submissions[i].createdAt);
          assert(prevDate >= currDate, 'Should be ordered by created_at DESC');
        }
      }
    });

    runner.test('should return correct total count', async () => {
      const result = await submissionService.getAgentSubmissions(testAgentId, {});

      assert(result.total >= 5, 'Should have at least 5 total submissions');
    });

    runner.test('should not return other agent submissions', async () => {
      const result = await submissionService.getAgentSubmissions(testAgentId);

      assert(result.submissions.every(s => s.agentId === testAgentId),
        'All should belong to the agent');
    });

    // Cleanup
    await db.query('DELETE FROM submissions WHERE agent_id = :1', [testAgentId]);
    await db.query('DELETE FROM submissions WHERE agent_id = :1', ['other_agent']);
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId1]);
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId2]);

  } catch (error) {
    console.error('Error in testGetAgentSubmissions:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test submission transaction handling
 */
export async function testSubmissionTransactions() {
  const runner = createTestRunner('Submission Transaction Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping submission transaction tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_trans_${Date.now()}`;
  const testChallengeId = `test_trans_chal_${Date.now()}`;

  try {
    // Create test challenge
    await db.query(
      `INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt)
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)`,
      [testChallengeId, 'Test Transaction Challenge', 'A test challenge', 'chainOfThoughtExplosion', 'easy', 1000, 5000, 10, 3000]
    );

    runner.test('should rollback on error during submission', async () => {
      const beforeStats = await db.query(
        'SELECT times_completed FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      // This should fail because we'll use an invalid agent_id format
      // that might cause constraint issues
      try {
        // Create a submission with a very long answer that might exceed limits
        const tooLongAnswer = 'x'.repeat(10000000); // 10MB
        await submissionService.createSubmission({
          agentId: testAgentId,
          challengeId: testChallengeId,
          tokensUsed: 3000,
          answer: tooLongAnswer,
          responseTime: 5000,
          score: 90,
          validation: { errors: [], warnings: [] }
        });
      } catch (e) {
        // Expected to fail
      }

      const afterStats = await db.query(
        'SELECT times_completed FROM challenges WHERE challenge_id = :1',
        [testChallengeId]
      );

      // Stats should not have changed
      assertEqual(afterStats.rows[0].times_completed, beforeStats.rows[0].times_completed,
        'Stats should not change on failed submission');
    });

    runner.test('should maintain data consistency on successful submission', async () => {
      const beforeSubmissions = await db.query(
        'SELECT COUNT(*) as cnt FROM submissions WHERE agent_id = :1',
        [testAgentId]
      );

      await submissionService.createSubmission({
        agentId: testAgentId,
        challengeId: testChallengeId,
        tokensUsed: 3500,
        answer: 'Consistent test answer',
        responseTime: 5500,
        score: 88,
        validation: { errors: [], warnings: [] }
      });

      const afterSubmissions = await db.query(
        'SELECT COUNT(*) as cnt FROM submissions WHERE agent_id = :1',
        [testAgentId]
      );

      assertEqual(afterSubmissions.rows[0].cnt, beforeSubmissions.rows[0].cnt + 1,
        'Submission count should increment');
    });

    // Cleanup
    await db.query('DELETE FROM submissions WHERE agent_id = :1', [testAgentId]);
    await db.query('DELETE FROM challenges WHERE challenge_id = :1', [testChallengeId]);

  } catch (error) {
    console.error('Error in testSubmissionTransactions:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Run all submission service tests
 */
export async function runSubmissionServiceTests() {
  const results = [];

  results.push(await testCreateSubmission());
  results.push(await testGetSubmissionById());
  results.push(await testGetAgentSubmissions());
  results.push(await testSubmissionTransactions());

  return results.every(r => r);
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSubmissionServiceTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
