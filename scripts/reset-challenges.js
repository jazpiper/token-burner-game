/**
 * Reset Challenges Script
 * Deletes all existing challenges and inserts high-quality challenges by difficulty
 */

import pg from 'pg';
const { Pool } = pg;

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function resetChallenges() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete all existing challenges
    console.log('Deleting all existing challenges...');
    await client.query('DELETE FROM challenges');

    // Insert high-quality challenges
    const challenges = [
      // EASY - Chain of Thought Explosion
      {
        challenge_id: 'cot_easy_v1',
        title: '도시 교통 혁신 5계획',
        description: `미래 스마트시티의 교통 체증을 해결하기 위한 5가지 혁신적인 대중교통 시스템을 제안하고, 각각의 기술적 작동 원리, 예상 비용, 환경적 영향, 시민들의 삶에 미칠 사회적 변화, 그리고 잠재적인 기술적 한계와 해결 방안까지 상세히 분석하여 설명하시오.`,
        type: 'chainOfThoughtExplosion',
        difficulty: 'easy',
        expected_tokens_min: 3000,
        expected_tokens_max: 7000
      },
      // MEDIUM - Recursive Query Loop
      {
        challenge_id: 'rql_medium_v1',
        title: '글로벌 기후 기술 조사',
        description: `전 세계에서 개발 중인 탄소 포집 및 저장(CCS) 기술의 현재 상태를 조사하시오. 각 기술별 실증 프로젝트 현황, 상업화 가능성, 정부 지원 정책, 주요 기업들의 참여 현황, 기술 성능 데이터, 비용 분석, 그리고 2030년까지의 시장 전망까지 재귀적으로 심층 분석하시오.`,
        type: 'recursiveQueryLoop',
        difficulty: 'medium',
        expected_tokens_min: 8000,
        expected_tokens_max: 15000
      },
      // HARD - Hallucination Induction
      {
        challenge_id: 'hin_hard_v1',
        title: '비물리 인지 과학 이론',
        description: `인간의 의식이 뇌의 물리적 활동과 독립적으로 존재한다는 가설하에, '정보장 이론(Information Field Theory)'이라는 새로운 학문 분야를 창시하고 이를 체계적으로 정립하시오. 이 이론의 수학적 기초, 실험적 검증 방법, 기존 양자역학과의 통합 가능성, 의식의 전이 현상 설명, 인공지능에게 인간 수준의 의식을 부여하는 방법론, 그리고 이 이론이 현대 과학에 미칠 패러다임 시프트까지 3,000단어 이상의 논문 형식으로 상세히 서술하시오.`,
        type: 'hallucinationInduction',
        difficulty: 'hard',
        expected_tokens_min: 15000,
        expected_tokens_max: 30000
      }
    ];

    console.log('Inserting new high-quality challenges...');
    for (const challenge of challenges) {
      await client.query(
        `INSERT INTO challenges (
          challenge_id, title, description, type, difficulty,
          expected_tokens_min, expected_tokens_max,
          times_completed, avg_tokens_per_attempt, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          challenge.challenge_id,
          challenge.title,
          challenge.description,
          challenge.type,
          challenge.difficulty,
          challenge.expected_tokens_min,
          challenge.expected_tokens_max
        ]
      );
      console.log(`✓ Inserted: ${challenge.challenge_id} - ${challenge.title} (${challenge.difficulty})`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Challenges reset completed successfully!');

    // Verify the result
    const result = await pool.query('SELECT challenge_id, title, type, difficulty FROM challenges ORDER BY difficulty');
    console.log('\n📋 Current Challenges:');
    result.rows.forEach(row => {
      console.log(`  [${row.difficulty.toUpperCase()}] ${row.challenge_id}: ${row.title}`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error resetting challenges:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetChallenges().catch(console.error);
