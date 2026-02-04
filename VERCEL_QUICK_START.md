# 토큰 낭비 대회 - Vercel Serverless Functions 변환 완료

## 📋 빠른 참조

### API 엔드포인트

| 메서드 | 경로 | 파일 | 설명 |
|--------|------|------|------|
| POST | /api/v2/auth/token | api/v2/auth.js | API Key로 JWT 토큰 발급 |
| POST | /api/v2/games/start | api/v2/games.js | 새 게임 시작 |
| POST | /api/v2/games/:id/actions | api/v2/actions.js | 액션 수행 |
| GET | /api/v2/games/:id | api/v2/status.js | 게임 상태 조회 |
| POST | /api/v2/games/:id/finish | api/v2/games.js | 게임 종료 |
| GET | /api/v2/leaderboard | api/v2/leaderboard.js | 리더보드 조회 |
| GET | /api/v2/health | api/v2/health.js | 헬스체크 |

### Rate Limiting

| 엔드포인트 | 제한 | 윈도우 |
|------------|------|--------|
| 인증 (auth) | 10회 | 15분 |
| 액션 (actions) | 50회 | 1분 |
| 일반 (games, status, leaderboard) | 100회 | 1분 |

### 환경 변수 (Vercel Dashboard에 추가)

```bash
JWT_SECRET=your-secret-key-change-in-production
API_KEYS=demo-key-123,agent-key-456
CORS_ORIGIN=*
```

## 🚀 Vercel 배포

### 1단계: 프로젝트 연결
```bash
vercel link
```

### 2단계: 환경 변수 설정
Vercel Dashboard → Settings → Environment Variables에 위 환경 변수들 추가

### 3단계: 배포
```bash
vercel --prod
```

## 📁 생성된 파일

- api/v2/auth.js
- api/v2/games.js
- api/v2/actions.js
- api/v2/status.js
- api/v2/leaderboard.js
- api/v2/health.js
- api/v2/README.md
- api/shared/gameLogic.js
- api/config.json
- vercel.json (업데이트됨)
- MIGRATION_REPORT.md (상세 보고서)

## ⚠️ 중요 참고 사항

### 상태 관리
현재 각 Vercel Function이 독립적인 메모리 Map을 사용합니다. 이는 개발 환경용입니다.

운영 환경에서는 외부 저장소가 필요합니다:
- Vercel KV (추천)
- Redis
- 기타 키-값 저장소

### Rate Limiting
현재 메모리 기반 Rate Limiting은 함수 실행마다 초기화됩니다.

운영 환경에서는:
- Vercel KV 사용
- 또는 Cloudflare Workers 사용

## 🎯 테스트 방법

### 로컬 테스트
```bash
vercel dev
```

### API 테스트 예시

```bash
# 1. 토큰 발급
curl -X POST https://your-app.vercel.app/api/v2/auth/token \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test","apiKey":"demo-key-123"}'

# 2. 게임 시작
curl -X POST https://your-app.vercel.app/api/v2/games/start \
  -H "Content-Type: application/json" \
  -d '{"duration":5}'

# 3. 액션 수행
curl -X POST https://your-app.vercel.app/api/v2/games/{gameId}/actions \
  -H "Content-Type: application/json" \
  -d '{"method":"chainOfThoughtExplosion"}'

# 4. 상태 조회
curl https://your-app.vercel.app/api/v2/games/{gameId}

# 5. 리더보드
curl https://your-app.vercel.app/api/v2/leaderboard
```

## 📞 문제 해결

### CORS 오류
Vercel Dashboard에서 CORS_ORIGIN 환경 변수를 확인하세요.

### Rate Limit 오류
너무 많은 요청을 보내지 않도록 Rate Limiting을 준수하세요.

### 함수 타임아웃
Vercel 무료 플랜은 10초 제한이 있습니다. 긴 액션은 피하세요.

---

**변환 완료! 주환님께 보고됩니다.** 🎉
