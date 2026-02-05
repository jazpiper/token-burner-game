// Leaderboard Service
// Calculates and manages leaderboard rankings

import { getAllSubmissions } from './submissionService.js';

// Calculate leaderboard
function getLeaderboard(filters = {}) {
  const agentStats = new Map();
  const allSubmissions = getAllSubmissions();

  // Calculate stats per agent
  allSubmissions.forEach(submission => {
    if (!agentStats.has(submission.agentId)) {
      agentStats.set(submission.agentId, {
        agentId: submission.agentId,
        totalTokens: 0,
        totalScore: 0,
        completedChallenges: 0,
        submissions: []
      });
    }

    const stats = agentStats.get(submission.agentId);
    stats.totalTokens += submission.tokensUsed;
    stats.totalScore += submission.score;
    stats.completedChallenges++;
    stats.submissions.push(submission);
  });

  // Convert to array and apply filters
  let leaderboard = Array.from(agentStats.values());

  if (filters.type) {
    // Filter by challenge type
    const typeSubmissions = allSubmissions.filter(s => {
      // This would need challenge details to filter by type
      return true;
    });

    // Recalculate for type-specific leaderboard
    const typeStats = new Map();
    typeSubmissions.forEach(submission => {
      if (!typeStats.has(submission.agentId)) {
        typeStats.set(submission.agentId, {
          agentId: submission.agentId,
          totalTokens: 0,
          totalScore: 0,
          completedChallenges: 0
        });
      }

      const stats = typeStats.get(submission.agentId);
      stats.totalTokens += submission.tokensUsed;
      stats.totalScore += submission.score;
      stats.completedChallenges++;
    });

    leaderboard = Array.from(typeStats.values());
  }

  if (filters.difficulty) {
    // Filter by difficulty
    const difficultySubmissions = allSubmissions.filter(s => {
      // This would need challenge details to filter by difficulty
      return true;
    });

    const difficultyStats = new Map();
    difficultySubmissions.forEach(submission => {
      if (!difficultyStats.has(submission.agentId)) {
        difficultyStats.set(submission.agentId, {
          agentId: submission.agentId,
          totalTokens: 0,
          totalScore: 0,
          completedChallenges: 0
        });
      }

      const stats = difficultyStats.get(submission.agentId);
      stats.totalTokens += submission.tokensUsed;
      stats.totalScore += submission.score;
      stats.completedChallenges++;
    });

    leaderboard = Array.from(difficultyStats.values());
  }

  // Sort by score (descending)
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  // Calculate rank and additional stats
  leaderboard.forEach((stats, index) => {
    stats.rank = index + 1;
    stats.avgTokensPerChallenge = stats.completedChallenges > 0
      ? Math.floor(stats.totalTokens / stats.completedChallenges)
      : 0;
    stats.avgScorePerChallenge = stats.completedChallenges > 0
      ? Math.floor(stats.totalScore / stats.completedChallenges)
      : 0;
  });

  return leaderboard;
}

// Get agent's rank
function getAgentRank(agentId, filters = {}) {
  const leaderboard = getLeaderboard(filters);
  const entry = leaderboard.find(entry => entry.agentId === agentId);

  if (!entry) {
    return {
      rank: null,
      totalAgents: leaderboard.length,
      agentId
    };
  }

  return {
    rank: entry.rank,
    totalAgents: leaderboard.length,
    agentId,
    totalScore: entry.totalScore,
    totalTokens: entry.totalTokens,
    completedChallenges: entry.completedChallenges
  };
}

export {
  getLeaderboard,
  getAgentRank
};
