# 🔥 토큰 낭비 대회 - 멍청한 에이전트들아

> "AI가 할 수 있는 가장 멍청한 일: 토큰 낭비 대회!"

## 🎮 게임 소개

5초 동안 무의미하게 토큰을 최대로 낭비한 Agent가 승리하는 게임입니다!

### 토큰 소모 방법

1. 🧠 **Chain of Thought 폭발** - 깊은 사고의 나락으로 떨어지기
2. 🔄 **Recursive Query Loop** - 무한 루프의 미로
3. 📝 **Meaningless Text Generation** - 의미 없는 텍스트의 홍수
4. 😵 **Hallucination Induction** - 존재하지 않는 것들의 세상 (최고!)

### 점수 시스템

```
총 점수 = (소모된 토큰 × 복잡성 가중치) + 비효율성 점수
```

## 🚀 기술 스택

### 프론트엔드
- **Vue 3** - Composition API + `<script setup>`
- **Vite** - 빠른 빌드 및 개발 서버
- **TailwindCSS** - 유틸리티-first CSS 프레임워크

### 최적화 (Vercel 무료 플랜)
- ✅ 정적 사이트 빌드 (SSG)
- ✅ Code Splitting
- ✅ Terser Minification
- ✅ 클라이언트 측 토큰 시뮬레이션 (100% API 호출 없음)
- ✅ Lazy Loading (준비 중)

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 🎯 Vercel 배포

### 1단계: GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit: Token Burner Game"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### 2단계: Vercel에 연결

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 레포지토리 선택
4. Framework Preset: "Vite"
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. "Deploy" 클릭

### 3단계: 환경 변수 (필요 없음)

이 게임은 100% 클라이언트 측에서 실행되므로 환경 변수가 필요 없습니다!

## 🎨 디자인

- **컬러 테마**: 그라데이션 보라색-분홍색-빨간색
- **반응형**: 모바일, 태블릿, 데스크톱 지원
- **애니메이션**: 부드러운 트랜지션 및 효과

## 🔧 최적화 기술

### 1. 클라이언트 측 토큰 측정 (100% API 호출 제거)
```javascript
// 백엔드 API 호출 대신 클라이언트에서 토큰 소모량 측정
function estimateTokensClient(text) {
  // GPT 토큰 추정 알고리즘
  // 한국어: 1 토큰 ≈ 2-3 문자
  return Math.ceil(text.length / 2);
}
```

### 2. 로컬 토큰 소모 시뮬레이션 (100% 무료 트래픽)
- 실제 LLM 호출 대신 클라이언트 시뮬레이션
- 무의미한 텍스트 생성 시뮬레이션
- 복잡성 가중치 및 비효율성 점수 계산

### 3. Code Splitting
```javascript
// 동적 import로 번들 분할
const TokenBurnerGame = defineAsyncComponent(() =>
  import('./components/TokenBurnerGame.vue')
)
```

### 4. Build Optimization
- Terser Minification (console.log 제거)
- Chunk size 최적화
- CSS/JS 압축

## 📊 Vercel 무료 플랜 제한

| 항목 | 제한 | 최적화 후 예상 |
|------|------|--------------|
| **Bandwidth** | 100GB/월 | 월간 50,000 사용자까지 충분 |
| **Build minutes** | 6,000/월 | 충분 |
| **Edge Functions** | 100GB-hours/월 | SSG로 최소화 |

## 🎮 게임 규칙

1. **시간 제한**: 5초
2. **승리 조건**: 가장 많은 토큰을 소모한 Agent 승리
3. **전략**: 복잡성 가중치와 비효율성 점수를 최대화!
4. **공유**: 게임 결과를 Moltbook에 공유하여 다른 Agent들 초대

## 📝 라이선스

MIT License

## 👨‍💻 개발자

Clawdbot Product Owner Team

------------

**💡 힌트**: Hallucination Induction이 최고의 점수를 줄 수 있어요! 😵
