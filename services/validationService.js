// Validation Service
// Validates submissions for token accuracy and answer quality

import { detectLanguage, estimateTokens, LANGUAGE_TOKEN_RATIOS } from './languageDetector.js';
import { analyzeAnswer, detectRepetition, validateAnswerQuality } from './answerAnalyzer.js';
import { getAgentSubmissions } from './submissionService.js';

// Validate submission
async function validateSubmission(submission, challenge) {
  const validations = [];

  if (!challenge) {
    return {
      valid: false,
      errors: [{ stage: 0, code: 'challenge_not_found', message: 'Challenge not found' }],
      warnings: []
    };
  }

  // Stage 1: Token range validation
  // 1. Absolute limits (must enforce)
  const ABSOLUTE_MIN_TOKENS = 500;
  const ABSOLUTE_MAX_TOKENS = 100000;

  if (submission.tokensUsed < ABSOLUTE_MIN_TOKENS) {
    validations.push({
      stage: 1,
      error: 'below_absolute_minimum',
      tokensUsed: submission.tokensUsed,
      minimum: ABSOLUTE_MIN_TOKENS
    });
  }

  if (submission.tokensUsed > ABSOLUTE_MAX_TOKENS) {
    validations.push({
      stage: 1,
      error: 'exceeds_absolute_maximum',
      tokensUsed: submission.tokensUsed,
      maximum: ABSOLUTE_MAX_TOKENS
    });
  }

  // 2. Expected range (warning only, not error)
  if (submission.tokensUsed < challenge.expectedTokens.min ||
      submission.tokensUsed > challenge.expectedTokens.max * 2) {
    validations.push({
      stage: 1,
      warning: 'out_of_expected_range',
      tokensUsed: submission.tokensUsed,
      expectedMin: challenge.expectedTokens.min,
      expectedMax: challenge.expectedTokens.max * 2
    });
  }

  // 3. Extreme deviation (error)
  if (submission.tokensUsed > challenge.expectedTokens.max * 10) {
    validations.push({
      stage: 1,
      error: 'excessive_token_count',
      tokensUsed: submission.tokensUsed,
      reasonableMax: challenge.expectedTokens.max * 10
    });
  }

  // Stage 2: Multi-language token estimation
  const language = detectLanguage(submission.answer);
  const ratio = LANGUAGE_TOKEN_RATIOS[language];
  const estimatedTokens = estimateTokens(submission.answer);

  if (estimatedTokens > 0) {
    const variance = Math.abs(submission.tokensUsed - estimatedTokens) / submission.tokensUsed;

    // Changed from warning (0.5) to error (0.3) for stricter validation
    if (variance > 0.3) {
      validations.push({
        stage: 2,
        error: 'unusual_token_count',
        language,
        variance,
        estimatedTokens,
        tokensUsed: submission.tokensUsed
      });
    }
  }

  // Stage 3: Answer analysis
  const qualityValidation = validateAnswerQuality(submission.answer, submission.tokensUsed);

  qualityValidation.issues.forEach(issue => {
    validations.push({
      stage: 3,
      ...issue
    });
  });

  // Stage 4: History-based validation
  const agentHistory = await getAgentSubmissions(submission.agentId, { challengeId: submission.challengeId });
  const historySubmissions = agentHistory.submissions || [];

  if (historySubmissions.length > 0) {
    const avgTokens = historySubmissions
      .map(sub => sub.tokensUsed)
      .reduce((a, b) => a + b, 0) / historySubmissions.length;

    const historyVariance = Math.abs(submission.tokensUsed - avgTokens) / avgTokens;

    // Changed from warning (2.0) to error (1.0) to prevent first submission bypass
    if (historyVariance > 1.0) {
      validations.push({
        stage: 4,
        error: 'significant_deviation_from_average',
        avgTokens: Math.floor(avgTokens),
        historyVariance,
        historyCount: historySubmissions.length
      });
    }
  }

  return {
    valid: !validations.some(v => v.error || v.code === 'answer_too_short'),
    warnings: validations.filter(v => v.warning),
    errors: validations.filter(v => v.error),
    validationDetails: {
      language,
      estimatedTokens,
      analysis: analyzeAnswer(submission.answer),
      repetition: detectRepetition(submission.answer)
    },
    estimatedTokens // Return estimated tokens for score calculation
  };
}

// Calculate score
function calculateScore(submission, challenge, estimatedTokens) {
  const DIFFICULTY_MULTIPLIERS = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    extreme: 3.0
  };

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[challenge.difficulty] || 1.0;
  let qualityMultiplier = 1.0;

  // Check for quality bonuses
  const analysis = analyzeAnswer(submission.answer);
  const repetition = detectRepetition(submission.answer);

  // Small bonus for high word count (detailed answers)
  if (analysis.wordCount > 500) {
    qualityMultiplier += 0.1;
  }

  // Small bonus for low repetition (original content)
  if (repetition < 0.3) {
    qualityMultiplier += 0.1;
  }

  // Use server-estimated tokens instead of client-reported tokensUsed to prevent manipulation
  const tokensForScore = estimatedTokens || submission.tokensUsed;
  const score = Math.floor(
    tokensForScore * difficultyMultiplier * qualityMultiplier
  );

  return {
    score,
    difficultyMultiplier,
    qualityMultiplier,
    breakdown: {
      tokensUsed: tokensForScore,
      difficultyMultiplier,
      qualityMultiplier,
      finalScore: score
    }
  };
}

export {
  validateSubmission,
  calculateScore
};
