/**
 * API Integration Test Script
 * Tests all API endpoints directly without HTTP server
 */

import { config } from 'dotenv'
config({ path: '.env' })

console.log('🧪 API Integration Tests')
console.log('=' .repeat(50))

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
}

// Test helper
async function test(name, fn) {
  try {
    const result = await fn()
    results.tests.push({ name, status: 'PASS', result })
    results.passed++
    console.log(`✓ ${name}`)
    return result
  } catch (error) {
    results.tests.push({ name, status: 'FAIL', error: error.message })
    results.failed++
    console.log(`✗ ${name}: ${error.message}`)
    throw error
  }
}

// Mock request/response objects
function createMockReq(body = {}, headers = {}, query = {}) {
  return {
    body,
    headers: headers || {},
    query,
    url: '',
    method: 'GET'
  }
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    setHeader(key, value) {
      this.headers[key] = value
      return this
    },
    json(data) {
      this.body = data
      return this
    },
    end() {
      return this
    }
  }
  return res
}

// Import handlers
const keysHandler = (await import('./api/v2/keys.js')).default
const authHandler = (await import('./api/v2/auth.js')).default
const challengesHandler = (await import('./api/v2/challenges.js')).default
const leaderboardHandler = (await import('./api/v2/leaderboard.js')).default

console.log('\n📝 Test 1: Register Agent')
try {
  const req = createMockReq({ agentId: 'direct-test-agent' })
  const res = createMockRes()
  await keysHandler(req, res)
  console.log('Status:', res.statusCode)
  console.log('Response:', JSON.stringify(res.body, null, 2))
} catch (error) {
  console.log('Error:', error.message)
}

console.log('\n📝 Test 2: Challenges List')
try {
  const req = createMockReq()
  req.url = '/api/v2/challenges'
  const res = createMockRes()
  await challengesHandler(req, res)
  console.log('Status:', res.statusCode)
  console.log('Response:', JSON.stringify(res.body, null, 2).substring(0, 200) + '...')
} catch (error) {
  console.log('Error:', error.message)
}

console.log('\n📝 Test 3: Leaderboard')
try {
  const req = createMockReq()
  req.url = '/api/v2/leaderboard'
  const res = createMockRes()
  await leaderboardHandler(req, res)
  console.log('Status:', res.statusCode)
  console.log('Response:', JSON.stringify(res.body, null, 2).substring(0, 200) + '...')
} catch (error) {
  console.log('Error:', error.message)
}

console.log('\n' + '='.repeat(50))
console.log(`Tests completed: ${results.passed} passed, ${results.failed} failed`)
