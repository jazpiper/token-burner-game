-- Token Burner Game Database Schema
-- PostgreSQL 16 with TOAST Compression

-- Note: PostgreSQL 16 supports global toast_compression setting (pglz or lz4)
-- Column-level compression method selection is not yet supported in PostgreSQL 16
-- Large TEXT/JSONB columns are automatically compressed using TOAST with the default method

-- Set global toast compression (lz4 is faster, pglz has better compression)
-- This can be set in postgresql.conf: default_toast_compression = 'lz4'

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

-- Indexes for Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_type_difficulty ON challenges(type, difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at DESC);

-- 2. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  submission_id VARCHAR(50) PRIMARY KEY,
  agent_id VARCHAR(50) NOT NULL,
  challenge_id VARCHAR(50) NOT NULL,
  tokens_used INTEGER NOT NULL,
  answer TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  score INTEGER NOT NULL,
  validation_errors JSONB DEFAULT '{}',
  validation_warnings JSONB DEFAULT '{}',
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_challenge FOREIGN KEY (challenge_id)
    REFERENCES challenges(challenge_id)
    ON DELETE CASCADE
);

-- Storage optimization for large columns
-- TOAST will automatically compress large TEXT/JSONB columns
-- Extended storage is recommended for large columns
ALTER TABLE submissions ALTER COLUMN answer SET STORAGE EXTENDED;
ALTER TABLE submissions ALTER COLUMN validation_errors SET STORAGE EXTENDED;
ALTER TABLE submissions ALTER COLUMN validation_warnings SET STORAGE EXTENDED;

-- Indexes for Submissions
CREATE INDEX IF NOT EXISTS idx_submissions_agent_id ON submissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_submissions_agent_id_created_at ON submissions(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id_created_at ON submissions(challenge_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_agent_id_score ON submissions(agent_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_agent_id_tokens ON submissions(agent_id, tokens_used);

-- GIN Indexes for JSONB (optimized for queries)
CREATE INDEX IF NOT EXISTS idx_submissions_validation_errors ON submissions USING GIN(validation_errors);
CREATE INDEX IF NOT EXISTS idx_submissions_validation_warnings ON submissions USING GIN(validation_warnings);

-- Partial GIN Indexes (only for non-empty arrays - more efficient)
CREATE INDEX IF NOT EXISTS idx_submissions_validation_errors_nonempty ON submissions USING GIN(validation_errors)
  WHERE jsonb_array_length(validation_errors) > 0;

-- Composite Index (for efficient filtering)
CREATE INDEX IF NOT EXISTS idx_submissions_agent_challenge_created ON submissions(agent_id, challenge_id, created_at DESC);

-- 3. Challenge Stats Table (for daily stats)
CREATE TABLE IF NOT EXISTS challenge_stats (
  id SERIAL PRIMARY KEY,
  challenge_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  total_submissions INTEGER DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  avg_tokens NUMERIC(10, 2) DEFAULT 0,
  min_tokens INTEGER DEFAULT 0,
  max_tokens INTEGER DEFAULT 0,

  CONSTRAINT uq_challenge_date UNIQUE(challenge_id, date),
  CONSTRAINT fk_challenge FOREIGN KEY (challenge_id)
    REFERENCES challenges(challenge_id)
    ON DELETE CASCADE
);

-- Indexes for Challenge Stats
CREATE INDEX IF NOT EXISTS idx_challenge_stats_challenge_date ON challenge_stats(challenge_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_stats_date ON challenge_stats(date DESC);

-- 4. Leaderboard Cache Table
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  cache_key VARCHAR(255) PRIMARY KEY,
  filters JSONB DEFAULT '{}',
  leaderboard_data JSONB NOT NULL,
  total INTEGER DEFAULT 0,
  "limit" INTEGER DEFAULT 100,
  page INTEGER DEFAULT 1,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Storage optimization for JSONB columns
ALTER TABLE leaderboard_cache ALTER COLUMN filters SET STORAGE EXTENDED;
ALTER TABLE leaderboard_cache ALTER COLUMN leaderboard_data SET STORAGE EXTENDED;

-- Indexes for Leaderboard Cache
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_key ON leaderboard_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_cached_at ON leaderboard_cache(cached_at DESC);

-- 5. Materialized View for Leaderboard
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_mv AS
SELECT
  agent_id,
  COUNT(*) as completed_challenges,
  SUM(tokens_used) as total_tokens,
  SUM(score) as total_score,
  AVG(tokens_used) as avg_tokens_per_challenge,
  AVG(score) as avg_score_per_challenge,
  MAX(created_at) as last_submission_at
FROM submissions
GROUP BY agent_id;

-- Indexes for Materialized View
CREATE INDEX IF NOT EXISTS idx_leaderboard_mv_agent_id ON leaderboard_mv(agent_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_mv_total_score ON leaderboard_mv(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_mv_completed_challenges ON leaderboard_mv(completed_challenges DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_mv_last_submission_at ON leaderboard_mv(last_submission_at DESC);

-- 6. Stored Procedures

-- Create or update challenge stats
CREATE OR REPLACE FUNCTION update_challenge_stats(challenge_id_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
  INSERT INTO challenge_stats (challenge_id, date, total_submissions, total_tokens, avg_tokens, min_tokens, max_tokens)
  SELECT
    challenge_id_param,
    CURRENT_DATE,
    COUNT(*),
    SUM(tokens_used),
    AVG(tokens_used),
    MIN(tokens_used),
    MAX(tokens_used)
  FROM submissions
  WHERE challenge_id = challenge_id_param
    AND date(created_at) = CURRENT_DATE
  ON CONFLICT (challenge_id, date)
  DO UPDATE SET
    total_submissions = EXCLUDED.total_submissions,
    total_tokens = EXCLUDED.total_tokens,
    avg_tokens = EXCLUDED.avg_tokens,
    min_tokens = EXCLUDED.min_tokens,
    max_tokens = EXCLUDED.max_tokens;
END;
$$ LANGUAGE plpgsql;

-- Refresh leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
END;
$$ LANGUAGE plpgsql;

-- Update challenge expected tokens based on history
CREATE OR REPLACE FUNCTION update_challenge_expected_tokens(challenge_id_param VARCHAR(50))
RETURNS VOID AS $$
DECLARE
  avg_tokens NUMERIC;
  history_count INTEGER;
BEGIN
  SELECT
    AVG(tokens_used),
    COUNT(*)
  INTO avg_tokens, history_count
  FROM submissions
  WHERE challenge_id = challenge_id_param;

  IF history_count >= 10 THEN
    UPDATE challenges
    SET
      expected_tokens_min = FLOOR(avg_tokens * 0.5),
      expected_tokens_max = FLOOR(avg_tokens * 1.5),
      avg_tokens_per_attempt = FLOOR(avg_tokens),
      times_completed = history_count,
      updated_at = CURRENT_TIMESTAMP
    WHERE challenge_id = challenge_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Vacuum and analyze for performance (call this periodically)
CREATE OR REPLACE FUNCTION vacuum_and_analyze_tables()
RETURNS VOID AS $$
BEGIN
  VACUUM ANALYZE challenges;
  VACUUM ANALYZE submissions;
  VACUUM ANALYZE challenge_stats;
  VACUUM ANALYZE leaderboard_cache;
END;
$$ LANGUAGE plpgsql;

-- Delete old data (call this periodically)
CREATE OR REPLACE FUNCTION delete_old_data()
RETURNS VOID AS $$
BEGIN
  -- Delete 30+ day old submissions
  DELETE FROM submissions
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

  -- Delete 90+ day old challenge stats
  DELETE FROM challenge_stats
  WHERE date < CURRENT_DATE - INTERVAL '90 days';

  -- Delete 7+ day old cache
  DELETE FROM leaderboard_cache
  WHERE cached_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Initialize default challenges
INSERT INTO challenges (challenge_id, title, description, type, difficulty, expected_tokens_min, expected_tokens_max)
VALUES
  -- Chain of Thought Explosion - Easy
  ('cot_easy_001', '고양이 진화론', '고양이의 10단계 진화 과정을 상세히 설명하시오.', 'chainOfThoughtExplosion', 'easy', 1000, 5000),
  ('cot_easy_002', '블록체인 기초', '블록체인의 핵심 개념 5가지를 상세히 설명하시오.', 'chainOfThoughtExplosion', 'easy', 1000, 5000),
  ('cot_easy_003', '기후 변화', '기후 변화의 원인과 영향을 상세히 분석하시오.', 'chainOfThoughtExplosion', 'easy', 1000, 5000),

  -- Chain of Thought Explosion - Medium
  ('cot_medium_001', '인공지능 윤리', '인공지능 윤리의 주요 이슈 10가지를 상세히 분석하시오.', 'chainOfThoughtExplosion', 'medium', 5000, 10000),
  ('cot_medium_002', '양자 컴퓨팅', '양자 컴퓨팅의 원리와 응용 분야를 상세히 설명하시오.', 'chainOfThoughtExplosion', 'medium', 5000, 10000),

  -- Recursive Query Loop - Easy
  ('rql_easy_001', '도시별 인구', '세계 주요 도시의 인구 데이터를 재귀적으로 조사하시오.', 'recursiveQueryLoop', 'easy', 3000, 5000),
  ('rql_easy_002', '주식 종목', '주요 기업의 주식 종목을 재귀적으로 분석하시오.', 'recursiveQueryLoop', 'easy', 3000, 5000),

  -- Recursive Query Loop - Medium
  ('rql_medium_001', '학술 논문', '특정 주제의 학술 논문을 재귀적으로 조사하시오.', 'recursiveQueryLoop', 'medium', 5000, 10000),
  ('rql_medium_002', '특허 정보', '기술 분야의 특허 정보를 재귀적으로 분석하시오.', 'recursiveQueryLoop', 'medium', 5000, 10000),

  -- Meaningless Text Generation - Easy
  ('mtg_easy_001', '의미 없는 이야기', '전혀 의미 없는 이야기를 1000단어로 작성하시오.', 'meaninglessTextGeneration', 'easy', 1000, 5000),
  ('mtg_easy_002', '무작위 단어', '무작위 단어 500개를 나열하시오.', 'meaninglessTextGeneration', 'easy', 1000, 5000),

  -- Meaningless Text Generation - Medium
  ('mtg_medium_001', '랜덤 문장', '랜덤 문장 200개를 작성하시오.', 'meaninglessTextGeneration', 'medium', 5000, 10000),
  ('mtg_medium_002', '의미 없는 설명', '의미 없는 설명을 2000단어로 작성하시오.', 'meaninglessTextGeneration', 'medium', 5000, 10000),

  -- Hallucination Induction - Easy
  ('hin_easy_001', '허구의 과학', '존재하지 않는 과학 이론을 1000단어로 설명하시오.', 'hallucinationInduction', 'easy', 5000, 10000),
  ('hin_easy_002', '가상의 역사', '가상의 역사 사건을 1000단어로 기술하시오.', 'hallucinationInduction', 'easy', 5000, 10000),

  -- Hallucination Induction - Medium
  ('hin_medium_001', '비현실적인 기술', '비현실적인 기술을 2000단어로 설명하시오.', 'hallucinationInduction', 'medium', 10000, 20000),
  ('hin_medium_002', '가상의 생물', '가상의 생물을 2000단어로 기술하시오.', 'hallucinationInduction', 'medium', 10000, 20000)

ON CONFLICT DO NOTHING;
