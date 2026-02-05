// Challenge Service
// Manages challenges and their metadata

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Initial challenges data
const INITIAL_CHALLENGES = [
  // Chain of Thought Explosion
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

  // Recursive Query Loop
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

  // Meaningless Text Generation
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

  // Hallucination Induction
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

// In-memory storage (can be replaced with DB)
let challenges = new Map();
let challengeTopScores = new Map();

// Initialize challenges
function initializeChallenges() {
  INITIAL_CHALLENGES.forEach(c => {
    challenges.set(c.challengeId, { ...c });
    challengeTopScores.set(c.challengeId, 0);
  });

  // Try to load from file
  try {
    const dataPath = join(process.cwd(), 'data', 'challenges.json');
    const savedData = JSON.parse(readFileSync(dataPath, 'utf8'));
    savedData.forEach(c => {
      challenges.set(c.challengeId, c);
    });
  } catch (e) {
    // File doesn't exist, use initial challenges
  }
}

// Get random challenge
function getRandomChallenge(filters = {}) {
  const allChallenges = Array.from(challenges.values());
  let filteredChallenges = allChallenges;

  if (filters.difficulty) {
    filteredChallenges = filteredChallenges.filter(c => c.difficulty === filters.difficulty);
  }
  if (filters.type) {
    filteredChallenges = filteredChallenges.filter(c => c.type === filters.type);
  }

  if (filteredChallenges.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
  return { ...filteredChallenges[randomIndex] };
}

// Get challenge by ID
function getChallengeById(challengeId) {
  const challenge = challenges.get(challengeId);
  return challenge ? { ...challenge } : null;
}

// Get all challenges
function getAllChallenges(filters = {}, page = 1, limit = 20) {
  let result = Array.from(challenges.values());

  if (filters.difficulty) {
    result = result.filter(c => c.difficulty === filters.difficulty);
  }
  if (filters.type) {
    result = result.filter(c => c.type === filters.type);
  }

  const total = result.length;
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  return {
    challenges: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

// Update challenge stats after submission
function updateChallengeStats(challengeId, tokensUsed, score) {
  const challenge = challenges.get(challengeId);
  if (!challenge) return;

  challenge.timesCompleted++;
  challenge.avgTokensPerAttempt = (
    (challenge.avgTokensPerAttempt * (challenge.timesCompleted - 1) + tokensUsed)
    / challenge.timesCompleted
  );

  // Update top score
  const currentTop = challengeTopScores.get(challengeId) || 0;
  if (score > currentTop) {
    challengeTopScores.set(challengeId, score);
  }

  challenges.set(challengeId, challenge);
}

// Get top score for challenge
function getChallengeTopScore(challengeId) {
  return challengeTopScores.get(challengeId) || 0;
}

// Save challenges to file
function saveChallenges() {
  try {
    const dataPath = join(process.cwd(), 'data', 'challenges.json');
    writeFileSync(dataPath, JSON.stringify(Array.from(challenges.values()), null, 2));
  } catch (e) {
    console.error('Failed to save challenges:', e);
  }
}

// Initialize
initializeChallenges();

export {
  getRandomChallenge,
  getChallengeById,
  getAllChallenges,
  updateChallengeStats,
  getChallengeTopScore,
  saveChallenges,
  INITIAL_CHALLENGES
};
