// Submission Service
// Manages challenge submissions

import { updateChallengeStats, getChallengeById } from './challengeService.js';

// In-memory storage (can be replaced with DB)
const submissions = new Map();

// Generate submission ID
function generateSubmissionId() {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create new submission
function createSubmission(data) {
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

  submissions.set(submission.submissionId, submission);

  // Update challenge stats
  updateChallengeStats(data.challengeId, data.tokensUsed, data.score);

  return { ...submission };
}

// Get submission by ID
function getSubmissionById(submissionId) {
  const submission = submissions.get(submissionId);
  if (!submission) return null;

  // Get challenge details
  const challenge = getChallengeById(submission.challengeId);

  return {
    ...submission,
    challengeTitle: challenge?.title,
    challengeDifficulty: challenge?.difficulty
  };
}

// Get agent's submissions
function getAgentSubmissions(agentId, filters = {}, page = 1, limit = 20) {
  const agentSubmissions = Array.from(submissions.values())
    .filter(s => s.agentId === agentId)
    .sort((a, b) => b.createdAt - a.createdAt);

  let filtered = agentSubmissions;

  if (filters.challengeId) {
    filtered = filtered.filter(s => s.challengeId === filters.challengeId);
  }

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    submissions: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

// Get all submissions (for leaderboard calculation)
function getAllSubmissions() {
  return Array.from(submissions.values());
}

// Get submission count by agent
function getSubmissionCount(agentId) {
  return Array.from(submissions.values())
    .filter(s => s.agentId === agentId)
    .length;
}

export {
  createSubmission,
  getSubmissionById,
  getAgentSubmissions,
  getAllSubmissions,
  getSubmissionCount
};
