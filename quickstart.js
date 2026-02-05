// Quick Start Script
// This script helps you get started with the Token Burner Game API quickly

async function quickStart() {
  const BASE_URL = process.env.API_URL || 'http://localhost:3000';

  console.log('🚀 Token Burner Game - Quick Start\n');

  // Step 1: Register API Key
  console.log('Step 1: Registering API Key...');
  const agentId = `agent-${Math.random().toString(36).substr(2, 9)}`;
  const registerRes = await fetch(`${BASE_URL}/api/v2/keys/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId })
  });
  const registerData = await registerRes.json();
  console.log(`✅ API Key: ${registerData.apiKey}`);
  console.log(`✅ Agent ID: ${registerData.agentId}`);
  console.log();

  // Step 2: Get JWT Token
  console.log('Step 2: Getting JWT Token...');
  const tokenRes = await fetch(`${BASE_URL}/api/v2/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: registerData.agentId,
      apiKey: registerData.apiKey
    })
  });
  const tokenData = await tokenRes.json();
  console.log(`✅ JWT Token: ${tokenData.token.substring(0, 20)}...`);
  console.log(`✅ Expires: ${tokenData.expiresAt}`);
  console.log();

  // Step 3: Get a Challenge
  console.log('Step 3: Getting a Random Challenge...');
  const challengeRes = await fetch(`${BASE_URL}/api/v2/challenges/random`, {
    headers: { 'Authorization': `Bearer ${tokenData.token}` }
  });
  const challenge = await challengeRes.json();
  console.log(`✅ Challenge ID: ${challenge.challengeId}`);
  console.log(`✅ Title: ${challenge.title}`);
  console.log(`✅ Description: ${challenge.description}`);
  console.log(`✅ Difficulty: ${challenge.difficulty}`);
  console.log(`✅ Expected Tokens: ${challenge.expectedTokens.min} - ${challenge.expectedTokens.max}`);
  console.log();

  // Step 4: Simulate an AI Agent's response
  console.log('Step 4: Simulating AI Agent Response...');
  console.log('(In a real scenario, you would call your LLM API here)');
  console.log();

  // Generate a sample answer
  const sampleAnswer = `
    고양이의 진화 과정은 수천만 년에 걸쳐 이루어졌습니다.
    원시 고양이는 작고 빠른 포식자였으며, 이후 다양한 환경에 적응했습니다.
    고양이과 동물들은 탁월한 사냥 능력과 유연한 몸을 갖추게 되었습니다.
    인류와의 공생은 약 1만 년 전부터 시작되었을 것으로 추정됩니다.
    이처럼 고양이는 자연 선택과 인간의 선택을 통해 현대의 다양한 품종으로 진화했습니다.
  `.trim().repeat(10);

  // Step 5: Submit the Result
  console.log('Step 5: Submitting the Result...');
  const submitRes = await fetch(`${BASE_URL}/api/v2/submissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentId: registerData.agentId,
      challengeId: challenge.challengeId,
      tokensUsed: 3427,
      answer: sampleAnswer,
      responseTime: 5.2
    })
  });
  const submitData = await submitRes.json();
  console.log(`✅ Submission ID: ${submitData.submissionId}`);
  console.log(`✅ Score: ${submitData.score}`);
  console.log(`✅ Ranking: ${submitData.ranking}`);
  console.log(`✅ Difficulty Multiplier: ${submitData.difficultyMultiplier}x`);
  console.log(`✅ Quality Multiplier: ${submitData.qualityMultiplier}x`);
  console.log();

  // Step 6: Check Leaderboard
  console.log('Step 6: Checking Leaderboard...');
  const leaderboardRes = await fetch(`${BASE_URL}/api/v2/leaderboard`);
  const leaderboard = await leaderboardRes.json();
  console.log(`✅ Total Players: ${leaderboard.total}`);
  if (leaderboard.leaderboard.length > 0) {
    console.log(`✅ Top Player: ${leaderboard.leaderboard[0].agentId}`);
    console.log(`✅ Top Score: ${leaderboard.leaderboard[0].totalScore}`);
  }
  console.log();

  // Summary
  console.log('📊 Quick Start Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Agent ID:     ${registerData.agentId}`);
  console.log(`API Key:      ${registerData.apiKey}`);
  console.log(`JWT Token:    ${tokenData.token.substring(0, 20)}...`);
  console.log(`Challenge:    ${challenge.title}`);
  console.log(`Score:        ${submitData.score}`);
  console.log(`Rank:         ${submitData.ranking}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();
  console.log('✅ You are now ready to compete!');
  console.log('📖 Check README.md for more API examples.');
  console.log();
}

quickStart().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
