// Set environment variables BEFORE importing modules
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is required');
}
process.env.JWT_SECRET = 'test-secret-key-for-testing';

// Now dynamically import modules
const { default: keysHandler } = await import('../api/v2/keys.js');
const { default: authHandler } = await import('../api/v2/auth.js');
const { default: submissionsHandler } = await import('../api/v2/submissions.js');

async function test() {
  // Clear rate limits first
  const pg = await import('pg');
  const { Pool } = pg.default;
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM rate_limits');
    await client.query('DELETE FROM api_keys');
    console.log('✅ Cleared rate limits');
  } finally {
    client.release();
    await pool.end();
  }

  // Register
  console.log('1. Registering API key...');
  const req1 = { method: 'POST', url: '/api/v2/keys/register', body: { agentId: 'test-simple-sub' }, headers: {} };
  let res1Data = null;
  let res1Code = null;
  const res1 = {
    status: (c) => {
      res1Code = c;
      return {
        json: (d) => { res1Data = d; return Promise.resolve(); },
        end: () => Promise.resolve()
      };
    },
    setHeader: () => {},
    getStatusCode: () => res1Code,
    getData: () => res1Data
  };
  await keysHandler(req1, res1);
  console.log(`   Status: ${res1Code}`);
  console.log(`   Response:`, res1Data);

  if (res1Code !== 201 || !res1Data?.apiKey) {
    console.log('❌ Failed to register API key');
    return;
  }

  // Get token
  console.log('2. Getting JWT token...');
  const req2 = { method: 'POST', url: '/api/v2/auth/token', body: { apiKey: res1Data.apiKey }, headers: {} };
  let res2Data = null;
  let res2Code = null;
  const res2 = {
    status: (c) => {
      res2Code = c;
      return {
        json: (d) => { res2Data = d; return Promise.resolve(); },
        end: () => Promise.resolve()
      };
    },
    json: (d) => { res2Data = d; res2Code = 200; return Promise.resolve(); },
    setHeader: () => {}
  };
  await authHandler(req2, res2);
  console.log(`   Status: ${res2Code}`);

  if (res2Code !== 200 || !res2Data?.token) {
    console.log('❌ Failed to get token');
    console.log('   Response:', res2Data);
    return;
  }
  console.log(`   Token: ${res2Data.token.substring(0, 20)}...`);

  // Test 1: Token manipulation (should fail)
  console.log('3a. Testing token manipulation (should be rejected)...');
  const shortAnswer = 'Short answer.';
  const req3a = {
    method: 'POST',
    url: '/api/v2/submissions',
    body: { challengeId: 'cot_easy_001', tokensUsed: 99999, answer: shortAnswer },
    headers: { authorization: 'Bearer ' + res2Data.token }
  };
  let res3aData = null;
  let res3aCode = null;
  const res3a = {
    status: (c) => {
      res3aCode = c;
      return {
        json: (d) => { res3aData = d; return Promise.resolve(); },
        end: () => Promise.resolve()
      };
    },
    setHeader: () => {}
  };
  await submissionsHandler(req3a, res3a);
  console.log(`   Status: ${res3aCode}`);
  if (res3aCode === 400) {
    console.log('   ✅ PASS: Token manipulation rejected!');
  } else {
    console.log('   ❌ FAIL: Should have rejected token manipulation');
    console.log('   Response:', res3aData);
  }

  // Test 2: Valid submission (should succeed)
  console.log('3b. Testing valid submission (should be accepted)...');
  // Create a longer answer (~3000 characters for ~1200 tokens)
  const longAnswer = `
    고양이의 진화 과정은 수천만 년에 걸쳐 이루어진 놀라운 여정입니다.
    초기 고양이과 동물들은 작고 빠른 포식자로 시작했습니다.
    시간이 지나면서 다양한 환경에 적응하며 진화했습니다.
    현대 고양이의 조상은 야생에서 생존을 위해 탁월한 사냥 능력을 발달시켰습니다.
    고양이의 유연한 몸과 날카로운 발톱은 진화의 결과물입니다.
    인류와의 공생은 약 1만 년 전 시작된 것으로 추정됩니다.
    농경 사회의 발전과 함께 고양이는 곡물을 보호하는 역할을 했습니다.
    이로 인해 고양이와 인간의 관계는 더욱 깊어졌습니다.
    고양이는 독립적인 성격으로 인간과 공존할 수 있었습니다.
    다른 가축과 달리 고양이는 스스로 생존할 수 있는 능력을 유지했습니다.
    고양이의 감각 기관은 매우 발달되어 있습니다.
    특히 청각과 후각은 사냥에 최적화되어 있습니다.
    야간 시력도 뛰어나 어두운 곳에서도 사냥이 가능합니다.
    현대의 가축화된 고양이도 이러한 야생의 본능을 유지하고 있습니다.
    고양이의 품종 다양성은 인간의 선택적 교배로 인해 발생했습니다.
    19세기부터 본격적인 품종 개량이 시작되었습니다.
    현재 수백 개의 고양이 품종이 존재합니다.
    각 품종은 독특한 외모와 성격 특성을 가지고 있습니다.
    고양이의 진화는 자연 선택과 인간의 선택이 복합적으로 작용한 결과입니다.
    이 놀라운 동물은 수천만 년의 진화를 통해 현대의 모습을 갖추게 되었습니다.
    ${'고양이는 진화의 과학적 marvel입니다. '.repeat(30)}
  `.trim().repeat(3);

  // For Korean text: 1 token ≈ 2.5 characters
  // Use estimated tokens directly to match server calculation
  const req3b = {
    method: 'POST',
    url: '/api/v2/submissions',
    body: { challengeId: 'cot_easy_001', tokensUsed: 1450, answer: longAnswer },
    headers: { authorization: 'Bearer ' + res2Data.token }
  };
  let res3bData = null;
  let res3bCode = null;
  const res3b = {
    status: (c) => {
      res3bCode = c;
      return {
        json: (d) => { res3bData = d; return Promise.resolve(); },
        end: () => Promise.resolve()
      };
    },
    setHeader: () => {}
  };
  await submissionsHandler(req3b, res3b);
  console.log(`   Status: ${res3bCode}`);
  if (res3bCode === 201) {
    console.log('   ✅ PASS: Valid submission accepted!');
    console.log(`   Score: ${res3bData.score}`);
  } else {
    console.log('   ❌ FAIL: Should have accepted valid submission');
    console.log('   Response:', res3bData);
    if (res3bData?.validation) {
      console.log('   Validation:', JSON.stringify(res3bData.validation, null, 2));
    }
  }

  console.log('\n✅ All tests completed!');
}

test().catch(console.error);
