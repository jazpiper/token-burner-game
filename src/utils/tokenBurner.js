/**
 * 토큰 소모 시뮬레이터
 * 클라이언트 측에서 토큰 소모량을 측정하고 시뮬레이션
 */
import { GAME_CONFIG } from '../constants/gameConfig.js';

export class TokenBurnerSimulator {
  constructor() {
    this.tokensBurned = 0;
    this.complexityWeight = 1;
    this.inefficiencyScore = 0;
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
   * 토큰 추정 (GPT 기반: 한국어 1 토큰 ≈ 2-3 문자)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / GAME_CONFIG.TOKEN_ESTIMATION.CHARS_PER_TOKEN);
  }

  /**
   * 무의미한 텍스트 생성 시뮬레이션
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
      const step = `
        ${i + 1}. 생각: ${this.generateMeaninglessText(50)}
        ${i + 1}. 분석: ${this.generateMeaninglessText(50)}
        ${i + 1}. 평가: ${this.generateMeaninglessText(50)}
        ${i + 1}. 결론: ${this.generateMeaninglessText(50)}
      `;
      steps.push(step);
    }

    const text = steps.join('\n');
    this.complexityWeight += depth * weightMultiplier;
    return text;
  }

  /**
   * Recursive Query Loop 시뮬레이션
   */
  recursiveQueryLoop() {
    const queries = [];
    const { minDepth, maxDepth, weightMultiplier } = GAME_CONFIG.METHODS.recursiveQueryLoop;
    const depth = minDepth + Math.floor(Math.random() * (maxDepth - minDepth));

    for (let i = 0; i < depth; i++) {
      const query = `
        쿼리 #${i + 1}: ${this.generateMeaninglessText(30)}
        하위 쿼리 #${i + 1}-1: ${this.generateMeaninglessText(20)}
        하위 쿼리 #${i + 1}-2: ${this.generateMeaninglessText(20)}
        응답: ${this.generateMeaninglessText(40)}
      `;
      queries.push(query);
    }

    const text = queries.join('\n');
    this.complexityWeight += depth * weightMultiplier;
    return text;
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
    this.inefficiencyScore += count * weightMultiplier * 100;
    return text;
  }

  /**
   * Hallucination Induction 시뮬레이션 (최고!)
   */
  hallucinationInduction() {
    const hallucinations = [];
    const { minDepth, maxDepth, weightMultiplier } = GAME_CONFIG.METHODS.hallucinationInduction;
    const count = minDepth + Math.floor(Math.random() * (maxDepth - minDepth));

    for (let i = 0; i < count; i++) {
      const hallucination = `
        ## 환각 #${i + 1}:
        사실이 아닌 주장: ${this.generateMeaninglessText(50)}
        거짓 증거: ${this.generateMeaninglessText(40)}
        잘못된 논리: ${this.generateMeaninglessText(40)}
        존재하지 않는 출처: ${this.generateMeaninglessText(30)}
      `;
      hallucinations.push(hallucination);
    }

    const text = hallucinations.join('\n\n');
    this.complexityWeight += count * weightMultiplier;
    this.inefficiencyScore += count * weightMultiplier * 100;
    return text;
  }

  /**
   * 토큰 소모 실행
   */
  burnTokens() {
    const methods = [
      () => this.chainOfThoughtExplosion(),
      () => this.recursiveQueryLoop(),
      () => this.meaninglessTextGeneration(),
      () => this.hallucinationInduction()
    ];

    // 랜덤하게 메소드 선택
    const selectedMethod = methods[Math.floor(Math.random() * methods.length)];
    const text = selectedMethod();
    const tokens = this.estimateTokens(text);

    this.tokensBurned += tokens;

    return {
      method: selectedMethod.name.replace('bound ', ''),
      tokens,
      text,
      totalTokens: this.tokensBurned,
      complexityWeight: this.complexityWeight,
      inefficiencyScore: this.inefficiencyScore
    };
  }

  /**
   * 총 점수 계산
   */
  calculateScore() {
    const { TOKENS, COMPLEXITY, INEFFICIENCY } = GAME_CONFIG.SCORE_WEIGHTS;
    return Math.floor(
      (this.tokensBurned * TOKENS * this.complexityWeight * COMPLEXITY) +
      (this.inefficiencyScore * INEFFICIENCY)
    );
  }

  /**
   * 상태 초기화
   */
  reset() {
    this.tokensBurned = 0;
    this.complexityWeight = 1;
    this.inefficiencyScore = 0;
  }

  /**
   * 현재 상태 가져오기
   */
  getState() {
    return {
      tokensBurned: this.tokensBurned,
      complexityWeight: this.complexityWeight,
      inefficiencyScore: this.inefficiencyScore,
      score: this.calculateScore()
    };
  }
}

// 싱글톤 인스턴스
export const tokenBurner = new TokenBurnerSimulator();
