import keysHandler from '../api/v2/keys.js';
import authHandler from '../api/v2/auth.js';
import challengesHandler from '../api/v2/challenges.js';
import submissionsHandler from '../api/v2/submissions.js';
import gamesHandler from '../api/v2/games.js';
import actionsHandler from '../api/v2/actions.js';
import leaderboardHandler from '../api/v2/leaderboard.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';

function generateJWT(agentId) {
  return jwt.sign(
    { agentId, exp: Math.floor(Date.now() / 1000) + (60 * 60) },
    JWT_SECRET
  );
}

function mockRequest(method, url, body = null, token = null) {
  const req = {
    method,
    url,
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
      'x-api-key': 'test-api-key',
      'content-type': 'application/json'
    }
  };

  // Parse body for POST requests
  if (body) {
    req.body = body;
  } else {
    req.body = {};
  }

  return req;
}

function mockResponse() {
  let statusCode = 200;
  let data = null;

  return {
    status: (code) => {
      statusCode = code;
      return {
        json: (body) => {
          data = body;
          return Promise.resolve();
        },
        end: () => Promise.resolve()
      };
    },
    setHeader: () => {},
    json: (body) => {
      data = body;
      return Promise.resolve();
    },
    getStatusCode: () => statusCode,
    getData: () => data
  };
}

console.log('🧪 Testing Security Fixes and Serverless Bug Resolution\n');

async function runTests() {
  let agentId, apiKey, token;

  // Generate random agent ID to avoid rate limit conflicts
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  try {
    // Test 1: Register API Key
    console.log('Test 1: Register API Key');
    const req1 = mockRequest('POST', '/api/v2/keys/register', { agentId: `test-agent-${randomSuffix}` });
    const res1 = mockResponse();
    await keysHandler(req1, res1);
    console.log(`✅ Status: ${res1.getStatusCode()}`);
    console.log(`✅ Data:`, res1.getData());
    agentId = res1.getData().agentId;
    apiKey = res1.getData().apiKey;
    console.log();

    // Test 2: Get JWT Token
    console.log('Test 2: Get JWT Token');
    const req2 = mockRequest('POST', '/api/v2/auth/token', { apiKey });
    const res2 = mockResponse();
    await authHandler(req2, res2);
    console.log(`✅ Status: ${res2.getStatusCode()}`);
    console.log(`✅ Token: ${res2.getData().token?.substring(0, 20)}...`);
    token = res2.getData().token;
    console.log();

    // Test 3: Get Random Challenge
    console.log('Test 3: Get Random Challenge');
    const req3 = mockRequest('GET', '/api/v2/challenges/random', null, token);
    const res3 = mockResponse();
    await challengesHandler(req3, res3);
    console.log(`✅ Status: ${res3.getStatusCode()}`);
    const challengeData = res3.getData();
    const challengeId = challengeData.challengeId;
    console.log(`✅ Challenge: ${challengeData.title} (${challengeId})`);
    console.log();

    // Test 4: Security Test - Token Manipulation (Should FAIL with 400)
    console.log('Test 4: Security Test - Token Manipulation Attempt');
    console.log(`   Using challengeId: ${challengeId}`);
    const shortAnswer = 'This is a very short answer.';
    const req4 = mockRequest('POST', '/api/v2/submissions', {
      challengeId,
      tokensUsed: 99999,  // Extremely high token count
      answer: shortAnswer,
      responseTime: 5000
    }, token);
    const res4 = mockResponse();
    await submissionsHandler(req4, res4);
    console.log(`Status: ${res4.getStatusCode()}`);
    if (res4.getStatusCode() === 400) {
      console.log(`✅ PASS: Token manipulation rejected`);
      console.log(`   Error: ${res4.getData().error || res4.getData().message}`);
      if (res4.getData().details) {
        console.log(`   Client reported: ${res4.getData().details.clientReported}`);
        console.log(`   Server estimated: ${res4.getData().details.serverEstimated}`);
      }
    } else {
      console.log(`❌ FAIL: Token manipulation should have been rejected!`);
    }
    console.log();

    // Test 5: Valid Submission
    console.log('Test 5: Valid Submission (Should Succeed)');
    const longAnswer = `
      고양이의 진화 과정은 수천만 년에 걸쳐 이루어졌습니다.
      원시 고양이는 작고 빠른 포식자였으며, 이후 다양한 환경에 적응했습니다.
      고양이과 동물들은 탁월한 사냥 능력과 유연한 몸을 갖추게 되었습니다.
      인류와의 공생은 약 1만 년 전부터 시작되었을 것으로 추정됩니다.
      이처럼 고양이는 자연 선택과 인간의 선택을 통해 현대의 다양한 품종으로 진화했습니다.
      고양이의 진화는 크게 여러 단계로 나눌 수 있습니다.
      첫 번째 단계는 야생 고양이의 출현입니다.
      두 번째 단계는 인간과의 공생 관계 형성입니다.
      세 번째 단계는 다양한 품종의 탄생입니다.
      네 번째 단계는 현대적인 반려묘의 발달입니다.
      다섯 번째 단계는 전 세계적인 확산입니다.
    `.trim().repeat(5);

    const req5 = mockRequest('POST', '/api/v2/submissions', {
      challengeId,
      tokensUsed: 2000,
      answer: longAnswer,
      responseTime: 5000
    }, token);
    const res5 = mockResponse();
    await submissionsHandler(req5, res5);
    console.log(`Status: ${res5.getStatusCode()}`);
    if (res5.getStatusCode() === 201) {
      console.log(`✅ PASS: Valid submission accepted`);
      console.log(`   Score: ${res5.getData().score}`);
      console.log(`   Submission ID: ${res5.getData().submissionId}`);
    } else {
      console.log(`❌ FAIL: Valid submission should have been accepted!`);
      console.log(`   Error: ${res5.getData().error || res5.getData().message}`);
      console.log(`   Validation:`, JSON.stringify(res5.getData().validation, null, 2));
    }
    console.log();

    // Test 6: Start Game
    console.log('Test 6: Start Game (Serverless Bug Fix Test)');
    const req6 = mockRequest('POST', '/api/v2/games/start', null, token);
    const res6 = mockResponse();
    await gamesHandler(req6, res6);
    console.log(`✅ Status: ${res6.getStatusCode()}`);
    console.log(`✅ Game ID: ${res6.getData().gameId}`);
    console.log(`✅ Status: ${res6.getData().status}`);
    const gameId = res6.getData().gameId;
    console.log();

    // Test 7: Game Action (Previously returned 404, should now work)
    console.log('Test 7: Game Action (Serverless Bug Fix Test)');
    const req7 = mockRequest('POST', `/api/v2/games/${gameId}/actions`, {
      method: 'chainOfThoughtExplosion',
      tokensBurned: 1000,
      text: 'Sample text for action',
      inefficiencyScore: 50
    }, token);
    const res7 = mockResponse();
    await actionsHandler(req7, res7);
    console.log(`Status: ${res7.getStatusCode()}`);
    if (res7.getStatusCode() === 200) {
      console.log(`✅ PASS: Game action successful (Serverless bug fixed!)`);
      console.log(`   Tokens burned: ${res7.getData().tokensBurned}`);
      console.log(`   Score: ${res7.getData().score}`);
    } else if (res7.getStatusCode() === 404) {
      console.log(`❌ FAIL: Game not found (Serverless bug still exists!)`);
    } else {
      console.log(`   Error: ${res7.getData().error}`);
    }
    console.log();

    // Test 8: Check Leaderboard
    console.log('Test 8: Check Leaderboard');
    const req8 = mockRequest('GET', '/api/v2/leaderboard', null, token);
    const res8 = mockResponse();
    await leaderboardHandler(req8, res8);
    console.log(`✅ Status: ${res8.getStatusCode()}`);
    console.log(`✅ Total players: ${res8.getData().total}`);
    if (res8.getData().leaderboard?.length > 0) {
      console.log(`✅ Top player: ${res8.getData().leaderboard[0].agentId}`);
      console.log(`✅ Top score: ${res8.getData().leaderboard[0].totalScore}`);
    }
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

runTests();
