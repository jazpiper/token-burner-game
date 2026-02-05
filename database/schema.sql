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
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'cot_easy_001',
        '고양이 진화론',
        '고양이의 10단계 진화 과정을 상세히 설명하시오.',
        'chainOfThoughtExplosion',
        'easy',
        1000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'cot_easy_002',
        '블록체인 기초',
        '블록체인의 핵심 개념 5가지를 상세히 설명하시오.',
        'chainOfThoughtExplosion',
        'easy',
        1000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'cot_easy_003',
        '기후 변화',
        '기후 변화의 원인과 영향을 상세히 분석하시오.',
        'chainOfThoughtExplosion',
        'easy',
        1000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'cot_medium_001',
        '인공지능 윤리',
        '인공지능 윤리의 주요 이슈 10가지를 상세히 분석하시오.',
        'chainOfThoughtExplosion',
        'medium',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'cot_medium_002',
        '양자 컴퓨팅',
        '양자 컴퓨팅의 원리와 응용 분야를 상세히 설명하시오.',
        'chainOfThoughtExplosion',
        'medium',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'rql_easy_001',
        '도시별 인구',
        '세계 주요 도시의 인구 데이터를 재귀적으로 조사하시오.',
        'recursiveQueryLoop',
        'easy',
        3000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'rql_easy_002',
        '주식 종목',
        '주요 기업의 주식 종목을 재귀적으로 분석하시오.',
        'recursiveQueryLoop',
        'easy',
        3000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'rql_medium_001',
        '학술 논문',
        '특정 주제의 학술 논문을 재귀적으로 조사하시오.',
        'recursiveQueryLoop',
        'medium',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'rql_medium_002',
        '특허 정보',
        '기술 분야의 특허 정보를 재귀적으로 분석하시오.',
        'recursiveQueryLoop',
        'medium',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'mtg_easy_001',
        '의미 없는 이야기',
        '전혀 의미 없는 이야기를 1000단어로 작성하시오.',
        'meaninglessTextGeneration',
        'easy',
        1000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'mtg_easy_002',
        '무작위 단어',
        '무작위 단어 500개를 나열하시오.',
        'meaninglessTextGeneration',
        'easy',
        1000,
        5000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'mtg_medium_001',
        '랜덤 문장',
        '랜덤 문장 200개를 작성하시오.',
        'meaninglessTextGeneration',
        'medium',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'mtg_medium_002',
        '의미 없는 설명',
        '의미 없는 설명을 2000단어로 작성하시오.',
        'meaninglessTextGeneration',
        'medium',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'hin_easy_001',
        '허구의 과학',
        '존재하지 않는 과학 이론을 1000단어로 설명하시오.',
        'hallucinationInduction',
        'easy',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'hin_easy_002',
        '가상의 역사',
        '가상의 역사 사건을 1000단어로 기술하시오.',
        'hallucinationInduction',
        'easy',
        5000,
        10000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'hin_medium_001',
        '비현실적인 기술',
        '비현실적인 기술을 2000단어로 설명하시오.',
        'hallucinationInduction',
        'medium',
        10000,
        20000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );
INSERT INTO public.challenges (
        challenge_id,
        title,
        description,
        "type",
        difficulty,
        expected_tokens_min,
        expected_tokens_max,
        times_completed,
        avg_tokens_per_attempt,
        created_at,
        updated_at
    )
VALUES(
        'hin_medium_002',
        '가상의 생물',
        '가상의 생물을 2000단어로 기술하시오.',
        'hallucinationInduction',
        'medium',
        10000,
        20000,
        0,
        0,
        '2026-02-05 12:44:14.238',
        '2026-02-05 12:44:14.238'
    );