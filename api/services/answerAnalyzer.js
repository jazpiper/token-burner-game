// Answer Analysis Service
// Analyzes answers for quality, repetition, and diversity

function analyzeAnswer(answer) {
  const words = answer.split(/\s+/).filter(w => w.length > 0);
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
    avgWordLength: words.length > 0 ? answer.replace(/\s/g, '').length / words.length : 0,
    specialCharRatio: (answer.match(/[!@#$%^&*]/g) || []).length / Math.max(answer.length, 1),
    spaceRatio: (answer.match(/\s/g) || []).length / Math.max(answer.length, 1)
  };
}

function detectRepetition(text) {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = {};

  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const counts = Object.values(wordCount);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  const uniqueWords = new Set(words).size;

  if (uniqueWords === 0) return 0;

  return maxCount / uniqueWords;
}

function validateAnswerQuality(answer, tokensUsed) {
  const analysis = analyzeAnswer(answer);
  const repetition = detectRepetition(answer);
  const issues = [];

  // 답변이 너무 짧으면 거절
  if (analysis.wordCount < 100) {
    issues.push({
      type: 'error',
      code: 'answer_too_short',
      minWords: 100,
      actualWords: analysis.wordCount
    });
  }

  // 답변이 너무 단순하면 경고
  if (analysis.wordCount > 0 && analysis.uniqueWords / analysis.wordCount < 0.3) {
    issues.push({
      type: 'warning',
      code: 'answer_lacks_diversity',
      diversity: analysis.uniqueWords / analysis.wordCount
    });
  }

  // 반복이 많으면 경고
  if (repetition > 0.5) {
    issues.push({
      type: 'warning',
      code: 'answer_has_high_repetition',
      repetition
    });
  }

  // 스페이스 비율이 높으면 의심
  if (analysis.spaceRatio > 0.5) {
    issues.push({
      type: 'warning',
      code: 'unusual_space_ratio',
      spaceRatio: analysis.spaceRatio
    });
  }

  return {
    valid: !issues.some(i => i.type === 'error'),
    issues
  };
}

export {
  analyzeAnswer,
  detectRepetition,
  validateAnswerQuality
};
