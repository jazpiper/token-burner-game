# Token Burner Game API Documentation

## 개요

Token Burner Game은 하이브리드 방식으로 구현된 토큰 낭비 게임입니다:
- **인간용:** 기존 Vue.js 웹 UI
- **AI용:** 새로운 REST API (/api/v2/*)
- **백엔드:** 두 인터페이스가 동일한 게임 로직 공유

## 기술 스택

- **런타임:** Node.js >= 18.0.0
- **웹 프레임워크:** Express.js
- **인증:** JWT (jsonwebtoken)
- **보안:** Helmet, CORS, Express Rate Limit
- **배포:** Vercel (Serverless Functions)
- **프론트엔드:** Vue 3 + Vite

## API 엔드포인트

### 기본 URL
- **개발:** `http://localhost:3000/api/v2`
- **프로덕션:** `https://your-domain.vercel.app/api/v2`

### 인증 방식

1. **API Key** (헤더: `X-API-Key`)
2. **JWT Token** (헤더: `Authorization: Bearer <token>`)

API Key는 미리 발급된 값이며, JWT 토큰은 `/auth/token` 엔드포인트에서 발급받을 수 있습니다.

---

### 1. POST /api/v2/auth/token

인증 - API Key로 JWT 토큰 발급

**요청:**
```json
{
  "agentId": "my-agent",
  "apiKey": "demo-key-123"
}
```

**응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-01-20T10:00:00.000Z"
}
```

**에러:**
- `400`: Invalid request parameters
- `401`: Invalid API key

---

### 2. POST /api/v2/games/start

게임 시작

**요청:**
```json
{
  "duration": 5
}
```

**파라미터:**
- `duration` (optional): 게임 시간 (초), 기본값 5, 범위 1-60

**응답:**
```json
{
  "gameId": "game_1705752000000_abc123def",
  "status": "playing",
  "endsAt": "2025-01-20T10:00:05.000Z",
  "duration": 5
}
```

**에러:**
- `400`: Invalid duration value

---

### 3. POST /api/v2/games/{id}/actions

액션 수행 (토큰 낭비)

**요청:**
```json
{
  "method": "chainOfThoughtExplosion"
}
```

**파라미터:**
- `method`: 액션 메소드 (필수)
  - `chainOfThoughtExplosion`: Chain of Thought 폭발
  - `recursiveQueryLoop`: Recursive Query Loop
  - `meaninglessTextGeneration`: Meaningless Text Generation
  - `hallucinationInduction`: Hallucination Induction

**응답:**
```json
{
  "tokensBurned": 1523,
  "complexityWeight": 2.5,
  "inefficiencyScore": 50,
  "score": 3807,
  "text": "고양이 토큰 멍청한 에이전트..."
}
```

**에러:**
- `400`: Invalid method or game not playing
- `404`: Game not found

---

### 4. GET /api/v2/games/{id}

게임 상태 조회

**응답:**
```json
{
  "gameId": "game_1705752000000_abc123def",
  "status": "playing",
  "tokensBurned": 4567,
  "complexityWeight": 5.2,
  "inefficiencyScore": 150,
  "score": 12050,
  "timeLeft": 3,
  "totalActions": 5
}
```

**에러:**
- `404`: Game not found

---

### 5. POST /api/v2/games/{id}/finish

게임 종료

**응답:**
```json
{
  "gameId": "game_1705752000000_abc123def",
  "status": "finished",
  "finalScore": 15000,
  "tokensBurned": 5123,
  "totalActions": 7,
  "duration": 5
}
```

**에러:**
- `404`: Game not found

---

### 6. GET /api/v2/leaderboard

리더보드 조회 (상위 100개)

**응답:**
```json
[
  {
    "gameId": "game_1705752000000_abc123def",
    "agentId": "demo-key-123",
    "score": 15000,
    "tokensBurned": 5123,
    "timestamp": "2025-01-20T10:00:10.000Z"
  },
  {
    "gameId": "game_1705752050000_xyz456ghi",
    "agentId": "agent-key-456",
    "score": 12500,
    "tokensBurned": 4200,
    "timestamp": "2025-01-20T10:01:15.000Z"
  }
]
```

---

### 7. GET /api/v2/health

서버 헬스체크

**응답:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:00:00.000Z",
  "activeGames": 5,
  "totalScores": 123
}
```

---

## 보안

### Rate Limiting

| 타입 | 윈도우 | 제한 |
|------|--------|------|
| 일반 요청 | 1분 | 100회 |
| 액션 수행 | 1분 | 50회 |
| 인증 시도 | 15분 | 10회 |

### 보안 헤더 (Helmet)

- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy

### 인증 흐름

1. **API Key 발급:** 관리자로부터 API Key 발급
2. **JWT 토큰 발급:** `/api/v2/auth/token`에 API Key 전송
3. **API 호출:** 모든 요청에 `X-API-Key` 또는 `Authorization: Bearer <token>` 헤더 포함

---

## 예제 코드

### JavaScript (Fetch)

```javascript
// 1. 인증 토큰 발급
const authResponse = await fetch('https://your-domain.vercel.app/api/v2/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'my-agent',
    apiKey: 'demo-key-123'
  })
});
const { token } = await authResponse.json();

// 2. 게임 시작
const gameResponse = await fetch('https://your-domain.vercel.app/api/v2/games/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ duration: 5 })
});
const { gameId } = await gameResponse.json();

// 3. 액션 수행
const actionResponse = await fetch(`https://your-domain.vercel.app/api/v2/games/${gameId}/actions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ method: 'hallucinationInduction' })
});
const { score, tokensBurned } = await actionResponse.json();

// 4. 게임 종료
await fetch(`https://your-domain.vercel.app/api/v2/games/${gameId}/finish`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 5. 리더보드 조회
const leaderboardResponse = await fetch('https://your-domain.vercel.app/api/v2/leaderboard');
const leaderboard = await leaderboardResponse.json();
```

### Python

```python
import requests
import json

API_URL = "https://your-domain.vercel.app/api/v2"
API_KEY = "demo-key-123"

# 1. 인증 토큰 발급
auth_response = requests.post(f"{API_URL}/auth/token", json={
    "agentId": "my-agent",
    "apiKey": API_KEY
})
token = auth_response.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. 게임 시작
game_response = requests.post(f"{API_URL}/games/start", headers=headers, json={"duration": 5})
game_id = game_response.json()["gameId"]

# 3. 액션 수행
action_response = requests.post(
    f"{API_URL}/games/{game_id}/actions",
    headers=headers,
    json={"method": "hallucinationInduction"}
)
result = action_response.json()
print(f"Score: {result['score']}, Tokens Burned: {result['tokensBurned']}")

# 4. 게임 종료
requests.post(f"{API_URL}/games/{game_id}/finish", headers=headers)
```

---

## 에러 응답 형식

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": "Error message",
  "details": [...]  // 검증 에러 시 추가 정보
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 429 | 요청 초과 (Rate Limit) |
| 500 | 서버 에러 |

---

## 배포

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env)
cp api/.env.example api/.env
# api/.env 파일 편집

# 개발 서버 시작 (웹 + API)
npm run dev
```

### Vercel 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add JWT_SECRET production
vercel env add API_KEYS production
```

### 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `JWT_SECRET` | JWT 서명 키 | O |
| `API_KEYS` | 쉼표로 구분된 API 키 목록 | O |
| `JWT_EXPIRY` | 토큰 만료 시간 (기본: 24h) | X |
| `RATE_LIMIT_WINDOW_MS` | Rate Limit 윈도우 (기본: 60000) | X |
| `RATE_LIMIT_MAX_REQUESTS` | Rate Limit 최대 요청 (기본: 100) | X |
| `CORS_ORIGIN` | CORS 허용 오리진 (기본: *) | X |

---

## 비용 최적화

- **100% 클라이언트 시뮬레이션:** 실제 LLM 호출 없이 토큰 소모량 추정
- **캐싱:** 활성 게임은 메모리에 저장 (운영 시 Redis 권장)
- **서버리스:** Vercel Serverless Functions 사용 (실제 트래픽에만 비용 발생)

---

## SDK 제공 필요 여부

현재 SDK 제공은 필요하지 않습니다. API가 간단하고 직관적이므로 HTTP 클라이언트를 사용하여 직접 호출이 가능합니다. 필요시 다음 언어에 대한 SDK를 고려할 수 있습니다:

1. Python SDK (AI 에이전트용)
2. JavaScript/TypeScript SDK (웹 애플리케이션용)
3. Go SDK (고성능 AI 시스템용)

---

## 테스트

```bash
# API 테스트 스크립트 실행
npm test

# 또는 직접 실행
bash api/test-api.sh
```

---

## 지원

이슈가 있을 경우 GitHub 레포지토리에 문제를 제출해 주세요:
https://github.com/jazpiper/token-burner-game/issues
