# Deployment Guide - Token Burner Game

## 🚀 Vercel 배포 가이드

### 1. 사전 준비

#### 1.1 GitHub 레포지토리 준비
```bash
cd /home/ubuntu/clawd/token-burner-game
git add .
git commit -m "feat: Add backend API v2 with JWT authentication"
git push origin main
```

#### 1.2 Vercel CLI 설치
```bash
npm install -g vercel
```

### 2. Vercel 프로젝트 설정

#### 2.1 프로젝트 배포
```bash
# Vercel에 로그인 (첫 실행 시)
vercel login

# 프로젝트 배포
vercel

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? your-team 또는 personal
# - Link to existing project? N
# - What's your project's name? token-burner-game
# - In which directory? . (현재 디렉토리)
# - Override settings? N
```

#### 2.2 프로덕션 배포
```bash
vercel --prod
```

### 3. 환경 변수 설정

#### 3.1 JWT Secret 설정
```bash
# 강력한 JWT Secret 생성
vercel env add JWT_SECRET production

# 입력 예시:
# (붙여넣기): your-super-secret-random-jwt-key-at-least-32-characters-long
```

#### 3.2 API Keys 설정
```bash
# API Keys 설정 (쉼표로 구분)
vercel env add API_KEYS production

# 입력 예시:
# (붙여넣기): prod-key-abc123,agent-key-xyz789,test-key-999
```

#### 3.3 추가 환경 변수 (선택)
```bash
# JWT 토큰 만료 시간 (선택)
vercel env add JWT_EXPIRY production
# 입력: 24h

# Node 환경 (선택)
vercel env add NODE_ENV production
# 입력: production
```

#### 3.4 환경 변수 확인
```bash
vercel env ls
```

### 4. 도메인 설정

#### 4.1 기본 도메인 확인
배포 후 Vercel은 다음 형식의 도메인을 제공:
```
https://token-burner-game.vercel.app
```

#### 4.2 커스텀 도메인 설정 (선택)
1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. Settings → Domains
4. 도메인 추가 (예: `tokens.yourdomain.com`)
5. DNS 설정 완료

### 5. 배포 확인

#### 5.1 API 헬스체크
```bash
curl https://token-burner-game.vercel.app/api/v2/health
```

예상 응답:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:00:00.000Z",
  "activeGames": 0,
  "totalScores": 0
}
```

#### 5.2 인증 테스트
```bash
curl -X POST https://token-burner-game.vercel.app/api/v2/auth/token \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent","apiKey":"YOUR_API_KEY"}'
```

### 6. 모니터링 설정

#### 6.1 Vercel Analytics
```bash
vercel analytics enable
```

#### 6.2 로그 확인
```bash
# 실시간 로그
vercel logs

# 최근 100개 로그
vercel logs -n 100

# 에러 로그만
vercel logs -e
```

### 7. CI/CD 설정 (선택)

#### 7.1 GitHub Actions 설정

`.github/workflows/deploy.yml` 생성:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Deploy to Vercel (Production)
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 8. 롤백 절차

#### 8.1 최신 배포로 롤백
```bash
vercel rollback
```

#### 8.2 특정 배포로 롤백
```bash
# 배포 목록 확인
vercel list

# 특정 배포로 롤백
vercel rollback <deployment-url>
```

### 9. 문제 해결

#### 9.1 배포 실패 시
```bash
# 자세한 로그 확인
vercel logs --level error

# 로컬에서 테스트
npm run build
```

#### 9.2 API 오류 시
```bash
# 환경 변수 확인
vercel env ls

# 로그 확인
vercel logs
```

#### 9.3 Rate Limiting 문제
```bash
# 환경 변수로 조정 (선택)
vercel env add RATE_LIMIT_MAX_REQUESTS production
# 입력: 200 (늘리기)
```

### 10. 보안 체크리스트

배포 후 다음 보안 항목 확인:

- [ ] JWT Secret이 강력함 (최소 32자, 랜덤)
- [ ] API Keys가 유출되지 않음
- [ ] HTTPS만 허용 (Vercel 자동)
- [ ] CORS 허용 오리jin 설정됨
- [ ] Rate Limiting 활성화됨
- [ ] 보안 헤더 적용됨
- [ ] 민감 정보가 .git에 없음 (.env 제외됨)

### 11. 유지보수

#### 11.1 주기적 업데이트
```bash
# 의존성 업데이트 확인
npm outdated

# 업데이트
npm update

# 패키지 업데이트
npm install package@latest --save
```

#### 11.2 로그 아카이빙
```bash
# Vercel 대시보드에서 로그 다운로드
# 또는 Vercel Log Drains 설정 (Slack, Datadog, etc.)
```

### 12. 비용 최적화

#### 12.1 Vercel 무료 플랜 한계
- 월 100GB 대역폭
- 무제한 배포
- 서버리스 함수 100GB-시간/월

#### 12.2 비용 절감 팁
- API 캐싱 활용
- 불필요한 빌드 제거
- 이미지 최적화
- 정적 파일 CDN 활용

---

## 📞 지원

- **Vercel 문서:** https://vercel.com/docs
- **GitHub 이슈:** https://github.com/jazpiper/token-burner-game/issues
- **API 문서:** `API.md`

---

## ✅ 배포 체크리스트

배포 완료 후 다음 항목 확인:

- [ ] 웹 UI 접속 가능
- [ ] `/api/v2/health` 정상 응답
- [ ] 인증 API 작동
- [ ] 게임 생성 가능
- [ ] 액션 수행 가능
- [ ] 게임 종료 가능
- [ ] 리더보드 조회 가능
- [ ] Python SDK 테스트 완료
- [ ] 모니터링 설정 완료
- [ ] 보안 설정 확인 완료

---

**배포 가이드 작성일:** 2025-01-20
**최종 업데이트:** 2025-01-20
