# 🚀 배포 가이드

## Vercel 무료 플랜 배포

### 1단계: GitHub Repository 생성

```bash
cd /home/ubuntu/clawd/token-burner-game

# Git 초기화
git init

# .gitignore 확인 (이미 존재함)
cat .gitignore

# 첫 커밋
git add .
git commit -m "Initial commit: Token Burner Game with traffic optimization"

# GitHub 레포지토리 생성 후 원격 추가
git remote add origin https://github.com/YOUR_USERNAME/token-burner-game.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 2단계: Vercel 배포

#### 옵션 A: 웹 대시보드 사용 (권장)

1. [Vercel](https://vercel.com)에 로그인
2. "Add New..." → "Project" 클릭
3. GitHub 레포지토리 목록에서 `token-burner-game` 찾기
4. "Import" 클릭

#### 빌드 설정 (자동 감지되지만 확인하세요):

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. "Deploy" 버튼 클릭
6. 1-2분 내에 배포 완료!
7. `https://token-burner-game.vercel.app` (또는 사용자 지정 도메인)에서 게임 접속

#### 옵션 B: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 배포
cd /home/ubuntu/clawd/token-burner-game
vercel

# 프롬프트에 따라 응답:
# - Set up and deploy? Y
# - Link to existing project? N
# - Project name: token-burner-game
# - In which directory is your code located? ./
# - Want to override the settings? N
```

### 3단계: 커스텀 도메인 설정 (선택 사항)

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Domains" 탭
3. 원하는 도메인 입력 (예: `token-burner.yourdomain.com`)
4. DNS 설정 지침에 따라 DNS 레코드 추가
5. 도메인 확인 대기 (일반적으로 5-10분)

## 🎯 배포 확인

### 로컬에서 미리보기

```bash
# 프로덕션 빌드
npm run build

# 로컬 미리보기 서버 실행
npm run preview

# 브라우저에서 http://localhost:4173 접속
```

### 배포 후 테스트

1. **기능 테스트**
   - [ ] 게임 시작 버튼 작동
   - [ ] 4가지 토큰 소모 방법 모두 작동
   - [ ] 5초 타이머 정확히 작동
   - [ ] 점수 계산 정확
   - [ ] Moltbook 공유 기능 작동

2. **트래픽 최적화 확인**
   - [ ] Network 탭에서 API 호출 없음 확인
   - [ ] 정적 에셋 캐싱 작동
   - [ ] Code splitting 작동

3. **반응형 테스트**
   - [ ] 모바일 (375px) 정상 작동
   - [ ] 태블릿 (768px) 정상 작동
   - [ ] 데스크톱 (1024px+) 정상 작동

4. **브라우저 호환성**
   - [ ] Chrome 최신 버전
   - [ ] Firefox 최신 버전
   - [ ] Safari 최신 버전
   - [ ] Edge 최신 버전

## 📊 Vercel 무료 플랜 모니터링

### 트래픽 모니터링

Vercel 대시보드에서 확인:
1. 프로젝트 → "Analytics" 탭
2. **Bandwidth** 사용량 확인 (월간 100GB 제한)
3. **Build minutes** 확인 (월간 6,000분 제한)

### 예상 트래픽 계산

```
초기 번들 크기:
- index.html: 0.90 KB
- CSS: 2.88 KB
- JS: 11.74 KB + 58.52 KB = 70.26 KB
- 총: ~74 KB

Gzip 압축 후: ~28 KB

1 방문당 트래픽: ~28 KB
월간 50,000 방문: 50,000 × 28 KB = 1,400 MB = 1.4 GB

✅ Vercel 무료 플랜 (100GB/월)으로 충분!
```

## 🔧 문제 해결

### 빌드 실패

```bash
# 캐시 정리 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 배포 후 스타일 깨짐

```bash
# TailwindCSS 설정 확인
cat postcss.config.js

# style.css에 @tailwind 지시어 확인
head -5 src/style.css
```

### 404 에러

```bash
# vercel.json 설정 확인
cat vercel.json

# SPA 라우팅을 위한 rewrites 확인
```

## 🎉 배포 완료 후

1. 게임 URL 테스트
2. 친구/팀원에게 공유
3. 사용자 피드백 수집
4. 필요에 따라 기능 개선

## 📞 지원

이슈가 발생하면:
1. GitHub Issues 확인
2. Vercel 공식 문서 참조: https://vercel.com/docs
3. Vue 3 공식 문서: https://vuejs.org

---

**🚀 즐거운 배포되세요!**
