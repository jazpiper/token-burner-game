# Vercel Serverless Functions - Token Burner Game API

## 개요

이 디렉토리는 Vercel Serverless Functions로 변환된 Token Burner Game API를 포함합니다.

## 파일 구조

```
api/
├── v2/                          # API v2 Serverless Functions
│   ├── auth.js                  # POST /api/v2/auth/token
│   ├── games.js                 # POST /api/v2/games/start, POST /api/v2/games/:id/finish
│   ├── actions.js               # POST /api/v2/games/:id/actions
│   ├── status.js                # GET /api/v2/games/:id
│   ├── leaderboard.js           # GET /api/v2/leaderboard
│   └── health.js                # GET /api/v2/health
├── shared/                      # 공유 모듈
│   └── gameLogic.js             # 게임 로직 (공유)
├── config.json                  # API 설정
├── middleware/                  # Express 미들웨어 (레거시)
├── routes/                      # Express 라우트 (레거시)
└── server.js                    # Express 서버 (레거시)
```

## API 엔드포인트

### 인증
- **POST /api/v2/auth/token**
  - API Key로 JWT 토큰 발급
  - Body: `{ agentId, apiKey }`
  - Response: `{ token, expiresAt }`

### 게임 관리
- **POST /api/v2/games/start**
  - 새 게임 시작
  - Body: `{ duration }` (optional, default: 5)
  - Response: `{ gameId, status, endsAt, duration }`

- **POST /api/v2/games/:id/finish**
  - 게임 종료
  - Response: `{ gameId, status, finalScore, tokensBurned, totalActions, duration }`

- **GET /api/v2/games/:id**
  - 게임 상태 조회
  - Response: `{ gameId, status, tokensBurned, complexityWeight, inefficiencyScore, score, timeLeft, totalActions }`

### 액션
- **POST /api/v2/games/:id/actions**
  - 액션 수행
  - Body: `{ method }` (chainOfThoughtExplosion, recursiveQueryLoop, meaninglessTextGeneration, hallucinationInduction)
  - Response: `{ tokensBurned, complexityWeight, inefficiencyScore, score, text }`

### 리더보드
- **GET /api/v2/leaderboard**
  - 리더보드 조회
  - Response: Array of `{ gameId, agentId, score, tokensBurned, timestamp }`

### 헬스체크
- **GET /api/v2/health**
  - API 상태 확인
  - Response: `{ status, timestamp, activeGames, totalScores }`

## Rate Limiting

각 엔드포인트마다 다른 Rate Limiting이 적용됩니다:

- **인증 (auth.js)**: 15분당 10회
- **일반 요청 (games, status, leaderboard)**: 1분당 100회
- **액션 요청 (actions.js)**: 1분당 50회

## 환경 변수

Vercel Dashboard에 다음 환경 변수를 추가해야 합니다:

```bash
JWT_SECRET=your-secret-key-here
API_KEYS=demo-key-123,agent-key-456
CORS_ORIGIN=*
```

## 상태 관리

현재 개발 환경에서는 메모리 Map을 사용하여 상태를 관리합니다. 하지만 Vercel Serverless Functions는 무상태(stateless)이므로:

- **운영 환경**: Vercel KV 또는 Redis 사용 권장
- **현재**: 메모리 Map 사용 (함수 실행마다 초기화됨)

**주의**: 현재 구현은 각 Serverless Function이 독립적인 메모리를 사용하므로, games.js의 games와 actions.js의 games는 서로 다른 Map입니다. 이는 개발/테스트용으로만 적합합니다.

## 배포 준비

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. `vercel.json`에서 함수 설정 확인
4. 배포

## 테스트

로컬에서 테스트하려면:

```bash
# Vercel CLI 설치
npm i -g vercel

# 로컬에서 함수 실행
vercel dev
```

## 주의 사항

1. **상태 공유**: 현재 구현에서는 각 함수가 독립적인 메모리를 사용합니다. 운영 환경에서는 외부 저장소 필요
2. **Rate Limiting**: 메모리 기반 Rate Limiting은 함수 실행마다 초기화됩니다. 운영 환경에서는 Vercel KV 또는 Cloudflare Workers 권장
3. **시간 제한**: Vercel 무료 플랜에서는 10초 실행 시간 제한

## 레거시

Express.js 버전은 `api/server.js`에서 확인할 수 있습니다. Vercel Functions로 완전히 마이그레이션된 후 삭제 예정입니다.
