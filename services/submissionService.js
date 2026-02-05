// Submission Service
// Manages challenge submissions

import { updateChallengeStats, getChallengeById } from './challengeService.js';
import db from './db.js';

// In-memory storage (cache - limited)
const submissions = new Map();

// Generate submission ID
function generateSubmissionId() {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create new submission
async function createSubmission(data) {
  const submission = {
    submissionId: generateSubmissionId(),
    agentId: data.agentId,
    challengeId: data.challengeId,
    tokensUsed: data.tokensUsed,
    answer: data.answer,
    responseTime: data.responseTime,
    score: data.score,
    validation: data.validation,
    validatedAt: Date.now(),
    createdAt: Date.now()
  };

  // Add to cache
  submissions.set(submission.submissionId, submission);

  // Persistence to DB
  try {
    await db.query(
      `INSERT INTO submissions 
      (submission_id, agent_id, challenge_id, tokens_used, answer, response_time, score, validation_errors, validation_warnings, validated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        submission.submissionId,
        submission.agentId,
        submission.challengeId,
        submission.tokensUsed,
        submission.answer,
        submission.responseTime,
        submission.score,
        JSON.stringify(submission.validation.errors || []),
        JSON.stringify(submission.validation.warnings || []),
        new Date(submission.validatedAt)
      ]
    );
    console.log(`Submission ${submission.submissionId} saved to database.`);
  } catch (e) {
    console.error('Failed to save submission to DB:', e.message);
  }

  // Update challenge stats
  await updateChallengeStats(data.challengeId, data.tokensUsed, data.score);

  return { ...submission };
}

// Get submission by ID
async function getSubmissionById(submissionId) {
  // Check cache first
  let submission = submissions.get(submissionId);

  if (!submission) {
    try {
      const res = await db.query('SELECT * FROM submissions WHERE submission_id = $1', [submissionId]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        submission = {
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
        };
        submissions.set(submissionId, submission);
      }
    } catch (e) {
      console.error('Failed to fetch submission from DB:', e.message);
    }
  }

  if (!submission) return null;

  // Get challenge details
  const challenge = await getChallengeById(submission.challengeId);

  return {
    ...submission,
    challengeTitle: challenge?.title,
    challengeDifficulty: challenge?.difficulty
  };
}

// Get agent's submissions
async function getAgentSubmissions(agentId, filters = {}, page = 1, limit = 20) {
  try {
    let queryText = 'SELECT * FROM submissions WHERE agent_id = $1';
    let params = [agentId];
    let paramIndex = 2;

    if (filters.challengeId) {
      queryText += ` AND challenge_id = $${paramIndex++}`;
      params.push(filters.challengeId);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit);
    params.push((page - 1) * limit);

    const res = await db.query(queryText, params);

    // Get count for pagination
    let countQuery = 'SELECT COUNT(*) FROM submissions WHERE agent_id = $1';
    let countParams = [agentId];
    if (filters.challengeId) {
      countQuery += ' AND challenge_id = $2';
      countParams.push(filters.challengeId);
    }
    const countRes = await db.query(countQuery, countParams);
    const total = parseInt(countRes.rows[0].count);

    const mappedSubmissions = res.rows.map(row => ({
      submissionId: row.submission_id,
      agentId: row.agent_id,
      challengeId: row.challenge_id,
      tokensUsed: row.tokens_used,
      answer: row.answer,
      responseTime: row.responseTime,
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
    return {
      submissions: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
}

// Get all submissions (for leaderboard calculation)
async function getAllSubmissions() {
  try {
    const res = await db.query('SELECT * FROM submissions');
    return res.rows.map(row => ({
      agentId: row.agent_id,
      challengeId: row.challenge_id,
      tokensUsed: row.tokens_used,
      score: row.score,
      createdAt: row.created_at
    }));
  } catch (e) {
    console.error('Failed to fetch all submissions from DB:', e.message);
    return Array.from(submissions.values());
  }
}

// Get submission count by agent
async function getSubmissionCount(agentId) {
  try {
    const res = await db.query('SELECT COUNT(*) FROM submissions WHERE agent_id = $1', [agentId]);
    return parseInt(res.rows[0].count);
  } catch (e) {
    return 0;
  }
}

export {
  createSubmission,
  getSubmissionById,
  getAgentSubmissions,
  getAllSubmissions,
  getSubmissionCount
};
