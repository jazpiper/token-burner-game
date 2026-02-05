import db from './db.js';

async function createGame(data) {
  const { gameId, agentId, duration } = data;

  const res = await db.query(
    `INSERT INTO games (game_id, agent_id, status, tokens_burned, complexity_weight, inefficiency_score, score, duration, ends_at)
     VALUES ($1, $2, 'playing', 0, 1, 0, 0, $3, CURRENT_TIMESTAMP + INTERVAL '1 second' * $3)
     RETURNING *`,
    [gameId, agentId, duration]
  );

  const row = res.rows[0];
  return {
    gameId: row.game_id,
    agentId: row.agent_id,
    status: row.status,
    tokensBurned: row.tokens_burned,
    complexityWeight: parseFloat(row.complexity_weight),
    inefficiencyScore: row.inefficiency_score,
    score: row.score,
    duration: row.duration,
    endsAt: row.ends_at,
    createdAt: row.created_at
  };
}

async function getGameById(gameId) {
  const res = await db.query(
    `SELECT g.*, COUNT(ga.action_id) as total_actions
     FROM games g
     LEFT JOIN game_actions ga ON g.game_id = ga.game_id
     WHERE g.game_id = $1
     GROUP BY g.game_id`,
    [gameId]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];

  const now = new Date();
  const endsAt = new Date(row.ends_at);
  const timeLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));
  let status = row.status;

  if (status === 'playing' && timeLeft === 0) {
    status = 'finished';
    try {
      await updateGameStatus(gameId, 'finished');
    } catch (e) {
      console.error('Failed to auto-finish game:', e.message);
    }
  }

  return {
    gameId: row.game_id,
    agentId: row.agent_id,
    status,
    tokensBurned: row.tokens_burned,
    complexityWeight: parseFloat(row.complexity_weight),
    inefficiencyScore: row.inefficiency_score,
    score: row.score,
    timeLeft,
    totalActions: parseInt(row.total_actions),
    duration: row.duration,
    endsAt: row.ends_at
  };
}

async function updateGameStatus(gameId, status) {
  await db.query(
    'UPDATE games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE game_id = $2',
    [status, gameId]
  );
}

async function finishGame(gameId) {
  const res = await db.query(
    'UPDATE games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE game_id = $2 RETURNING *',
    ['finished', gameId]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];
  const actionRes = await db.query(
    'SELECT COUNT(*) as count FROM game_actions WHERE game_id = $1',
    [gameId]
  );
  const totalActions = parseInt(actionRes.rows[0].count);

  return {
    gameId: row.game_id,
    status: row.status,
    finalScore: row.score,
    tokensBurned: row.tokens_burned,
    totalActions,
    duration: row.duration
  };
}

async function addGameAction(gameId, actionData) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO game_actions (game_id, method, tokens_burned, complexity_weight, inefficiency_score, text_preview)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        gameId,
        actionData.method,
        actionData.tokensBurned,
        actionData.complexityWeight,
        actionData.inefficiencyScore,
        actionData.textPreview
      ]
    );

    await client.query(
      `UPDATE games
       SET tokens_burned = tokens_burned + $1,
           complexity_weight = complexity_weight + $2,
           inefficiency_score = inefficiency_score + $3,
           score = (tokens_burned + $1) * (complexity_weight + $2) * 0.5 + (inefficiency_score + $3),
           updated_at = CURRENT_TIMESTAMP
       WHERE game_id = $4`,
      [
        actionData.tokensBurned,
        actionData.complexityWeight,
        actionData.inefficiencyScore,
        gameId
      ]
    );

    await client.query('COMMIT');

    const res = await db.query('SELECT * FROM games WHERE game_id = $1', [gameId]);
    const row = res.rows[0];

    return {
      tokensBurned: actionData.tokensBurned,
      complexityWeight: actionData.complexityWeight,
      inefficiencyScore: actionData.inefficiencyScore,
      score: row.score,
      textPreview: actionData.textPreview
    };
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to add game action:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

export {
  createGame,
  getGameById,
  updateGameStatus,
  finishGame,
  addGameAction
};
