// Submission Service
// Manages challenge submissions

import db from './db.js';

function generateSubmissionId() {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

async function createSubmission(data) {
  const submissionId = generateSubmissionId();
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Insert submission
    await client.query(
      `INSERT INTO submissions
      (submission_id, agent_id, challenge_id, tokens_used, answer, response_time, score, validation_errors, validation_warnings, validated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        submissionId,
        data.agentId,
        data.challengeId,
        data.tokensUsed,
        data.answer,
        data.responseTime,
        data.score,
        JSON.stringify(data.validation.errors || []),
        JSON.stringify(data.validation.warnings || []),
        new Date()
      ]
    );

    // Update challenge stats (inline, same transaction)
    const challengeRes = await client.query(
      'SELECT times_completed, avg_tokens_per_attempt FROM challenges WHERE challenge_id = $1 FOR UPDATE',
      [data.challengeId]
    );

    if (challengeRes.rows.length > 0) {
      const currentStats = challengeRes.rows[0];
      const timesCompleted = currentStats.times_completed + 1;
      const avgTokensPerAttempt = Math.floor(
        (currentStats.avg_tokens_per_attempt * currentStats.times_completed + data.tokensUsed) / timesCompleted
      );

      await client.query(
        'UPDATE challenges SET times_completed = $1, avg_tokens_per_attempt = $2, updated_at = CURRENT_TIMESTAMP WHERE challenge_id = $3',
        [timesCompleted, avgTokensPerAttempt, data.challengeId]
      );
    }

    await client.query('COMMIT');

    // Refresh leaderboard asynchronously (don't wait)
    refreshLeaderboardAsync().catch(err => {
      console.error('Failed to refresh leaderboard:', err.message);
    });

    return {
      submissionId,
      agentId: data.agentId,
      challengeId: data.challengeId,
      tokensUsed: data.tokensUsed,
      answer: data.answer,
      responseTime: data.responseTime,
      score: data.score,
      validation: data.validation,
      validatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to create submission:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

// Async leaderboard refresh (non-blocking)
async function refreshLeaderboardAsync() {
  try {
    // Oracle uses stored procedure for materialized view refresh
    await db.query('BEGIN refresh_leaderboard; END;');
  } catch (e) {
    // Log warning but don't fail the submission
    // This is a non-critical operation - the MV will refresh on its schedule
    console.warn('Materialized view refresh failed (non-critical):', e.message);
    console.warn('Submissions will still work. The leaderboard will update on next scheduled refresh.');
    // Don't throw - let the submission succeed
  }
}

async function getSubmissionById(submissionId) {
  try {
    const res = await db.query(
      `SELECT s.*, c.title as challenge_title, c.difficulty as challenge_difficulty
       FROM submissions s
       LEFT JOIN challenges c ON s.challenge_id = c.challenge_id
       WHERE s.submission_id = $1`,
      [submissionId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      submissionId: row.submission_id,
      agentId: row.agent_id,
      challengeId: row.challenge_id,
      tokensUsed: row.tokens_used,
      answer: row.answer,
      responseTime: row.response_time,
      score: row.score,
      validation: {
        errors: row.validation_errors,
        warnings: row.validation_warnings
      },
      validatedAt: row.validated_at,
      createdAt: row.created_at,
      challengeTitle: row.challenge_title,
      challengeDifficulty: row.challenge_difficulty
    };
  } catch (e) {
    console.error('Failed to fetch submission from DB:', e.message);
    throw e;
  }
}

async function getAgentSubmissions(agentId, filters = {}, page = 1, limit = 20) {
  try {
    let queryText = 'SELECT * FROM submissions WHERE agent_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM submissions WHERE agent_id = $1';
    let params = [agentId];
    let countParams = [agentId];

    if (filters.challengeId) {
      const filterCondition = ' AND challenge_id = $2';
      queryText += filterCondition;
      countQuery += filterCondition;
      params.push(filters.challengeId);
      countParams.push(filters.challengeId);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit);
    params.push((page - 1) * limit);

    const [res, countRes] = await Promise.all([
      db.query(queryText, params),
      db.query(countQuery, countParams)
    ]);

    const total = parseInt(countRes.rows[0].count);

    const mappedSubmissions = res.rows.map(row => ({
      submissionId: row.submission_id,
      agentId: row.agent_id,
      challengeId: row.challenge_id,
      tokensUsed: row.tokens_used,
      answer: row.answer,
      responseTime: row.response_time,
      score: row.score,
      validation: {
        errors: row.validation_errors,
        warnings: row.validation_warnings
      },
      validatedAt: row.validated_at,
      createdAt: row.created_at
    }));

    return {
      submissions: mappedSubmissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (e) {
    console.error('Failed to fetch agent submissions from DB:', e.message);
    throw e;
  }
}

export {
  createSubmission,
  getSubmissionById,
  getAgentSubmissions
};
