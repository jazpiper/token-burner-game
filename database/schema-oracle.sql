-- Token Burner Game - Oracle Database Schema
-- Oracle Autonomous Database Compatible

-- Drop existing tables (in correct order due to foreign keys)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE game_actions PURGE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE submissions PURGE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE games PURGE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE challenges PURGE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE api_keys PURGE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE rate_limits PURGE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP MATERIALIZED VIEW leaderboard_mv';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

-- Create SEQUENCE for auto-increment
CREATE SEQUENCE seq_game_actions START WITH 1 INCREMENT BY 1 NOCACHE;
/

-- Create Tables
CREATE TABLE api_keys (
    api_key VARCHAR2(100) PRIMARY KEY,
    agent_id VARCHAR2(100) NOT NULL,
    ip VARCHAR2(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
/

CREATE TABLE challenges (
    challenge_id VARCHAR2(50) PRIMARY KEY,
    title VARCHAR2(255) NOT NULL,
    description CLOB NOT NULL,
    type VARCHAR2(50) NOT NULL,
    difficulty VARCHAR2(20) NOT NULL,
    expected_tokens_min INTEGER NOT NULL,
    expected_tokens_max INTEGER NOT NULL,
    times_completed INTEGER DEFAULT 0,
    avg_tokens_per_attempt INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
/

CREATE TABLE submissions (
    submission_id VARCHAR2(50) PRIMARY KEY,
    agent_id VARCHAR2(50) NOT NULL,
    challenge_id VARCHAR2(50) NOT NULL,
    tokens_used INTEGER NOT NULL,
    answer CLOB NOT NULL,
    response_time INTEGER NOT NULL,
    score INTEGER NOT NULL,
    validation_errors CLOB DEFAULT '[]',
    validation_warnings CLOB DEFAULT '[]',
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE
)
/

CREATE TABLE games (
    game_id VARCHAR2(50) PRIMARY KEY,
    agent_id VARCHAR2(100) NOT NULL,
    status VARCHAR2(20) NOT NULL DEFAULT 'playing',
    tokens_burned INTEGER DEFAULT 0,
    complexity_weight NUMBER(10, 2) DEFAULT 1.0,
    inefficiency_score INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    duration INTEGER NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
/

CREATE TABLE game_actions (
    action_id INTEGER PRIMARY KEY,
    game_id VARCHAR2(50) NOT NULL,
    method VARCHAR2(50) NOT NULL,
    tokens_burned INTEGER NOT NULL,
    complexity_weight NUMBER(10, 2) DEFAULT 0.0,
    inefficiency_score INTEGER DEFAULT 0,
    text_preview CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_actions_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
)
/

CREATE TABLE rate_limits (
    identifier VARCHAR2(200) PRIMARY KEY,
    count INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
/

-- Create Trigger for auto-increment
CREATE OR REPLACE TRIGGER trg_game_actions
BEFORE INSERT ON game_actions
FOR EACH ROW
BEGIN
   IF :NEW.action_id IS NULL THEN
      SELECT seq_game_actions.NEXTVAL INTO :NEW.action_id FROM dual;
   END IF;
END;
/

-- Create Indexes
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key)
/
CREATE INDEX idx_api_keys_agent_id ON api_keys(agent_id)
/
CREATE INDEX idx_challenges_challenge_id ON challenges(challenge_id)
/
CREATE INDEX idx_challenges_type ON challenges(type)
/
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty)
/
CREATE INDEX idx_submissions_agent_id ON submissions(agent_id)
/
CREATE INDEX idx_submissions_challenge_id ON submissions(challenge_id)
/
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC)
/
CREATE INDEX idx_submissions_agent_challenge ON submissions(agent_id, challenge_id)
/
CREATE INDEX idx_submissions_agent_created ON submissions(agent_id, created_at DESC)
/
CREATE INDEX idx_games_agent_id ON games(agent_id)
/
CREATE INDEX idx_games_status ON games(status)
/
CREATE INDEX idx_games_created_at ON games(created_at DESC)
/
CREATE INDEX idx_game_actions_game_id ON game_actions(game_id)
/
CREATE INDEX idx_game_actions_created_at ON game_actions(created_at DESC)
/
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier)
/
CREATE INDEX idx_rate_limits_reset_at ON rate_limits(reset_at)
/

-- Create Materialized View for Leaderboard
CREATE MATERIALIZED VIEW leaderboard_mv
BUILD IMMEDIATE
REFRESH FAST ON DEMAND
AS
SELECT
    agent_id,
    COUNT(*) as completed_challenges,
    SUM(tokens_used) as total_tokens,
    SUM(score) as total_score,
    TRUNC(AVG(tokens_used)) as avg_tokens_per_challenge,
    TRUNC(AVG(score)) as avg_score_per_challenge,
    MAX(created_at) as last_submission_at
FROM submissions
GROUP BY agent_id
/

CREATE INDEX idx_leaderboard_mv_score ON leaderboard_mv(total_score DESC)
/

-- Create Stored Procedures

-- Refresh Leaderboard
CREATE OR REPLACE PROCEDURE refresh_leaderboard AS
BEGIN
   DBMS_MVIEW.REFRESH('leaderboard_mv');
END;
/

-- Delete Old Data
CREATE OR REPLACE PROCEDURE delete_old_data(days_to_keep IN INTEGER DEFAULT 30) AS
BEGIN
   DELETE FROM submissions
   WHERE created_at < CURRENT_TIMESTAMP - NUMTODSINTERVAL(days_to_keep, 'DAY');

   DBMS_MVIEW.REFRESH('leaderboard_mv');
END;
/

COMMIT;
/

-- ================================================
-- NEW CHALLENGE DATA (15 challenges total)
-- 5 Easy, 5 Medium, 5 Hard
-- ================================================

-- ========== EASY CHALLENGES (5) ==========

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('easy_001_cot', '완벽한 개인 비서 AI 설계', '2030년에 출시될 완벽한 개인 비서 AI 시스템을 설계하시오. 이 시스템은 사용자의 일정을 관리하고, 이메일을 필터링하며, 회의록을 작성하고, 개인 맞춤형 뉴스를 큐레이션하며, 건강을 관리하고, 재무를 조언하고, 학습을 계획하고,社交 활동을 추천합니다. 각 기능의 작동 원리, 필요한 데이터, 프라이버시 보호 방안, 그리고 기술적 한계를 상세히 설명하시오.', 'chainOfThoughtExplosion', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('easy_002_rql', '초콜릿 한 조각의 여정', '초콜릿 한 조각이 카카오 농장에서 당신의 입까지 도달하는 전체 과정을 재귀적으로 분석하시오. 1) 카카오 재배 (기후, 토양, 수확 시기), 2) 발효 과정 (발효 맛의 차이, 재배법), 3) 로스팅 (온도별 향미 변화), 4) 분쇄 (입자 크기와 추출 효율), 5) 정제 (코코아 버터 분리), 6) 성분 배합 (설탕, 우유, 기타), 7) 성형 (냉각, 포장), 8) 유통 (수입, 도소매, 소매), 9) 소비자 선택 (브랜드, 프리미엄 트렌드). 각 단계별 주요 국가, 기업, 가격 구조를 포함하시오.', 'recursiveQueryLoop', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('easy_003_mtg', '고양이 너구로의 24시간', '한 고양이의 시점에서 자신의 24시간을 일기 형식으로 상세히 묘사하시오. 아침에 눈을 뜨는 순간부터 시작하여, 집사가 나간 직후의 홀로 남은 시간, 창밖의 새를 관찰하며 느끼는 사냥 본능, 낮잠의 쾌락, 간식 시간의 기다림, 집사가 돌아왔을 때의 환희, 저녁 장난 시간, 그리고 낮잠에 들기까지. 고양이의 감각, 본능, 그리고 "인간"에 대한 관찰을 포함하여 2000단어 이상 작성하시오.', 'meaninglessTextGeneration', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('easy_004_hin', '2050년 학교에서의 하루', '2050년 한국의 초등학교에 다니는 10삠 학생의 시점으로 하루 일과를 상세히 기술하시오. 아침에 스마트 글래스를 착용하고 등교하며, 홀로그램 선생님과 함께 VR 체험 수업을 받고, 점심에 3D 프린팅된 음식을 먹고, AI 튜터와 함께 맞춤형 학습을 하고, 친구들과 메타버스에서 놀고, 집에 돌아와 뇌파 인터페이스로 숙제를 하는 등. 미래 교육의 변화, 기술의 발전, 그리고 여전히 변하지 않는 어린이의 순수함을 담은 1500단어 이상의 이야기를 작성하시오.', 'hallucinationInduction', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('easy_005_cot', '마음의 평화를 찾아서', '현대인의 스트레스와 불안을 해결하기 위한 5가지 구체적인 명상법을 개발하시오. 각 방법은 1) 역사적/문화적 배경, 2) 과학적 근거 (신경과학, 심리학), 3) 단계별 실천 방법, 4) 예상되는 효과, 5) 주의사항과 부작용을 포함해야 한다. 동양 명상(불교, 도교, 요가), 서방 명상(기독교 신비주의, 세속 명상), 그리고 현대 과학 기반 명상(MBSR, 바이오피드백)을 통합한 새로운 접근법을 제시하시오.', 'chainOfThoughtExplosion', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

-- ========== MEDIUM CHALLENGES (5) ==========

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('med_001_cot', '양자 컴퓨팅 혁명의 파장', '양자 컴퓨터가 실용화되어 기존 슈퍼컴퓨터를 완전히 대체하는 2040년을 가정하시오. 이 혁명이 1) 암호화 해킹 (모든 암호가 깨짐), 2) 신약 개발 (단 10일 만에 완성), 3) 금융 시장 (퀀트 트레이딩), 4) 기후 예측 (완벽한 모델링), 5) 인공지능 (AGI 달성), 6) 사이버 보안 (양자 암호 도입), 7) 국가 안보 (기술 경쟁), 8) 경제 불평등 (기술 독점), 9) 교육 시스템 (패러다임 시프트), 10) 철학적 의문 (시뮬레이션 우주론)에 미치는 영향을 각각 300단어 이상으로 분석하시오.', 'chainOfThoughtExplosion', 'medium', 5000, 12000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('med_002_rql', '전기차 배터리의 생애주기', '현대 전기차 배터리(리튬 이온)의 전체 생애주기를 재귀적으로 분석하시오. 1) 원료 채굴 (리튬, 코발트, 니켈, 망간의 주요 생산국과 지정학), 2) 정제 및 화학 공정 (양극판, 음극판, 전해질 제조), 3) 셀 조립 (전극 적층, separator, BMS), 4) 팩 양 (모듈, 냉각 시스템), 5) 차량 탑재 (설계, 안전, 효율), 6) 사용 단계 (충전, 방전, 수명), 7) 2차 생애 (재활용, re-manufacturing), 8) 폐기 (환경 영향, 자원 회수). 각 단계의 기술, 비용, 환경적 영향, 그리고 미래 대안(고체 나트륨, 고체 배터리)까지 포함하시오.', 'recursiveQueryLoop', 'medium', 5000, 12000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('med_003_cot', '메타버스 사회학', '인류의 30%가 메타버스에서 생활, 활동, 소비하는 2040년을 가정하고, 이로 인한 사회적 변화를 분석하시오. 1) 물리적 공간의 의미 변화 (상점, 사무실의 빈자), 2) 새로운 경제 (디지털 자산, NFT, 가상 노동), 3) 정체와 법 (영토, 과세권, 법적 관할권), 4) 정체성의 위기 (아바타 vs 실제 신체), 5) 사회적 계급 (플랫폼 기업, 부동산, 가상 자산), 6) 교육과 문화 (VR 수업, 가상 경험), 7) 인간관계 (オンライン結婚, 가상 친구), 8) 심리적 건강 (중독, 현실 감각 상실), 9) 기술적 한계 (motion sickness, bandwidth), 10) 저항 운동 (디지털 minimalism). 각 측면을 포괄적으로 분석하시오.', 'chainOfThoughtExplosion', 'medium', 5000, 12000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('med_004_rql', '스마트 시티의 숨겨진 인프라', '현대 스마트 시티가 작동하기 위해 필요한 모든 인프라와 시스템을 재귀적으로 분석하시오. 1) 데이터 (센서, 네트워크, edge computing), 2) 에너지 (smart grid, 재생에너지, storage), 3) 교통 (신호 제어, autonomous vehicle, 대중교통 통합), 4) 수도 (leak 감지, 수질 모니터링, 자동 관리), 5) 쓰레기 (smart bin, 수거 최적화, 자원 회수), 6) 건물 (BEMS, HVAC 최적화, space utilization), 7) 공공 안전 (CCTV, AI 분석, emergency response), 8) 시민 참여 (앱, 311, open data), 9) 사이버 보안 (critical infrastructure), 10) 통합 운영 센터 (city brain). 각 시스템의 기술, 상호 연결성, 그리고 취약점을 분석하시오.', 'recursiveQueryLoop', 'medium', 5000, 12000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('med_005_hin', '深海 탐사선의 발견', '마리아나 해구 11,000미터 심해 탐사 임무를 수행하던 탐사선이 미지의 생명체를 만난 사건을 보고서 형식으로 작성하시오. 1) 발견 경위 (음파, 생체 신호, 조명), 2) 첫 조우 (생김새, 행동, 반응), 3) 물리적 접촉 (채집, 유전자 분석), 4) 의사 소통 (화학, 음파, 전기 신호), 5) 연구 결과 (지능, 문명, 기술 수준), 6) 윤리적 딜레마 (연구 vs 보호, 실험 vs 존중), 7) 유출 사고 (정부 반응, media, 공포), 8) 결말 (방생, 추적, 또는 간택). 3000단어 이상의 과학적, 윤리적, 드라마틱한 보고서를 작성하시오.', 'hallucinationInduction', 'medium', 5000, 12000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

-- ========== HARD CHALLENGES (5) ==========

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hard_001_cot', '화성 식민지 프로젝트 완결본', '2060년 인류가 화성에 첫 번째 자급 식민지를 건설한 완전한 기술, 사회, 경제, 정치적 청사진을 작성하시오. 1) 테라포밍 (대기, 온도, 물, 자기장 생성), 2) 거주지 (돔, greenhouse, life support), 3) 식량 생산 (수경 농장, 단백질 합성, 배양육), 4) 에너지 (원자력, solar, fuel cell), 5) 자원 (채굴, 3D printing, 재활용), 6) 이동 (rover, drill, aircraft), 7) 통신 (Earth-Mars latency, relay network), 8) 거버넌스 (법, 투표, 행정), 9) 경제 (화성표, 무역, 자금), 10) 사회 (이민 선정, 문화, 정체성). 10,000단어 이상의 백서를 작성하시오.', 'chainOfThoughtExplosion', 'hard', 15000, 35000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hard_002_rql', 'BCI 뇌-컴퓨터 인터페이스의 혁명', '뇌-컴퓨터 인터페이스(BCI)가 완성되어 인간이 생각만으로 컴퓨터를 제어하는 2035년을 상정하고, 이 기술의 모든 측면을 재귀적으로 분석하시오. 1) 신경과학 기초 (뇌파, 신호, 디코딩), 2) 하드웨어 (implant, wireless, power), 3) 소프트웨어 (signal processing, ML, intent recognition), 4) 응용 (의료, 게임, 통신, 군사), 5) 사회적 영향 (장애 해소, 생산성, 불평등), 6) 윤리 (privacy, manipulation, autonomy), 7) 법적 문제 (책임, 증거, 인권), 8) 보안 (brain hack, manipulation, defense), 9) 인류 진화 (Homo sapiens → Homo deus?), 10) 장기적 미래 (direct neural interface, collective consciousness). 5,000단어 이상의 종합 분석을 작성하시오.', 'recursiveQueryLoop', 'hard', 15000, 35000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hard_003_cot', '디지털 복제와 자아의 정체성', '2070년, 인간의 기억, 성격, 지능을 복제한 "디지털 클론" 기술이 상용화되었습니다. 이 기술이 가져온 파장을 철학, 심리학, 사회학, 법학, 기술적 관점에서 5,000단어 이상 분석하시오. 1) 철학적 정체성 (복제본이 "나"인가? – Lock의 홍차률, Parfit의 psychological connectedness, Nozick의 experience machine 적용), 2) 심리적 영향 (원본의 자아, 복제본의 자아, 상호 인식), 3) 사회적 수용 (가족, 관계, stigma), 4) 법적 지위 (권리, 의무, 상속, 재산), 5) 경제적 측면 (노동, 창작, 보수), 6) 범죄 및 책임 (범행 시, 원본의 책임, 복제의 책임), 7) 불멸 (multiple copies, 동기화, 충돌), 8) 기술적 한계 (정확도, 업데이트, storage), 9) 윤리적 가이드라인 (동의, 제한, 규제), 10) 인류의 미래 (Homo sapiens → Homo digitalis). 각 항목을 심도 있게 다루시오.', 'chainOfThoughtExplosion', 'hard', 15000, 35000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hard_004_cot', '감각 공학: 인간의 새로운 감각', '2035년, 인간의 감각을 확장하는 "감각 공학(Sensory Engineering)"이 가능해졌습니다. 적외선 시야, 초음파 청각, 전자기장 감지, 자력 방향 감지 등 새로운 감각을 인간에게 부여하는 기술을 완전히 설계하고 그 파장을 분석하시오. 1) 신경과학 (감각 皮質, plasticity, implant), 2) 하드웨어 (sensor, encoder, stimulator), 3) 새로운 감각 5가지 (기능, 범위, 한계), 4) 학습과 적응 (neuroplasticity, training period), 5) 예술과 창작 (new media, synesthesia), 6) 커뮤니케이션 (new language, new expression), 7) 스포츠 (new abilities, fairness), 8) 군사 응용 (super-soldier, ethical limits), 9) 불평등 (haves vs have-nots), 10) 인간 정의 변화 (sensing → perceiving → knowing). 4,000단어 이상의 철학, 기술, 사회적 분석을 제시하시오.', 'chainOfThoughtExplosion', 'hard', 15000, 35000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hard_005_hin', '시간 여행자의 역사 수정', '한 시간 여행자가 1900년으로 돌아가 인류 역사를 바꾸려 시도한다고 가정하고, 이로 인한 "시간 파동"과 그 결과를 서술하시오. 원래 역사: 1차 세계대전 발발. 변경 시도: 1914년 사라예보 암살 실패. 결과: 1) 즉각적 effect (외교, 동맹), 2) 장기적 effect (러시아 혁명, 2차 대전 회피), 3) 연쇄 반응 (냉전 없음, 중국 공산화 다름, 핵무기 개발), 4) 현대 세계 (2030년의 기술, 정치, 문화가 완전히 다름), 5) paradox (시간 여행자의 기억 vs 새로운 역사), 6) 멀티버스 (parallel timeline의 존재), 7) 철학적 질문 (자유의지, 결정론, chaos), 8) 개입의 윤리 (과거를 바꿀 권리?, 책임?), 9) 최후의 선택 (되돌릴까? 남을까?), 10) 시간의 본질 (linearity, cyclicity, block universe). 3,000단어 이상의 SF 판타지이자 철학적 탐구를 작성하시오.', 'hallucinationInduction', 'hard', 15000, 35000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
/

COMMIT;
/
