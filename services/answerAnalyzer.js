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

function detectAdvancedRepetition(text) {
  const flags = [];
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  // 1. Consecutive word repetition
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] === words[i + 1]) {
      flags.push({
        type: 'consecutive_words',
        severity: 'high',
        example: words[i]
      });
      break; // Found one, that's enough
    }
  }

  // 2. N-gram repetition (2-4 word phrases)
  const nGrams = {};
  for (let n = 2; n <= 4; n++) {
    for (let i = 0; i < words.length - n + 1; i++) {
      const gram = words.slice(i, i + n).join(' ');
      nGrams[gram] = (nGrams[gram] || 0) + 1;
    }
  }

  const repeatedGrams = Object.entries(nGrams)
    .filter(([_, count]) => count >= 3)
    .map(([gram, count]) => ({
      type: 'phrase_repetition',
      severity: count > 5 ? 'high' : 'medium',
      phrase: gram,
      count
    }));

  flags.push(...repeatedGrams);

  // 3. Pattern repetition (ABABAB)
  for (let patternLen = 2; patternLen <= 3; patternLen++) {
    for (let i = 0; i < words.length - patternLen * 3; i++) {
      const pattern1 = words.slice(i, i + patternLen).join(' ');
      const pattern2 = words.slice(i + patternLen, i + patternLen * 2).join(' ');
      const pattern3 = words.slice(i + patternLen * 2, i + patternLen * 3).join(' ');

      if (pattern1 === pattern2 && pattern2 === pattern3) {
        flags.push({
          type: 'pattern_repetition',
          severity: 'medium',
          pattern: pattern1,
          occurrences: 3
        });
        break;
      }
    }
  }

  // 4. Calculate overall score
  const baseRepetition = detectRepetition(text);
  const penalty = flags.length * 0.05;
  const score = Math.min(1, baseRepetition + penalty);

  return {
    score,
    flags: flags.slice(0, 10) // Limit to top 10 flags
  };
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

  // Advanced repetition detection
  const advancedRep = detectAdvancedRepetition(answer);

  // Check for high severity flags
  const highSeverityFlags = advancedRep.flags.filter(f => f.severity === 'high');
  if (highSeverityFlags.length > 0) {
    issues.push({
      type: 'warning',
      code: 'significant_repetition_detected',
      flags: highSeverityFlags
    });
  }

  // Check overall score
  if (advancedRep.score > 0.6) {
    issues.push({
      type: 'warning',
      code: 'high_repetition_score',
      score: advancedRep.score
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
  detectAdvancedRepetition,
  validateAnswerQuality
};
