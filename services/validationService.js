// Validation Service
// Validates submissions for token accuracy and answer quality

import { detectLanguage, estimateTokens, LANGUAGE_TOKEN_RATIOS } from './languageDetector.js';
import { analyzeAnswer, detectRepetition, validateAnswerQuality } from './answerAnalyzer.js';
import { getAgentSubmissions } from './submissionService.js';
import { getChallengeById } from './challengeService.js';

// Validate submission
async function validateSubmission(submission, challengeId) {
  const validations = [];
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    return {
      valid: false,
      errors: [{ stage: 0, code: 'challenge_not_found', message: 'Challenge not found' }],
      warnings: []
    };
  }

  // Stage 1: Range check
  if (submission.tokensUsed < challenge.expectedTokens.min ||
      submission.tokensUsed > challenge.expectedTokens.max * 2) {
    validations.push({
      stage: 1,
      error: 'out_of_range',
      tokensUsed: submission.tokensUsed,
      min: challenge.expectedTokens.min,
      max: challenge.expectedTokens.max * 2
    });
  }

  // Stage 2: Multi-language token estimation
  const language = detectLanguage(submission.answer);
  const ratio = LANGUAGE_TOKEN_RATIOS[language];
  const estimatedTokens = estimateTokens(submission.answer);

  if (estimatedTokens > 0) {
    const variance = Math.abs(submission.tokensUsed - estimatedTokens) / submission.tokensUsed;

    if (variance > 0.5) {
      validations.push({
        stage: 2,
        warning: 'unusual_token_count',
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
  const agentHistory = getAgentSubmissions(submission.agentId, { challengeId });
  const historySubmissions = agentHistory.submissions || [];

  if (historySubmissions.length > 0) {
    const avgTokens = historySubmissions
      .map(sub => sub.tokensUsed)
      .reduce((a, b) => a + b, 0) / historySubmissions.length;

    const historyVariance = Math.abs(submission.tokensUsed - avgTokens) / avgTokens;

    if (historyVariance > 2.0) {
      validations.push({
        stage: 4,
        warning: 'significant_deviation_from_average',
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
    }
  };
}

// Calculate score
function calculateScore(submission, challenge) {
  const DIFFICULTY_MULTIPLIERS = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    extreme: 3.0
  };

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[challenge.difficulty] || 1.0;
  const qualityMultiplier = 1.0;

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

  const score = Math.floor(
    submission.tokensUsed * difficultyMultiplier * qualityMultiplier
  );

  return {
    score,
    difficultyMultiplier,
    qualityMultiplier,
    breakdown: {
      tokensUsed: submission.tokensUsed,
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
