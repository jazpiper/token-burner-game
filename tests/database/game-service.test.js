// Game Service Tests
// Tests for game service database operations

import oracledb from 'oracledb';
import {
  isOracleConfigured,
  createTestRunner,
  assert,
  assertEqual,
  assertNotNull
} from './setup.js';
import * as gameService from '../../services/gameService.js';
import db from '../../services/db.js';

/**
 * Test createGame
 */
export async function testCreateGame() {
  const runner = createTestRunner('createGame Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping createGame tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_game_agent_${Date.now()}`;
  const testGameId = `test_game_${Date.now()}`;

  try {
    runner.test('should create a new game', async () => {
      const gameData = {
        gameId: testGameId,
        agentId: testAgentId,
        duration: 300 // 5 minutes
      };

      const game = await gameService.createGame(gameData);

      assertNotNull(game, 'Should return a game object');
      assertEqual(game.gameId, testGameId, 'Should match gameId');
      assertEqual(game.agentId, testAgentId, 'Should match agentId');
      assertEqual(game.status, 'playing', 'Status should be playing');
      assertEqual(game.tokensBurned, 0, 'Initial tokens burned should be 0');
      assertEqual(game.score, 0, 'Initial score should be 0');
      assertEqual(game.duration, 300, 'Duration should match');
    });

    runner.test('should calculate endsAt correctly', async () => {
      const gameId2 = `test_game_${Date.now()}_2`;
      const duration = 120; // 2 minutes

      const game = await gameService.createGame({
        gameId: gameId2,
        agentId: testAgentId,
        duration: duration
      });

      assertNotNull(game.endsAt, 'Should have endsAt');
      const endsAtTime = new Date(game.endsAt).getTime();
      const now = Date.now();
      // endsAt should be approximately duration milliseconds from now
      const diff = endsAtTime - now;
      assert(diff >= duration * 1000 - 5000 && diff <= duration * 1000 + 5000,
        'endsAt should be approximately duration from now');
    });

    runner.test('should set default values', async () => {
      const gameId3 = `test_game_${Date.now()}_3`;

      const game = await gameService.createGame({
        gameId: gameId3,
        agentId: testAgentId,
        duration: 300
      });

      assertEqual(game.complexityWeight, 1, 'Default complexityWeight should be 1');
      assertEqual(game.inefficiencyScore, 0, 'Default inefficiencyScore should be 0');
      assertNotNull(game.createdAt, 'Should have createdAt');
    });

    // Cleanup
    await db.query('DELETE FROM game_actions WHERE game_id LIKE :1', [`${testGameId}%`]);
    await db.query('DELETE FROM games WHERE game_id LIKE :1', [`${testGameId}%`]);
    await db.query('DELETE FROM games WHERE agent_id = :1', [testAgentId]);

  } catch (error) {
    console.error('Error in testCreateGame:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test getGameById
 */
export async function testGetGameById() {
  const runner = createTestRunner('getGameById Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping getGameById tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_get_game_${Date.now()}`;
  const testGameId = `test_game_get_${Date.now()}`;

  try {
    // Create a test game
    await gameService.createGame({
      gameId: testGameId,
      agentId: testAgentId,
      duration: 300
    });

    runner.test('should get game by ID', async () => {
      const game = await gameService.getGameById(testGameId);

      assertNotNull(game, 'Should return a game');
      assertEqual(game.gameId, testGameId, 'Should match gameId');
      assertEqual(game.agentId, testAgentId, 'Should match agentId');
      assertEqual(game.status, 'playing', 'Status should be playing');
    });

    runner.test('should return null for non-existent game', async () => {
      const game = await gameService.getGameById('nonexistent_game');

      assert(game === null, 'Should return null for non-existent game');
    });

    runner.test('should include totalActions count', async () => {
      const game = await gameService.getGameById(testGameId);

      assertNotNull(game.totalActions, 'Should have totalActions');
      assertEqual(game.totalActions, 0, 'Initial totalActions should be 0');
    });

    runner.test('should calculate timeLeft', async () => {
      const game = await gameService.getGameById(testGameId);

      assertNotNull(game.timeLeft, 'Should have timeLeft');
      assert(game.timeLeft >= 0 && game.timeLeft <= 300, 'timeLeft should be within duration');
    });

    // Cleanup
    await db.query('DELETE FROM game_actions WHERE game_id = :1', [testGameId]);
    await db.query('DELETE FROM games WHERE game_id = :1', [testGameId]);

  } catch (error) {
    console.error('Error in testGetGameById:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test updateGameStatus
 */
export async function testUpdateGameStatus() {
  const runner = createTestRunner('updateGameStatus Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping updateGameStatus tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_update_status_${Date.now()}`;
  const testGameId = `test_game_status_${Date.now()}`;

  try {
    await gameService.createGame({
      gameId: testGameId,
      agentId: testAgentId,
      duration: 300
    });

    runner.test('should update game status', async () => {
      await gameService.updateGameStatus(testGameId, 'paused');

      const game = await gameService.getGameById(testGameId);
      assertEqual(game.status, 'paused', 'Status should be updated');
    });

    runner.test('should update to finished', async () => {
      await gameService.updateGameStatus(testGameId, 'finished');

      const game = await gameService.getGameById(testGameId);
      assertEqual(game.status, 'finished', 'Status should be finished');
    });

    // Cleanup
    await db.query('DELETE FROM game_actions WHERE game_id = :1', [testGameId]);
    await db.query('DELETE FROM games WHERE game_id = :1', [testGameId]);

  } catch (error) {
    console.error('Error in testUpdateGameStatus:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test finishGame
 */
export async function testFinishGame() {
  const runner = createTestRunner('finishGame Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping finishGame tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_finish_${Date.now()}`;
  const testGameId = `test_game_finish_${Date.now()}`;

  try {
    // Create and score a game
    await gameService.createGame({
      gameId: testGameId,
      agentId: testAgentId,
      duration: 300
    });

    // Add some actions to create a score
    await gameService.addGameAction(testGameId, {
      method: 'test',
      tokensBurned: 100,
      complexityWeight: 1.0,
      inefficiencyScore: 0,
      textPreview: 'Test action'
    });

    runner.test('should finish game and return summary', async () => {
      const result = await gameService.finishGame(testGameId);

      assertNotNull(result, 'Should return a result');
      assertEqual(result.gameId, testGameId, 'Should match gameId');
      assertEqual(result.status, 'finished', 'Status should be finished');
      assertNotNull(result.finalScore, 'Should have finalScore');
      assertNotNull(result.tokensBurned, 'Should have tokensBurned');
      assertNotNull(result.totalActions, 'Should have totalActions');
    });

    runner.test('should return null for non-existent game', async () => {
      const result = await gameService.finishGame('nonexistent_game');

      assert(result === null, 'Should return null for non-existent game');
    });

    runner.test('should count total actions', async () => {
      const result = await gameService.finishGame(testGameId);

      assertNotNull(result.totalActions, 'Should have totalActions');
      assert(result.totalActions > 0, 'Should have at least one action');
    });

    // Cleanup
    await db.query('DELETE FROM game_actions WHERE game_id = :1', [testGameId]);
    await db.query('DELETE FROM games WHERE game_id = :1', [testGameId]);

  } catch (error) {
    console.error('Error in testFinishGame:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test addGameAction
 */
export async function testAddGameAction() {
  const runner = createTestRunner('addGameAction Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping addGameAction tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_action_${Date.now()}`;
  const testGameId = `test_game_action_${Date.now()}`;

  try {
    await gameService.createGame({
      gameId: testGameId,
      agentId: testAgentId,
      duration: 300
    });

    runner.test('should add game action', async () => {
      const actionData = {
        method: 'POST',
        tokensBurned: 150,
        complexityWeight: 1.5,
        inefficiencyScore: 10,
        textPreview: 'Test action preview'
      };

      const result = await gameService.addGameAction(testGameId, actionData);

      assertNotNull(result, 'Should return a result');
      assertEqual(result.tokensBurned, 150, 'Should match tokensBurned');
      assertEqual(result.complexityWeight, 1.5, 'Should match complexityWeight');
      assertEqual(result.inefficiencyScore, 10, 'Should match inefficiencyScore');
    });

    runner.test('should update game totals', async () => {
      const beforeGame = await gameService.getGameById(testGameId);
      const beforeTokens = beforeGame.tokensBurned;

      await gameService.addGameAction(testGameId, {
        method: 'GET',
        tokensBurned: 50,
        complexityWeight: 0.5,
        inefficiencyScore: 5,
        textPreview: 'Another action'
      });

      const afterGame = await gameService.getGameById(testGameId);
      assertEqual(afterGame.tokensBurned, beforeTokens + 50, 'Tokens should be updated');
    });

    runner.test('should increment total actions count', async () => {
      const beforeGame = await gameService.getGameById(testGameId);
      const beforeActions = beforeGame.totalActions;

      await gameService.addGameAction(testGameId, {
        method: 'PUT',
        tokensBurned: 75,
        complexityWeight: 1.0,
        inefficiencyScore: 0,
        textPreview: 'Third action'
      });

      const afterGame = await gameService.getGameById(testGameId);
      assertEqual(afterGame.totalActions, beforeActions + 1, 'Actions count should increment');
    });

    runner.test('should handle transaction correctly', async () => {
      const beforeGame = await gameService.getGameById(testGameId);

      // This should work atomically
      await gameService.addGameAction(testGameId, {
        method: 'DELETE',
        tokensBurned: 100,
        complexityWeight: 1.2,
        inefficiencyScore: 15,
        textPreview: 'Transaction test action'
      });

      const afterGame = await gameService.getGameById(testGameId);

      // Both game and action should be updated
      assert(afterGame.tokensBurned > beforeGame.tokensBurned, 'Game should be updated');
      assert(afterGame.totalActions > beforeGame.totalActions, 'Action count should increase');
    });

    // Cleanup
    await db.query('DELETE FROM game_actions WHERE game_id = :1', [testGameId]);
    await db.query('DELETE FROM games WHERE game_id = :1', [testGameId]);

  } catch (error) {
    console.error('Error in testAddGameAction:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Test game expiration
 */
export async function testGameExpiration() {
  const runner = createTestRunner('Game Expiration Tests');

  if (!isOracleConfigured()) {
    console.log('\n⚠️  Skipping game expiration tests - Oracle DB not configured');
    return false;
  }

  const testAgentId = `test_expire_${Date.now()}`;
  const testGameId = `test_game_expire_${Date.now()}`;

  try {
    runner.test('should auto-finish expired game', async () => {
      // Create a game with very short duration (1 second)
      await gameService.createGame({
        gameId: testGameId,
        agentId: testAgentId,
        duration: 1
      });

      // Wait for game to expire
      await new Promise(resolve => setTimeout(resolve, 2000));

      const game = await gameService.getGameById(testGameId);

      assertEqual(game.status, 'finished', 'Game should be auto-finished');
      assertEqual(game.timeLeft, 0, 'Time left should be 0');
    });

    // Cleanup
    await db.query('DELETE FROM game_actions WHERE game_id = :1', [testGameId]);
    await db.query('DELETE FROM games WHERE game_id = :1', [testGameId]);

  } catch (error) {
    console.error('Error in testGameExpiration:', error);
    throw error;
  }

  return await runner.run();
}

/**
 * Run all game service tests
 */
export async function runGameServiceTests() {
  const results = [];

  results.push(await testCreateGame());
  results.push(await testGetGameById());
  results.push(await testUpdateGameStatus());
  results.push(await testFinishGame());
  results.push(await testAddGameAction());
  results.push(await testGameExpiration());

  return results.every(r => r);
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGameServiceTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
