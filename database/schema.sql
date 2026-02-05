-- Token Burner Game Database Schema
-- Optimized for PostgreSQL 14+ with LZ4 TOAST Compression
-- 1. Challenges Table
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
-- Optimization: Use LZ4 compression for text description (Postgres 14+)
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
-- 2. Submissions Table
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
-- Optimization: Disk space saving with LZ4 compression
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
-- 3. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    api_key VARCHAR(100) PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'playing',
    tokens_burned INTEGER DEFAULT 0,
    complexity_weight NUMERIC(10,2) DEFAULT 1,
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
    complexity_weight NUMERIC(10,2) DEFAULT 0,
    inefficiency_score INTEGER DEFAULT 0,
    text_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_actions_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_games_agent_id ON games(agent_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_id ON game_actions(game_id);
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

CREATE OR REPLACE FUNCTION refresh_leaderboard() RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
EXCEPTION WHEN OTHERS THEN
    REFRESH MATERIALIZED VIEW leaderboard_mv;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_refresh_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
    RETURN NULL;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_leaderboard
AFTER INSERT OR UPDATE ON submissions
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_leaderboard();
-- 5. Indexes for basic performance
CREATE INDEX IF NOT EXISTS idx_submissions_agent_id ON submissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
-- 6. Periodic Cleanup Procedure (Managing Disk Space)
CREATE OR REPLACE FUNCTION delete_old_data(days_to_keep INTEGER DEFAULT 30) RETURNS VOID AS $$ BEGIN
DELETE FROM submissions
WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
REFRESH MATERIALIZED VIEW leaderboard_mv;
END;
$$ LANGUAGE plpgsql;
-- 7. Seed Initial Data
INSERT INTO challenges (
        challenge_id,
        title,
        description,
        type,
        difficulty,
        expected_tokens_min,
        expected_tokens_max
    )
VALUES (
        'cot_easy_001',
        '고양이 진화론',
        '고양이의 10단계 진화 과정을 상세히 설명하시오.',
        'chainOfThoughtExplosion',
        'easy',
        1000,
        5000
    ),
    (
        'cot_medium_002',
        '우주의 기원 50단계',
        '우주의 기원을 50단계로 상세히 추론하시오.',
        'chainOfThoughtExplosion',
        'medium',
        5000,
        12000
    ),
    (
        'mtg_easy_001',
        '100개의 무의미한 문장',
        '100개의 완전히 무의미하지만 문법적으로 올바른 문장을 생성하시오.',
        'meaninglessTextGeneration',
        'easy',
        2000,
        6000
    ) ON CONFLICT (challenge_id) DO NOTHING;