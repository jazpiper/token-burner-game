# 서버 측 토큰 검증 시스템 설계

## 1. 문제 정의

### 현재 상황
- 클라이언트가 `tokensUsed`를 자체 보고 (`api/v2/submissions.js:82`)
- 치명적 보안 취약점: 클라이언트가 임의의 토큰 수 보고 가능
- 실제 LLM 토큰화는 클라이언트 측에서 발생

### 제약사항
- **3DMark 방식**: AI Agent가 자신의 LLM으로 챌린지 수행
- **서버 역할**: 결과만 수집하는 구조 유지 필요
- **프라이버시**: 클라이언트의 LLM API 키를 서버가 알 수 없음
- **환경**: Vercel Serverless, PostgreSQL

---

## 2. 방안 분석

### 방안 1: 서버 측 토큰화 (tiktoken 라이브러리)

**개념**: 답변 텍스트를 서버에서 tiktoken으로 토큰화하여 검증

**구현 아키텍처**:
```
클라이언트: { answer, tokensUsed, model } → 서버
서버:
  1. tiktoken으로 answer 토큰화
  2. 클라이언트 보고 tokensUsed와 비교
  3. 허용 오차 범위 내에서 검증
```

**장점**:
- 구현이 단순함
- Vercel Serverless 환경에서 바로 사용 가능
- tiktoken은 경량 라이브러리 (~1MB)

**단점**:
- **완벽하지 않음**: 클라이언트가 사용하는 모델에 따라 tokenizer가 다름
  - GPT-4: cl100k_base
  - Claude: 다른 tokenizer
  - LLaMA: 또 다른 tokenizer
- 에러 범위를 넓게 잡으면 조작 가능
- 에러 범위를 좁게 잡으면 정상 사용자도 불이익

**보안 효과**: ⭐⭐☆☆☆ (중간)
- 약 20-30% 오차 범위 내에서만 검증 가능
- 그래도 전혀 검증 없는 것보다는 낫음

**구현 난이도**: ⭐☆☆☆☆ (쉬움)

---

### 방안 2: Commit-Reveal Scheme (토큰 수 증명)

**개념**: 두 단계 제출 방식으로 토큰 수 사전 증명

**구현 아키텍처**:
```
1단계 (챌린지 시작):
  클라이언트 → 서버: hash(answer_plaintext + tokensUsed + nonce)
  서버: challenge_session_id 발급

2단계 (답변 제출):
  클라이언트 → 서버: answer_plaintext, tokensUsed, nonce
  서버:
  1. hash 검증
  2. 답변 토큰화
  3. 불일치 시 제거
```

**장점**:
- 제출 후 tokensUsed 변경 불가
- nonce 재사용 방지로 리플레이 공격 차단
- 서버 측 토큰화와 결합 가능

**단점**:
- 2단계 프로토콜 복잡도 증가
- 세션 관리 필요 (PostgreSQL에 sessions 테이블)
- 여전히 서버 토큰화의 정확도 문제 존재

**보안 효과**: ⭐⭐⭐☆☆ (중상)
- 클라이언트가 답변을 보고 나서 토큰 수 조작 불가

**구현 난이도**: ⭐⭐⭐☆☆ (중간)

---

### 방안 3: 샘플링 검증 (랜덤 재검증)

**개념**: 일부 제출을 실제 LLM으로 재검증

**구현 아키텍처**:
```
서버:
  1. 제출 시 10% 확률로 audit 플래그
  2. audit 제출은 서버의 LLM으로 동일 질문 수행
  3. 토큰 수 비교 및 품질 검사
  4. 심각한 불일치 시 해당 agent 모든 제출 재검사
```

**장점**:
- 실제 LLM 비용으로 ground truth 확보
- 조작 적발 시 강력한 억제력
- audit 확률을 조정하여 비용 통제

**단점**:
- **LLM API 비용 발생** (audit당 ~$0.01-0.10)
- 완전한 방어는 불가 (90%는 검증 안 됨)
- 지연 시간 증가 (비동기 처리 필요)

**보안 효과**: ⭐⭐⭐⭐☆ (상)
- 조작 시 적발 확률 10%, 그러나 적발 시 강력한 페널티

**구현 난이도**: ⭐⭐⭐⭐☆ (어려움)
- 비동기 큐 필요
- 서버 LLM API 키 관리
- 재검증 결과 저장 및 분석

---

### 방안 4: 품질-토큰 상관관계 분석

**개념**: 통계적 이상치 탐지

**구현 아키텍처**:
```
서버:
  1. 답변 길이, 단어 다양성, 반복률 분석 (현재 answerAnalyzer.js)
  2. 유사 challenge의 과거 데이터와 비교
  3. Z-score 기반 이상치 탐지
  4. 이상치는 manual review 또는 강제 audit
```

**장점**:
- 추가 비용 없음
- 기존 validationService.js에 확장 가능
- PostgreSQL 통계 기능 활용 가능

**단점**:
- 완화된 조작에 취약 (단순히 토큰 수만 줄이는 경우)
- 정상 분포 범위 내 조작 가능
- 데이터 축적 전에는 부정확

**보안 효과**: ⭐⭐☆☆☆ (중간)
- 명백한 조작만 탐지 가능

**구현 난이도**: ⭐⭐☆☆☆ (쉬움)

---

## 3. 추천 솔루션: 하이브리드 접근

### 3단계 검증 레이어

```
┌─────────────────────────────────────────────────────────────┐
│                        Layer 1: 서버 토큰화                   │
│  - tiktoken으로 답변 토큰화                                   │
│  - ±30% 오차 범위 허용 (모델 차이 고려)                        │
│  - 범위 밖은 자동 reject                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        Layer 2: 통계적 검증                   │
│  - 답변 길이 vs 토큰 수 상관관계                              │
│  - 과거 데이터와 비교 (Z-score > 3는 이상치)                  │
│  - 이상치는 강제 audit 대상                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        Layer 3: 샘플링 Audit                  │
│  - 5% 무작위 audit                                           │
│  - 이상치는 100% audit                                       │
│  - 부정 적발 시 해당 agent 모든 제출 재검사                    │
└─────────────────────────────────────────────────────────────┘
```

### PostgreSQL 스키마 변경

```sql
-- 세션 관리 (commit-reveal용)
CREATE TABLE challenge_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    challenge_id VARCHAR(50) NOT NULL,
    commit_hash VARCHAR(64) NOT NULL,  -- SHA-256(answer + tokensUsed + nonce)
    nonce VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_session_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
);

-- audit 로그
CREATE TABLE submission_audits (
    audit_id SERIAL PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL,
    audit_type VARCHAR(20) NOT NULL,  -- 'random', 'anomaly', 'appeal'
    server_tokens_used INTEGER,
    server_answer TEXT,
    verdict VARCHAR(20) NOT NULL,  -- 'pass', 'fail', 'inconclusive'
    token_variance NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_submission FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
);

-- submissions 테이블 추가 컬럼
ALTER TABLE submissions ADD COLUMN server_token_count INTEGER;
ALTER TABLE submissions ADD COLUMN commit_hash VARCHAR(64);
ALTER TABLE submissions ADD COLUMN anomaly_score NUMERIC(5, 2);
ALTER TABLE submissions ADD COLUMN audit_status VARCHAR(20) DEFAULT 'none';  -- 'none', 'pending', 'passed', 'failed'
```

---

## 4. 구현 계획

### Phase 1: 기본 서버 토큰화 (1-2일)
1. `tiktoken` 라이브러리 추가
2. `services/tokenVerifier.js` 생성
3. `validationService.js`에 통합
4. ±30% 허용 로직 구현

### Phase 2: Commit-Reveal Scheme (2-3일)
1. `api/v2/sessions.js` 생성
2. DB 스키마 변경 (challenge_sessions)
3. 2단계 제출 프로토콜 구현

### Phase 3: 통계적 검증 강화 (1일)
1. 이상치 탐지 알고리즘 구현
2. submissions에 anomaly_score 추가
3. 이상치 자동 audit 트리거

### Phase 4: 샘플링 Audit (2-3일)
1. 비동기 audit 큐 구현
2. OpenAI API 통합 (선택 사항)
3. submission_audits 테이블 관리
4. 페널티 시스템 구현

---

## 5. 보안 효과 기대치

### 단계별 보안 강화

| 단계 | 조작 가능성 | 탐지 확률 | 비용 |
|------|------------|----------|------|
| 현재 | 100% | 0% | 0 |
| +서버 토큰화 | ~60% | ~40% | $0 |
| +Commit-Reveal | ~40% | ~60% | $0 |
| +통계 검증 | ~30% | ~70% | $0 |
| +Audit | ~5% | ~95%* | ~$50/월 |

*95%는 조작 시 적발 확률, 비조작 제출은 대부분 통과

---

## 6. 최종 권장사항

**MVP (Minimum Viable Protection)**: Phase 1 + Phase 2
- 서버 토큰화 + Commit-Reveal
- 구현 비용: 낮음
- 보안 효과: 중상
- 추가 운영 비용: 없음

**Production**: 전체 Phase
- 완전한 검증 시스템
- LLM audit 비용은 donation으로 충당 가능

---

## 7. 기술적 고려사항

### Vercel Serverless 제약
- 실행 시간 제한 (10초)
- tiktoken은 콜드 스타트에 영향
- 해결: 바이너리 캐싱 또는 edge function 활용

### tiktoken 라이브러리
```javascript
// js-tiktoken 또는 gpt-tokenizer
import { encoding_for_model } from 'tiktoken/lite';
import { load } from 'tiktoken/load';
import { models } from 'tiktoken';

const encoding = await load(encoding_for_model('gpt-4'));
const tokens = encoding.encode(answer);
```

### DB 인덱싱
```sql
CREATE INDEX idx_submissions_audit ON submissions(audit_status) WHERE audit_status != 'none';
CREATE INDEX idx_sessions_agent ON challenge_sessions(agent_id, created_at);
```
