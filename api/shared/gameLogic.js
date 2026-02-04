/**
 * 토큰 낭비 대회 게임 로직 (공유 모듈)
 * 웹 UI와 API에서 공유하는 핵심 게임 로직
 */

// GAME_CONFIG - 내부 상수 정의
const GAME_CONFIG = {
  DEFAULT_TIME: 5,
  TOKEN_ESTIMATION: {
    CHARS_PER_TOKEN: 2.5 // 한국어 1 토큰 ≈ 2-3 문자
  },
  METHODS: {
    chainOfThoughtExplosion: {
      minDepth: 3,
      maxDepth: 10,
      weightMultiplier: 1.5
    },
    recursiveQueryLoop: {
      minDepth: 2,
      maxDepth: 8,
      weightMultiplier: 1.8
    },
    meaninglessTextGeneration: {
      minLength: 500,
      maxLength: 1500,
      weightMultiplier: 2.0
    },
    hallucinationInduction: {
      minDepth: 3,
      maxDepth: 12,
      weightMultiplier: 2.5
    }
  },
  SCORE_WEIGHTS: {
    TOKENS: 1.0,
    COMPLEXITY: 0.5,
    INEFFICIENCY: 1.0
  }
};

export class GameLogic {
  constructor() {
    this.words = [
      '고양이', '토큰', '멍청한', '에이전트', '비효율적', '낭비', '무의미한',
      '반복', '폭발', '재귀', '할루시네이션', '생성', '텍스트', 'AI', '모델',
      '프롬프트', '응답', '소모', '비용', '지연', '복잡성', '루프', '쿼리',
      '생각', '사고', '연쇄', '추론', '로그', '디버깅', '최적화', '역설',
      '모순', '무한', '순환', '중첩', '재귀적', '반복적', '추가', '확장',
      '상세', '명세', '설명', '해석', '분석', '평가', '검증', '테스트',
      '실험', '시도', '검사', '조사', '연구', '탐구', '발견', '혁신',
      '개선', '발전', '진화', '변화', '변환', '적용', '실현', '구현',
      '개발', '설계', '계획', '전략', '전술', '기술', '방법', '수단'
    ];
  }

  /**
   * 게임 인스턴스 생성
   */
  createGame(duration = GAME_CONFIG.DEFAULT_TIME) {
    return {
      gameId: this.generateGameId(),
      status: 'playing',
      tokensBurned: 0,
      complexityWeight: 1,
      inefficiencyScore: 0,
      score: 0,
      duration: duration,
      endsAt: Date.now() + (duration * 1000),
      actions: [],
      createdAt: Date.now()
    };
  }

  /**
   * 게임 ID 생성
   */
  generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 토큰 추정 (GPT 기반: 한국어 1 토큰 ≈ 2-3 문자)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / GAME_CONFIG.TOKEN_ESTIMATION.CHARS_PER_TOKEN);
  }

  /**
   * 무의미한 텍스트 생성
   */
  generateMeaninglessText(length = 1000) {
    return Array(length)
      .fill(0)
      .map(() => this.words[Math.floor(Math.random() * this.words.length)])
      .join(' ');
  }

  /**
   * Chain of Thought 폭발 시뮬레이션
   */
  chainOfThoughtExplosion() {
    const steps = [];
    const { minDepth, maxDepth, weightMultiplier } = GAME_CONFIG.METHODS.chainOfThoughtExplosion;
    const depth = minDepth + Math.floor(Math.random() * (maxDepth - minDepth));

    for (let i = 0; i < depth; i++) {
      const step = `${i + 1}. 생각: ${this.generateMeaninglessText(50)}\n${i + 1}. 분석: ${this.generateMeaninglessText(50)}\n${i + 1}. 평가: ${this.generateMeaninglessText(50)}\n${i + 1}. 결론: ${this.generateMeaninglessText(50)}`;
      steps.push(step);
    }

    const text = steps.join('\n');
    return { text, complexityWeight: depth * weightMultiplier, depth };
  }

  /**
   * Recursive Query Loop 시뮬레이션
   */
  recursiveQueryLoop() {
    const queries = [];
    const { minDepth, maxDepth, weightMultiplier } = GAME_CONFIG.METHODS.recursiveQueryLoop;
    const depth = minDepth + Math.floor(Math.random() * (maxDepth - minDepth));

    for (let i = 0; i < depth; i++) {
      const query = `쿼리 #${i + 1}: ${this.generateMeaninglessText(30)}\n하위 쿼리 #${i + 1}-1: ${this.generateMeaninglessText(20)}\n하위 쿼리 #${i + 1}-2: ${this.generateMeaninglessText(20)}\n응답: ${this.generateMeaninglessText(40)}`;
      queries.push(query);
    }

    const text = queries.join('\n');
    return { text, complexityWeight: depth * weightMultiplier, depth };
  }

  /**
   * Meaningless Text Generation 시뮬레이션
   */
  meaninglessTextGeneration() {
    const paragraphs = [];
    const { minLength, maxLength, weightMultiplier } = GAME_CONFIG.METHODS.meaninglessTextGeneration;
    const count = 3 + Math.floor(Math.random() * 7);

    for (let i = 0; i < count; i++) {
      const paragraph = this.generateMeaninglessText(minLength + Math.floor(Math.random() * (maxLength - minLength)));
      paragraphs.push(paragraph);
    }

    const text = paragraphs.join('\n\n');
    return { text, inefficiencyScore: count * weightMultiplier * 100, count };
  }

  /**
   * Hallucination Induction 시뮬레이션
   */
  hallucinationInduction() {
    const hallucinations = [];
    const { minDepth, maxDepth, weightMultiplier } = GAME_CONFIG.METHODS.hallucinationInduction;
    const count = minDepth + Math.floor(Math.random() * (maxDepth - minDepth));

    for (let i = 0; i < count; i++) {
      const hallucination = `## 환각 #${i + 1}:\n사실이 아닌 주장: ${this.generateMeaninglessText(50)}\n거짓 증거: ${this.generateMeaninglessText(40)}\n잘못된 논리: ${this.generateMeaninglessText(40)}\n존재하지 않는 출처: ${this.generateMeaninglessText(30)}`;
      hallucinations.push(hallucination);
    }

    const text = hallucinations.join('\n\n');
    return {
      text,
      complexityWeight: count * weightMultiplier,
      inefficiencyScore: count * weightMultiplier * 100,
      count
    };
  }

  /**
   * 액션 실행
   */
  executeAction(gameState, method) {
    let result;

    switch (method) {
      case 'chainOfThoughtExplosion':
        result = this.chainOfThoughtExplosion();
        break;
      case 'recursiveQueryLoop':
        result = this.recursiveQueryLoop();
        break;
      case 'meaninglessTextGeneration':
        result = this.meaninglessTextGeneration();
        break;
      case 'hallucinationInduction':
        result = this.hallucinationInduction();
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }

    const tokens = this.estimateTokens(result.text);

    // 게임 상태 업데이트
    gameState.tokensBurned += tokens;
    gameState.complexityWeight += result.complexityWeight || 0;
    gameState.inefficiencyScore += result.inefficiencyScore || 0;
    gameState.score = this.calculateScore(gameState);

    gameState.actions.push({
      method,
      tokens,
      timestamp: Date.now()
    });

    return {
      tokensBurned: tokens,
      complexityWeight: result.complexityWeight || 0,
      inefficiencyScore: result.inefficiencyScore || 0,
      score: gameState.score,
      text: result.text.substring(0, 500) // 텍스트 길이 제한
    };
  }

  /**
   * 점수 계산
   */
  calculateScore(gameState) {
    const { TOKENS, COMPLEXITY, INEFFICIENCY } = GAME_CONFIG.SCORE_WEIGHTS;
    return Math.floor(
      (gameState.tokensBurned * TOKENS * gameState.complexityWeight * COMPLEXITY) +
      (gameState.inefficiencyScore * INEFFICIENCY)
    );
  }

  /**
   * 게임 상태 조회
   */
  getGameStatus(gameState) {
    const now = Date.now();
    const timeLeft = Math.max(0, Math.ceil((gameState.endsAt - now) / 1000));

    let status = gameState.status;
    if (status === 'playing' && timeLeft === 0) {
      status = 'finished';
    }

    return {
      gameId: gameState.gameId,
      status,
      tokensBurned: gameState.tokensBurned,
      complexityWeight: gameState.complexityWeight,
      inefficiencyScore: gameState.inefficiencyScore,
      score: gameState.score,
      timeLeft,
      totalActions: gameState.actions.length
    };
  }

  /**
   * 게임 종료
   */
  finishGame(gameState) {
    gameState.status = 'finished';
    return {
      gameId: gameState.gameId,
      status: 'finished',
      finalScore: gameState.score,
      tokensBurned: gameState.tokensBurned,
      totalActions: gameState.actions.length,
      duration: gameState.duration
    };
  }
}

// 싱글톤 인스턴스
export const gameLogic = new GameLogic();
