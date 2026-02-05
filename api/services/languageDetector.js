// Language Detection Service
// Detects the language of text for accurate token estimation

const LANGUAGE_TOKEN_RATIOS = {
  korean: 2.5,    // 한국어: 1 토큰 ≈ 2.5 문자
  english: 4.0,   // 영어: 1 토큰 ≈ 4 문자
  japanese: 2.0,  // 일본어: 1 토큰 ≈ 2 문자
  chinese: 1.5,   // 중국어: 1 토큰 ≈ 1.5 문자
  mixed: 3.0      // 혼합
};

function detectLanguage(text) {
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const japaneseChars = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const totalChars = text.length;

  if (totalChars === 0) return 'korean';

  const koreanRatio = koreanChars / totalChars;
  const englishRatio = englishChars / totalChars;
  const japaneseRatio = japaneseChars / totalChars;
  const chineseRatio = chineseChars / totalChars;

  // 70% 이상이 특정 언어면 해당 언어로 판정
  if (koreanRatio > 0.7) return 'korean';
  if (englishRatio > 0.7) return 'english';
  if (japaneseRatio > 0.7) return 'japanese';
  if (chineseRatio > 0.7) return 'chinese';

  return 'mixed';
}

function estimateTokens(text) {
  const language = detectLanguage(text);
  const ratio = LANGUAGE_TOKEN_RATIOS[language];
  return Math.floor(text.length / ratio);
}

export {
  detectLanguage,
  estimateTokens,
  LANGUAGE_TOKEN_RATIOS
};
