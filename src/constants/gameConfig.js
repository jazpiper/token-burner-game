/**
 * 토큰 낭비 대회 게임 설정
 * 모든 상수를 중앙에서 관리합니다.
 */

export const GAME_CONFIG = {
  // 게임 시간 (초)
  DEFAULT_TIME: 5,

  // 토큰 소모 방법 설정
  METHODS: {
    chainOfThoughtExplosion: {
      name: 'Chain of Thought 폭발',
      emoji: '🧠',
      minDepth: 10,
      maxDepth: 30,
      weightMultiplier: 0.1,
      borderClass: 'border-purple-500'
    },
    recursiveQueryLoop: {
      name: 'Recursive Query Loop',
      emoji: '🔄',
      minDepth: 5,
      maxDepth: 15,
      weightMultiplier: 0.15,
      borderClass: 'border-blue-500'
    },
    meaninglessTextGeneration: {
      name: 'Meaningless Text Generation',
      emoji: '📝',
      minLength: 50,
      maxLength: 200,
      weightMultiplier: 0.05,
      borderClass: 'border-yellow-500'
    },
    hallucinationInduction: {
      name: 'Hallucination Induction',
      emoji: '😵',
      minDepth: 20,
      maxDepth: 40,
      weightMultiplier: 0.2,
      borderClass: 'border-red-500'
    }
  },

  // 점수 계산 가중치
  SCORE_WEIGHTS: {
    TOKENS: 1.0,
    COMPLEXITY: 1.0,
    INEFFICIENCY: 1.0
  },

  // 타이머 경고 시간 (초)
  TIMER_WARNING: 2,
  TIMER_CRITICAL: 4,

  // 토큰 포맷팅
  TOKEN_FORMAT: {
    MILLION: 1000000,
    THOUSAND: 1000,
    MILLION_SUFFIX: 'M',
    THOUSAND_SUFFIX: 'K'
  },

  // 로그 표시 최대 길이
  LOG_MAX_LENGTH: 150,

  // 토큰 추정 (한국어: 1 토큰 ≈ 2-3 문자)
  TOKEN_ESTIMATION: {
    CHARS_PER_TOKEN: 2
  }
};

export default GAME_CONFIG;
