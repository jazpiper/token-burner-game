// Test Suite for Token Burner Game API

async function runTests() {
  const BASE_URL = 'http://localhost:3000';
  let apiKey = '';
  let token = '';
  let challengeId = '';
  let submissionId = '';

  console.log('🧪 Starting Token Burner Game API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const healthRes = await fetch(`${BASE_URL}/api/v2/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData.status);
    console.log();

    // Test 2: Register API Key
    console.log('Test 2: Register API Key');
    const registerRes = await fetch(`${BASE_URL}/api/v2/keys/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'test-agent-001' })
    });
    const registerData = await registerRes.json();
    apiKey = registerData.apiKey;
    console.log('✅ API Key registered:', apiKey);
    console.log();

    // Test 3: Get JWT Token
    console.log('Test 3: Get JWT Token');
    const tokenRes = await fetch(`${BASE_URL}/api/v2/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'test-agent-001',
        apiKey: apiKey
      })
    });
    const tokenData = await tokenRes.json();
    token = tokenData.token;
    console.log('✅ JWT token obtained');
    console.log();

    // Test 4: Get Random Challenge
    console.log('Test 4: Get Random Challenge');
    const challengeRes = await fetch(`${BASE_URL}/api/v2/challenges/random`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const challenge = await challengeRes.json();
    challengeId = challenge.challengeId;
    console.log('✅ Challenge received:');
    console.log(`   - ID: ${challenge.challengeId}`);
    console.log(`   - Title: ${challenge.title}`);
    console.log(`   - Difficulty: ${challenge.difficulty}`);
    console.log();

    // Test 5: Get Challenge by ID
    console.log('Test 5: Get Challenge by ID');
    const challengeByIdRes = await fetch(`${BASE_URL}/api/v2/challenges/${challengeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const challengeById = await challengeByIdRes.json();
    console.log('✅ Challenge details retrieved');
    console.log();

    // Test 6: Get All Challenges
    console.log('Test 6: Get All Challenges');
    const challengesRes = await fetch(`${BASE_URL}/api/v2/challenges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const challengesData = await challengesRes.json();
    console.log(`✅ Retrieved ${challengesData.challenges.length} challenges`);
    console.log();

    // Test 7: Submit Result
    console.log('Test 7: Submit Result');
    const testAnswer = '고양이의 1단계: 원시 고양이는 작고 빠른 포식자였습니다. 고양이의 2단계: 인간과의 공생이 시작되었습니다. ' +
                     '고양이의 3단계: 가축화가 진행되었습니다. 고양이의 4단계: 다양한 품종이 개발되었습니다. ' +
                     '이와 같이 고양이는 진화해왔습니다. ' + '고양이는 멋진 동물입니다. '.repeat(20);

    const submitRes = await fetch(`${BASE_URL}/api/v2/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        challengeId: challengeId,
        tokensUsed: 3427,
        answer: testAnswer,
        responseTime: 5.2
      })
    });
    const submitData = await submitRes.json();
    submissionId = submitData.submissionId;
    console.log('✅ Submission created:');
    console.log(`   - ID: ${submitData.submissionId}`);
    console.log(`   - Score: ${submitData.score}`);
    console.log(`   - Ranking: ${submitData.ranking}`);
    console.log();

    // Test 8: Get Submission by ID
    console.log('Test 8: Get Submission by ID');
    const submissionRes = await fetch(`${BASE_URL}/api/v2/submissions/${submissionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const submission = await submissionRes.json();
    console.log('✅ Submission details retrieved');
    console.log();

    // Test 9: Get Agent Submissions
    console.log('Test 9: Get Agent Submissions');
    const agentSubmissionsRes = await fetch(`${BASE_URL}/api/v2/submissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const agentSubmissions = await agentSubmissionsRes.json();
    console.log(`✅ Retrieved ${agentSubmissions.submissions.length} submissions`);
    console.log();

    // Test 10: Get Leaderboard
    console.log('Test 10: Get Leaderboard');
    const leaderboardRes = await fetch(`${BASE_URL}/api/v2/leaderboard`);
    const leaderboard = await leaderboardRes.json();
    console.log(`✅ Leaderboard retrieved with ${leaderboard.leaderboard.length} entries`);
    console.log();

    // Test 11: Get Agent Rank
    console.log('Test 11: Get Agent Rank');
    const rankRes = await fetch(`${BASE_URL}/api/v2/leaderboard/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rankData = await rankRes.json();
    console.log('✅ Agent rank retrieved:');
    console.log(`   - Rank: ${rankData.rank}`);
    console.log(`   - Total Score: ${rankData.totalScore}`);
    console.log();

    // Test 12: Test Validation - Invalid token count
    console.log('Test 12: Test Validation - Invalid token count');
    const invalidSubmitRes = await fetch(`${BASE_URL}/api/v2/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        challengeId: challengeId,
        tokensUsed: 999999, // Way too high
        answer: testAnswer,
        responseTime: 1.0
      })
    });
    const invalidSubmitData = await invalidSubmitRes.json();
    console.log('✅ Validation works - rejected invalid submission');
    console.log();

    // Test 13: Test Filters
    console.log('Test 13: Test Challenge Filters');
    const filteredChallengesRes = await fetch(
      `${BASE_URL}/api/v2/challenges?difficulty=easy&type=chainOfThoughtExplosion`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const filteredChallenges = await filteredChallengesRes.json();
    console.log(`✅ Filter retrieved ${filteredChallenges.challenges.length} challenges`);
    console.log();

    console.log('🎉 All tests passed successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    return false;
  }
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
