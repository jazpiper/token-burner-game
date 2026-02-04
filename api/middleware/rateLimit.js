/**
 * Rate Limiting 미들웨어
 * AI Agent 남용 방지
 */
import rateLimit from 'express-rate-limit';

// 환경 변수 또는 기본 설정
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1분
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'); // 1분당 100회

/**
 * 일반 Rate Limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // API Key 또는 IP를 기반으로 제한
    return req.headers['x-api-key'] || req.ip;
  }
});

/**
 * 엄격한 Rate Limiting (액션 수행용)
 */
export const strictRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS / 2, // 일반 제한의 절반
  message: {
    error: 'Too many actions, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  }
});

/**
 * 인증 Rate Limiting (로그인 시도)
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 15분당 10회
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true
});

export default { generalRateLimit, strictRateLimit, authRateLimit };
