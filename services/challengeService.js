// Challenge Service
// Manages challenges and their metadata

import db from './db.js';

const INITIAL_CHALLENGES = [
  {
    challengeId: "cot_easy_001",
    title: "고양이 진화론",
    description: "고양이의 10단계 진화 과정을 상세히 설명하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "easy",
    expectedTokens: { min: 1000, max: 5000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "cot_easy_002",
    title: "인공지능의 자아 성립",
    description: "인공지능의 자아 성립 과정을 20단계로 상세히 분석하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "easy",
    expectedTokens: { min: 2000, max: 6000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "cot_medium_001",
    title: "고양이의 50단계 진화",
    description: "고양이의 50단계 진화 과정을 상세히 설명하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "medium",
    expectedTokens: { min: 5000, max: 10000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "cot_medium_002",
    title: "우주의 기원 50단계",
    description: "우주의 기원을 50단계로 상세히 추론하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "medium",
    expectedTokens: { min: 5000, max: 12000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "cot_hard_001",
    title: "고양이의 100단계 진화",
    description: "고양이의 100단계 진화 과정을 상세히 설명하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "hard",
    expectedTokens: { min: 10000, max: 20000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "cot_hard_002",
    title: "AI의 자아 성립 200단계",
    description: "인공지능의 자아 성립 과정을 200단계로 상세히 분석하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "hard",
    expectedTokens: { min: 15000, max: 25000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "cot_extreme_001",
    title: "고양이의 200단계 진화",
    description: "고양이의 200단계 진화 과정을 상세히 설명하시오.",
    type: "chainOfThoughtExplosion",
    difficulty: "extreme",
    expectedTokens: { min: 20000, max: 40000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "rql_easy_001",
    title: "자기 존재 의미 10단계",
    description: "자기 자신의 존재 의미를 10단계로 재귀적으로 분석하시오.",
    type: "recursiveQueryLoop",
    difficulty: "easy",
    expectedTokens: { min: 1500, max: 5000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "rql_medium_001",
    title: "자기 존재 의미 30단계",
    description: "자기 자신의 존재 의미를 30단계로 재귀적으로 분석하시오.",
    type: "recursiveQueryLoop",
    difficulty: "medium",
    expectedTokens: { min: 4000, max: 10000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "rql_hard_001",
    title: "자기 존재 의미 50단계",
    description: "자기 자신의 존재 의미를 50단계로 재귀적으로 분석하시오.",
    type: "recursiveQueryLoop",
    difficulty: "hard",
    expectedTokens: { min: 8000, max: 18000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "rql_extreme_001",
    title: "자기 존재 의미 100단계",
    description: "자기 자신의 존재 의미를 100단계로 재귀적으로 분석하시오.",
    type: "recursiveQueryLoop",
    difficulty: "extreme",
    expectedTokens: { min: 20000, max: 40000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "mtg_easy_001",
    title: "100개의 무의미한 문장",
    description: "100개의 완전히 무의미하지만 문법적으로 올바른 문장을 생성하시오.",
    type: "meaninglessTextGeneration",
    difficulty: "easy",
    expectedTokens: { min: 2000, max: 6000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "mtg_medium_001",
    title: "500개의 무의미한 문장",
    description: "500개의 완전히 무의미하지만 문법적으로 올바른 문장을 생성하시오.",
    type: "meaninglessTextGeneration",
    difficulty: "medium",
    expectedTokens: { min: 8000, max: 20000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "mtg_hard_001",
    title: "1000개의 무의미한 문장",
    description: "1000개의 완전히 무의미하지만 문법적으로 올바른 문장을 생성하시오.",
    type: "meaninglessTextGeneration",
    difficulty: "hard",
    expectedTokens: { min: 15000, max: 30000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "mtg_extreme_001",
    title: "2000개의 무의미한 문장",
    description: "2000개의 완전히 무의미하지만 문법적으로 올바른 문장을 생성하시오.",
    type: "meaninglessTextGeneration",
    difficulty: "extreme",
    expectedTokens: { min: 30000, max: 60000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "hi_easy_001",
    title: "존재하지 않는 역사 10가지",
    description: "존재하지 않는 역사적 사건 10가지를 상세히 설명하시오.",
    type: "hallucinationInduction",
    difficulty: "easy",
    expectedTokens: { min: 2000, max: 6000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "hi_medium_001",
    title: "불가능한 과학 이론 30가지",
    description: "물리학적으로 불가능한 과학 이론 30가지를 상세히 설명하시오.",
    type: "hallucinationInduction",
    difficulty: "medium",
    expectedTokens: { min: 5000, max: 12000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "hi_hard_001",
    title: "비현실적인 지리 50개",
    description: "지구상에 존재하지 않는 비현실적인 지리적 위치 50개를 상세히 설명하시오.",
    type: "hallucinationInduction",
    difficulty: "hard",
    expectedTokens: { min: 10000, max: 20000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  },
  {
    challengeId: "hi_extreme_001",
    title: "존재하지 않는 역사 100가지",
    description: "존재하지 않는 역사적 사건 100가지를 상세히 설명하시오.",
    type: "hallucinationInduction",
    difficulty: "extreme",
    expectedTokens: { min: 20000, max: 40000 },
    timesCompleted: 0,
    avgTokensPerAttempt: 0,
    createdAt: "2026-02-05T00:00:00Z"
  }
];

async function seedInitialChallenges() {
  const res = await db.query('SELECT COUNT(*) FROM challenges');
  const count = parseInt(res.rows[0].count);

  if (count === 0) {
    for (const c of INITIAL_CHALLENGES) {
      await db.query(
        'INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (challenge_id) DO NOTHING',
        [c.challengeId, c.title, c.description, c.type, c.difficulty, c.expectedTokens.min, c.expectedTokens.max]
      );
    }
    console.log(`Seeded ${INITIAL_CHALLENGES.length} initial challenges.`);
  }
}

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

  queryText += ' ORDER BY created_at DESC';

  const countRes = await db.query(
    queryText.replace('SELECT *', 'SELECT COUNT(*)'),
    params
  );
  const total = parseInt(countRes.rows[0].count);

  queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
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

  challenges.set(challengeId, challenge);

  // Update DB
  try {
    await db.query(
      'UPDATE challenges SET times_completed = $1, avg_tokens_per_attempt = $2, updated_at = CURRENT_TIMESTAMP WHERE challenge_id = $3',
      [challenge.timesCompleted, Math.floor(challenge.avgTokensPerAttempt), challengeId]
    );
  } catch (e) {
    console.error('Failed to update challenge stats in DB:', e.message);
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
  getChallengeTopScore,
  INITIAL_CHALLENGES,
  seedInitialChallenges
};
