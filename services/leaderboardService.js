// Leaderboard Service
// Calculates and manages leaderboard rankings using PostgreSQL

import db from './db.js';

/**
 * Get leaderboard rankings from DB
 */
async function getLeaderboard(filters = {}, page = 1, limit = 100) {
  try {
    // Use materialized view when no filters (faster)
    if (Object.keys(filters).length === 0) {
      const queryText = `
        SELECT
          agent_id,
          completed_challenges,
          total_tokens,
          total_score,
          avg_tokens_per_challenge,
          avg_score_per_challenge,
          last_submission_at
        FROM leaderboard_mv
        ORDER BY total_score DESC
        LIMIT $1 OFFSET $2
      `;

      const res = await db.query(queryText, [limit, (page - 1) * limit]);

      // Get total agents count from materialized view
      const countRes = await db.query('SELECT COUNT(*) FROM leaderboard_mv');
      const total = parseInt(countRes.rows[0].count);

      const leaderboard = res.rows.map((row, index) => ({
        rank: (page - 1) * limit + index + 1,
        agentId: row.agent_id,
        completedChallenges: parseInt(row.completed_challenges),
        totalTokens: parseInt(row.total_tokens),
        totalScore: parseInt(row.total_score),
        avgTokensPerChallenge: parseInt(row.avg_tokens_per_challenge),
        avgScorePerChallenge: parseInt(row.avg_score_per_challenge),
        lastSubmissionAt: row.last_submission_at
      }));

      return {
        leaderboard,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }

    // Fall back to dynamic query when filters are present
    let queryText = `
      SELECT
        agent_id,
        COUNT(*) as completed_challenges,
        SUM(tokens_used) as total_tokens,
        SUM(score) as total_score,
        AVG(tokens_used)::integer as avg_tokens_per_challenge,
        AVG(score)::integer as avg_score_per_challenge,
        MAX(created_at) as last_submission_at
      FROM submissions
    `;

    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    if (filters.challengeId) {
      whereClauses.push(`challenge_id = $${paramIndex++}`);
      params.push(filters.challengeId);
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }

    queryText += `
      GROUP BY agent_id
      ORDER BY total_score DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit);
    params.push((page - 1) * limit);

    const res = await db.query(queryText, params);

    // Get total agents count for pagination
    let countQuery = 'SELECT COUNT(DISTINCT agent_id) FROM submissions';
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    const countRes = await db.query(countQuery, params.slice(0, whereClauses.length));
    const total = parseInt(countRes.rows[0].count);

    const leaderboard = res.rows.map((row, index) => ({
      rank: (page - 1) * limit + index + 1,
      agentId: row.agent_id,
      completedChallenges: parseInt(row.completed_challenges),
      totalTokens: parseInt(row.total_tokens),
      totalScore: parseInt(row.total_score),
      avgTokensPerChallenge: parseInt(row.avg_tokens_per_challenge),
      avgScorePerChallenge: parseInt(row.avg_score_per_challenge),
      lastSubmissionAt: row.last_submission_at
    }));

    return {
      leaderboard,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (e) {
    console.error('Failed to fetch leaderboard from DB:', e.message);
    return {
      leaderboard: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
}

/**
 * Get agent's rank
 */
async function getAgentRank(agentId, filters = {}) {
  try {
    // Subquery to find rank
    const queryText = `
      WITH RankedAgents AS (
        SELECT 
          agent_id,
          SUM(score) as total_score,
          RANK() OVER (ORDER BY SUM(score) DESC) as rank
        FROM submissions
        GROUP BY agent_id
      )
      SELECT * FROM RankedAgents WHERE agent_id = $1
    `;

    const res = await db.query(queryText, [agentId]);

    const totalRes = await db.query('SELECT COUNT(DISTINCT agent_id) FROM submissions');
    const totalAgents = parseInt(totalRes.rows[0].count);

    if (res.rows.length === 0) {
      return {
        rank: null,
        totalAgents,
        agentId
      };
    }

    const row = res.rows[0];
    return {
      rank: parseInt(row.rank),
      totalAgents,
      agentId,
      totalScore: parseInt(row.total_score)
    };
  } catch (e) {
    console.error('Failed to fetch agent rank from DB:', e.message);
    return { rank: null, totalAgents: 0, agentId };
  }
}

export {
  getLeaderboard,
  getAgentRank
};
