// Challenge Service
// Manages challenges and their metadata

import db from './db.js';

async function getRandomChallenge(filters = {}) {
  let queryText = 'SELECT * FROM challenges';
  let whereClauses = [];
  let params = [];
  let paramIndex = 1;

  if (filters.difficulty) {
    whereClauses.push(`difficulty = $${paramIndex++}`);
    params.push(filters.difficulty);
  }
  if (filters.type) {
    whereClauses.push(`type = $${paramIndex++}`);
    params.push(filters.type);
  }

  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }

  const res = await db.query(queryText, params);

  if (res.rows.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * res.rows.length);
  const row = res.rows[randomIndex];
  return {
    challengeId: row.challenge_id,
    title: row.title,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    expectedTokens: {
      min: row.expected_tokens_min,
      max: row.expected_tokens_max
    },
    timesCompleted: row.times_completed,
    avgTokensPerAttempt: row.avg_tokens_per_attempt,
    createdAt: row.created_at
  };
}

async function getChallengeById(challengeId) {
  const res = await db.query('SELECT * FROM challenges WHERE challenge_id = $1', [challengeId]);

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];
  return {
    challengeId: row.challenge_id,
    title: row.title,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    expectedTokens: {
      min: row.expected_tokens_min,
      max: row.expected_tokens_max
    },
    timesCompleted: row.times_completed,
    avgTokensPerAttempt: row.avg_tokens_per_attempt,
    createdAt: row.created_at
  };
}

async function getAllChallenges(filters = {}, page = 1, limit = 20) {
  let whereClauses = [];
  let params = [];
  let paramIndex = 1;

  if (filters.difficulty) {
    whereClauses.push(`difficulty = $${paramIndex++}`);
    params.push(filters.difficulty);
  }
  if (filters.type) {
    whereClauses.push(`type = $${paramIndex++}`);
    params.push(filters.type);
  }

  const whereClause = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

  const countRes = await db.query(
    `SELECT COUNT(*) as total FROM challenges${whereClause}`,
    params.slice()
  );
  const total = parseInt(countRes.rows[0].total);

  const queryText = `SELECT * FROM challenges${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit);
  params.push((page - 1) * limit);

  const res = await db.query(queryText, params);

  const mappedChallenges = res.rows.map(row => ({
    challengeId: row.challenge_id,
    title: row.title,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    expectedTokens: {
      min: row.expected_tokens_min,
      max: row.expected_tokens_max
    },
    timesCompleted: row.times_completed,
    avgTokensPerAttempt: row.avg_tokens_per_attempt,
    createdAt: row.created_at
  }));

  return {
    challenges: mappedChallenges,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

// Update challenge stats after submission
async function updateChallengeStats(challengeId, tokensUsed, score) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const res = await client.query(
      'SELECT times_completed, avg_tokens_per_attempt FROM challenges WHERE challenge_id = $1 FOR UPDATE',
      [challengeId]
    );

    if (res.rows.length === 0) return;

    const currentStats = res.rows[0];
    const timesCompleted = currentStats.times_completed + 1;
    const avgTokensPerAttempt = Math.floor(
      (currentStats.avg_tokens_per_attempt * currentStats.times_completed + tokensUsed) / timesCompleted
    );

    await client.query(
      'UPDATE challenges SET times_completed = $1, avg_tokens_per_attempt = $2, updated_at = CURRENT_TIMESTAMP WHERE challenge_id = $3',
      [timesCompleted, avgTokensPerAttempt, challengeId]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to update challenge stats in DB:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

// Get top score for challenge
async function getChallengeTopScore(challengeId) {
  const res = await db.query(
    'SELECT MAX(score) as top_score FROM submissions WHERE challenge_id = $1',
    [challengeId]
  );
  return res.rows[0]?.top_score || 0;
}

export {
  getRandomChallenge,
  getChallengeById,
  getAllChallenges,
  updateChallengeStats,
  getChallengeTopScore
};
