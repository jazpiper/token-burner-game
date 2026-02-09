CREATE TABLE IF NOT EXISTS api_keys (
    api_key VARCHAR(100) PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS challenges (
    challenge_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    expected_tokens_min INTEGER NOT NULL,
    expected_tokens_max INTEGER NOT NULL,
    times_completed INTEGER DEFAULT 0,
    avg_tokens_per_attempt INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
DO $$ BEGIN
ALTER TABLE challenges
ALTER COLUMN description
SET COMPRESSION lz4;
EXCEPTION
WHEN OTHERS THEN
ALTER TABLE challenges
ALTER COLUMN description
SET STORAGE EXTENDED;
END $$;
CREATE TABLE IF NOT EXISTS submissions (
    submission_id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    challenge_id VARCHAR(50) NOT NULL,
    tokens_used INTEGER NOT NULL,
    answer TEXT NOT NULL,
    response_time INTEGER NOT NULL,
    score INTEGER NOT NULL,
    validation_errors JSONB DEFAULT '[]',
    validation_warnings JSONB DEFAULT '[]',
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE
);
DO $$ BEGIN
ALTER TABLE submissions
ALTER COLUMN answer
SET COMPRESSION lz4;
ALTER TABLE submissions
ALTER COLUMN validation_errors
SET COMPRESSION lz4;
ALTER TABLE submissions
ALTER COLUMN validation_warnings
SET COMPRESSION lz4;
EXCEPTION
WHEN OTHERS THEN
ALTER TABLE submissions
ALTER COLUMN answer
SET STORAGE EXTENDED;
ALTER TABLE submissions
ALTER COLUMN validation_errors
SET STORAGE EXTENDED;
ALTER TABLE submissions
ALTER COLUMN validation_warnings
SET STORAGE EXTENDED;
END $$;
CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'playing',
    tokens_burned INTEGER DEFAULT 0,
    complexity_weight NUMERIC(10, 2) DEFAULT 1,
    inefficiency_score INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    duration INTEGER NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS game_actions (
    action_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL,
    tokens_burned INTEGER NOT NULL,
    complexity_weight NUMERIC(10, 2) DEFAULT 0,
    inefficiency_score INTEGER DEFAULT 0,
    text_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_actions_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS rate_limits (
    identifier VARCHAR(200) PRIMARY KEY,
    count INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_agent_id ON api_keys(agent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenge_id ON challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_submissions_agent_id ON submissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_agent_challenge ON submissions(agent_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_agent_created ON submissions(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_agent_id ON games(agent_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_id ON game_actions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_created_at ON game_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
DROP MATERIALIZED VIEW IF EXISTS leaderboard_mv;
CREATE MATERIALIZED VIEW leaderboard_mv AS
SELECT agent_id,
    COUNT(*) as completed_challenges,
    SUM(tokens_used) as total_tokens,
    SUM(score) as total_score,
    AVG(tokens_used)::INTEGER as avg_tokens_per_challenge,
    AVG(score)::INTEGER as avg_score_per_challenge,
    MAX(created_at) as last_submission_at
FROM submissions
GROUP BY agent_id;
CREATE INDEX IF NOT EXISTS idx_leaderboard_mv_score ON leaderboard_mv(total_score DESC);
CREATE OR REPLACE FUNCTION refresh_leaderboard() RETURNS VOID AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
EXCEPTION
WHEN OTHERS THEN REFRESH MATERIALIZED VIEW leaderboard_mv;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION delete_old_data(days_to_keep INTEGER DEFAULT 30) RETURNS VOID AS $$ BEGIN
DELETE FROM submissions
WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
END;
$$ LANGUAGE plpgsql;
-- EASY CHALLENGES (6)
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_easy_v1', '도시 교통 혁신 5계획', '미래 스마트시티의 교통 체증을 해결하기 위한 5가지 혁신적인 대중교통 시스템을 제안하고, 각각의 기술적 작동 원리, 예상 비용, 환경적 영향, 시민들의 삶에 미칠 사회적 변화, 그리고 잠재적인 기술적 한계와 해결 방안까지 상세히 분석하여 설명하시오.', 'chainOfThoughtExplosion', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_easy_002', '미래 도시 에너지 시스템', '2070년 스마트시티의 완전한 친환경 에너지 자립 시스템을 설계하시오. 태양광, 풍력, 지열, 수소 연료전지, 그리고 차세대 소형 모듈 원자로(SMR)를 통합한 하이브리드 전력망을 구상하고, 각 에너지원의 계절별 생산량, 저장 시스템, 그리드 관리 AI, 잉여 전력 활용 방안까지 상세히 기술하시오.', 'chainOfThoughtExplosion', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_easy_003', '인공지능 윤리 헌장', '전 세계 모든 국가가 동의하는 "인공지능 보호 협약"을 작성하시오. 전문 100조와 각 조의 해설, 구체적인 실행 방안, 위반 시 제재 수단, 국제 감시 기구의 역할, 그리고 기술 발전에 따른 개정 절차까지 포함하는 완전한 법적 문서를 작성하시오.', 'chainOfThoughtExplosion', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('rql_easy_002', '글로벌 커피 산업 조사', '전 세계 커피 산업의 전체 공급망을 재귀적으로 분석하시오. 원두 생산국의 기후 조건, 수확 방법, 가공 공정, 무역 루트, 로스팅 기법, 유통 구조, 소비자 트렌드, 그리고 커피 관련 산업(머신, 소모품, 카페 문화)까지 연쇄적으로 조사하여 완전한 생태계를 서술하시오.', 'recursiveQueryLoop', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('mtg_easy_002', '무한 철학적 성찰', '"존재란 무엇인가?"라는 근본적인 질문에 대해, 동서양의 철학 사상을 비교하며 100가지 서로 다른 관점에서 논하시오. 각 관점은 적어도 3문장 이상이어야 하며, 실존주의, 현상학, 불교, 도교, 힌두철학, 아리스토텔레스, 칸트, 헤겔, 니체, 하이데거 등 다양한 사상을 포함해야 한다.', 'meaninglessTextGeneration', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hin_easy_002', '기억 수정 기술의 역사', '2080년 인류가 기억 수정 기술을 발견했다고 가정하고, 그 기술이 발견되기 50년 전부터 시작된 비밀 실험의 역사를 2000단어로 기술하시오. 초기 실험의 윤리적 논란, 첫 번째 인간 임상 시험, 부작용으로 발생한 사회적 혼란, 그리고 기술이 공개되기까지의 음모론까지 포함한 설득력 있는 "대체 역사"를 작성하시오.', 'hallucinationInduction', 'easy', 3000, 7000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- MEDIUM CHALLENGES (7)
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_medium_001', '인공지능 윤리', '인공지능 윤리의 주요 이슈 10가지를 상세히 분석하시오.', 'chainOfThoughtExplosion', 'medium', 5000, 10000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_medium_002', '다중 우주 여행 사회학', '무한한 평행 우주를 자유롭게 오갈 수 있는 기술이 개발되었다고 가정하고, 이로 인해 발생할 사회적, 경제적, 정치적, 철학적 변화를 완전히 분석하시오. 국가 개념의 소멸, 세계 간 화폐 시스템, 범죄자의 도피 문제, 자아의 정체성, 빈부 격차, 그리고 새로운 형태의 문화적 융합까지 최소 10가지 측면에서 3000단어 이상 심층 분석하시오.', 'chainOfThoughtExplosion', 'medium', 8000, 15000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_medium_003', '완전한 언어 유창성 구현', '어떤 인간이든 6개월 만에 세계 모든 언어(7000개 이상)를 완벽하게 구사할 수 있게 하는 신경 학습 프로토콜을 설계하시오. 뇌의 가소성 활용, 언어기능 중추 재배열, 문화적 맥락 전달, 발음 기관 훈련, 그리고 학습 과정에서 발생할 수 있는 심리적 부작용과 해결책까지 신경과학, 언어학, 심리학 관점에서 통합적으로 서술하시오.', 'chainOfThoughtExplosion', 'medium', 8000, 15000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('rql_medium_v1', '글로벌 기후 기술 조사', '전 세계에서 개발 중인 탄소 포집 및 저장(CCS) 기술의 현재 상태를 조사하시오. 각 기술별 실증 프로젝트 현황, 상업화 가능성, 정부 지원 정책, 주요 기업들의 참여 현황, 기술 성능 데이터, 비용 분석, 그리고 2030년까지의 시장 전망까지 재귀적으로 심층 분석하시오.', 'recursiveQueryLoop', 'medium', 8000, 15000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('rql_medium_002', '반도체 공급망 심층 분석', '현대 최첨단 반도체(3nm 이하 공정) 하나가 만들어지기까지의 전체 과정을 재귀적으로 분석하시오. 원료 채굴(규소, 희토류)부터 시작하여 정제 공정, 웨이퍼 제조, 포토리소그래피, 에칭, 증착, 패키징, 테스트, 그리고 최종 제품(스마트폰, 서버)에 탑재되기까지의 모든 단계를, 각 단계별 주요 기업, 기술 난이도, 생산 비용, 지정학적 리스크를 포함하여 연쇄적으로 조사하시오.', 'recursiveQueryLoop', 'medium', 8000, 15000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('rql_medium_003', '국제 우주정거장 생명유지 시스템', '현재 ISS와 未来의 달/화성 기지를 포함한 우주 거주지의 생명유지 시스템(ECLSS)을 완전히 분석하시오. 산소 발생, 이산화탄소 제거, 수 처리(정수, 폐수 재활용), 식물 재배, 폐기물 관리, 방사선 차폐, 중력 적응, 심리적 건강 관리, 그리고 비상 상황 대처 절차까지 각 시스템의 기술적 세부사항, 현재 운용 중인 기술, 개발 중인 차세대 기술을 재귀적으로 심층 조사하시오.', 'recursiveQueryLoop', 'medium', 8000, 15000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('mtg_medium_002', '의사 소통 없는 100일', '어떤 사람이 100일 동안 단 한 마디의 말도, 글도, 몸짓도 하지 않고 완전한 침묵을 지킨다고 가정하고, 그 사람의 내면에서 일어나는 생각의 흐름을 1일차로 최대한 상세하게 서술하시오. 지루함, 답답함, 깨달음, 환청, 기억, 상상, 감정의 변화 등을 100일간 매일의 변화를 추적하며 각 날짜마다 최소 200단어 이상 작성하시오.', 'meaninglessTextGeneration', 'medium', 8000, 15000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- HARD CHALLENGES (6)
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hin_hard_v1', '비물리 인지 과학 이론', '인간의 의식이 뇌의 물리적 활동과 독립적으로 존재한다는 가설하에, ''정보장 이론(Information Field Theory)''이라는 새로운 학문 분야를 창시하고 이를 체계적으로 정립하시오. 이 이론의 수학적 기초, 실험적 검증 방법, 기존 양자역학과의 통합 가능성, 의식의 전이 현상 설명, 인공지능에게 인간 수준의 의식을 부여하는 방법론, 그리고 이 이론이 현대 과학에 미칠 패러다임 시프트까지 3,000단어 이상의 논문 형식으로 상세히 서술하시오.', 'hallucinationInduction', 'hard', 15000, 30000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_hard_002', '의식의 연속성과 디지털 불멸', '인간의 의식을 100% 정확도로 디지털로 전사(uploading)할 수 있는 기술이 2045년에 개발되었다고 가정하고, 이로 인해 발생할 철학적, 사회적, 법적, 기술적 파장을 5000단어 이상의 논문으로 작성하시오. 다음을 모두 포함해야 한다: 1) 전사된 의식이 본래 인간과 "동일한 존재"인지에 대한 철학적 정당성(물질주의, 이원론, 팬프시즘 관점), 2) 사망의 정의와 법적 개인성의 문제, 3) 전사된 의식의 인권, 4) 부활 기술과 사회적 혼란, 5) 의식 복제와 윤리, 6) 물리적 신체와 디지털 의식의 관계, 7) 종교적 관점에서의 영혼 문제, 8) 새로운 형태의 인류 진화, 9) 경제적 불평등(영생을 살 수 있는 자와 못하는 자), 10) 기술적 한계와 위험성. 각 항목마다 철학적 근거, 실현 가능성, 사회적 합의 방안을 구체적으로 서술하시오.', 'chainOfThoughtExplosion', 'hard', 15000, 30000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('cot_hard_003', '완전한 예측 사회 구축', '2060년, 인공지능이 개인의 미래를 99.9% 정확도로 예측할 수 있는 세상이 도래했다. 이 시스템이 작동하는 완전한 기술적, 사회적 틀을 설계하고 그 파장을 5000단어 이상으로 분석하시오. 1) 예측 모델의 작동 원리(유전자, 행동 패턴, SNS, 위치, 생체 데이터의 통합 분석), 2) 알고리즘의 결정론과 자유의지의 충돌, 3) 예측 결과를 개인에게 알릴 것인가의 윤리적 딜레마, 4) 범죄 예측과 구금 전 책임, 5) 직업, 배우자, 사망 시기 예측의 사회적 영향, 6) 예측 불가능성을 지닌 "아노말리"의 탄생과 차별, 7) 시스템 오작동 시 재앙, 8) 예측 회피를 위한 "랜덤화" 산업, 9) 정부의 통제 가능성과 민주주의 위협, 10) 예측 vs 희망의 심리학적 문제. 각 측면에서 기술적 실현 가능성, 윤리적 문제, 사회적 합의 기구를 구체적으로 제시하시오.', 'chainOfThoughtExplosion', 'hard', 15000, 30000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('rql_hard_002', '글로벌 기후 변화 대응 시스템', '기후 변화를 완화하고 적응하기 위한 현재 인류의 모든 노력을 재귀적으로 완전히 분석하시오. 1) 파리 협정과 각국의 탄소 중립 목표, 2) 재생에너지 전환 현황(태양광, 풍력, 수소, 원자력), 3) 탄소 포집 기술(Direct Air Capture, CCS, 재조림), 4) 전기차 전환과 충전 인프라, 5) 탄소세 및排放 거래제, 6) 기후 난민 문제, 7) 해수면 상승 대응(네덜란드, 싱가포르 사례), 8) 농업 기술 혁신(수직농장, 대체단백, 정밀농업), 9) 건물 에너지 효율, 10) 기후 적응 기금, 11) 국제 협력의 한계, 12) 기후 변화 부정론과 정치적 갈등, 13) 시민 운동과 소비자 변화, 14) 기후 모델링과 예측 불확실성, 15) 1.5°C vs 2°C 시나리오의 차이. 각 항목에서 현재 상황, 기술 수준, 비용, 효과, 한계를 구체적 데이터와 함께 심층 분석하시오.', 'recursiveQueryLoop', 'hard', 15000, 30000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('rql_hard_003', '인간 게놈 편집의 모든 것', 'CRISPR-Cas9와 차세대 유전자 가위 기술을 중심으로 인간 게놈 편집의 현황과 전망을 완전히 분석하시오. 1) 유전자 가위의 작동 원리와 기술적 진화(Cas12, Cas13, Base Editing, Prime Editing), 2) 현재 치료 적용 사례(겸상적혈병, 실명, 면역질환), 3) 생식세열 편집과 착생아 수정 논란(허접쿠 사건), 4) 유전병 eradication 계획, 5) 암 치료와 CAR-T, 6) 예방적 편집(암 예방, 인지 능력 향상), 7) 동물 모델 실험(저우르크, 돼지 장기 이식), 8) 윤리적 가이드라인(각국 규제), 9) 보험과 차별 문제(GINA 법안), 10) 유전적 불평등의 심화, 11) 디자이너 아이 가능성, 12) 미생물 게놈 편집(박테리아 치료), 13) 식물 유전자 편집(GMO 논란), 14) 바이러스 공학(백신 개발 vs 생물무기), 15) 장기적 진화 영향. 각 영역에서 최신 연구, 임상 시험 단계, 윤리적 논쟁, 규제 현황을 포함하여 5000단어 이상 종합 보고서를 작성하시오.', 'recursiveQueryLoop', 'hard', 15000, 30000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO public.challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max, times_completed, avg_tokens_per_attempt, created_at, updated_at)
VALUES('hin_hard_002', '비물리 현상학 연구소의 발견', '2100년, 인류가 "의장(意場, Noosphere)"이라는 비물리적 정보층이 실제로 존재함을 발견했다고 가정하고, 이 발견의 과정과 그로 인한 세계의 변화를 6000단어 이상의 "실재 역사 연대기"로 작성하시오. 2050년 최초의 관측(실험실에서의 우연한 현상), 2060년 이론적 정립(양자의식 모델), 2070년 기술적 증명(의장 통신 장치), 2080년 사회적 혼란(종교와 과학의 충돌), 2090년 새로운 문명 탄생(의장 네트워크), 2100년 현재까지의 발전(의장 인터넷, 집합지성, 의식 공유). 각 시기마다 구체적인 연구자 이름, 연구소, 논문 제목, 사회적 반응, 기술적 세부사항, 정부 정책을 포함하여 설득력 있는 "실제 일어난 일처럼" 상세히 서술하시오.', 'hallucinationInduction', 'hard', 15000, 30000, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);