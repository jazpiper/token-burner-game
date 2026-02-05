// API v2 Routes
// All API endpoints for the Token Burner Game

import express from 'express';
import {
  getRandomChallenge,
  getChallengeById,
  getAllChallenges,
  getChallengeTopScore
} from '../services/challengeService.js';
import {
  createSubmission,
  getSubmissionById,
  getAgentSubmissions
} from '../services/submissionService.js';
import { validateSubmission, calculateScore } from '../services/validationService.js';
import { getLeaderboard, getAgentRank } from '../services/leaderboardService.js';
import { authenticate, registerApiKey, generateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// Authentication Endpoints
// ============================================================================

// Register API Key
router.post('/keys/register', (req, res) => {
  try {
    const { agentId } = req.body;
    const apiData = registerApiKey(agentId);

    res.json({
      apiKey: apiData.apiKey,
      agentId: apiData.agentId,
      instructions: 'Use this API Key in X-API-Key header or obtain a JWT token from /auth/token'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register API key'
    });
  }
});

// Get JWT Token
router.post('/auth/token', (req, res) => {
  try {
    const { agentId, apiKey } = req.body;

    if (!agentId || !apiKey) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'agentId and apiKey are required'
      });
    }

    const token = generateToken(agentId, apiKey);

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.json({
      token,
      expiresAt: expiresAt.toISOString(),
      tokenType: 'Bearer'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate token'
    });
  }
});

// ============================================================================
// Challenge Endpoints
// ============================================================================

// Get random challenge
router.get('/challenges/random', authenticate, (req, res) => {
  try {
    const { difficulty, type } = req.query;

    const challenge = getRandomChallenge({ difficulty, type });

    if (!challenge) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No challenges found matching the criteria'
      });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch random challenge'
    });
  }
});

// Get challenge by ID
router.get('/challenges/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const challenge = getChallengeById(id);

    if (!challenge) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Challenge not found'
      });
    }

    // Add top score
    const topScore = getChallengeTopScore(id);

    res.json({
      ...challenge,
      topScore
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch challenge'
    });
  }
});

// Get all challenges
router.get('/challenges', authenticate, (req, res) => {
  try {
    const { difficulty, type, page = 1, limit = 20 } = req.query;

    const result = getAllChallenges(
      { difficulty, type },
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch challenges'
    });
  }
});

// ============================================================================
// Submission Endpoints
// ============================================================================

// Create submission
router.post('/submissions', authenticate, async (req, res) => {
  try {
    const { agentId } = req;
    const { challengeId, tokensUsed, answer, responseTime } = req.body;

    // Validate required fields
    if (!challengeId || tokensUsed === undefined || !answer) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'challengeId, tokensUsed, and answer are required'
      });
    }

    // Validate data types
    if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'tokensUsed must be a positive number'
      });
    }

    // Prepare submission data
    const submissionData = {
      agentId,
      challengeId,
      tokensUsed,
      answer,
      responseTime: responseTime || 0
    };

    // Validate submission
    const validation = await validateSubmission(submissionData, challengeId);

    // Get challenge for score calculation
    const challenge = getChallengeById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Challenge not found'
      });
    }

    // If validation failed, reject
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation Failed',
        message: 'Submission validation failed',
        validation
      });
    }

    // Calculate score
    const scoreResult = calculateScore(submissionData, challenge);

    // Create submission
    const submission = createSubmission({
      ...submissionData,
      score: scoreResult.score,
      validation
    });

    // Get agent's rank
    const rankResult = getAgentRank(agentId);

    res.status(201).json({
      submissionId: submission.submissionId,
      score: submission.score,
      ranking: rankResult.rank,
      difficultyMultiplier: scoreResult.difficultyMultiplier,
      qualityMultiplier: scoreResult.qualityMultiplier,
      validation: {
        valid: validation.valid,
        warnings: validation.warnings
      },
      createdAt: new Date(submission.createdAt).toISOString()
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create submission'
    });
  }
});

// Get submission by ID
router.get('/submissions/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const submission = getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found'
      });
    }

    res.json({
      ...submission,
      submittedAt: new Date(submission.createdAt).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch submission'
    });
  }
});

// Get agent's submissions
router.get('/submissions', authenticate, (req, res) => {
  try {
    const { agentId } = req;
    const { challengeId, page = 1, limit = 20 } = req.query;

    const result = getAgentSubmissions(
      agentId,
      { challengeId },
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch submissions'
    });
  }
});

// ============================================================================
// Leaderboard Endpoints
// ============================================================================

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const { type, difficulty, page = 1, limit = 100 } = req.query;

    let leaderboard = getLeaderboard({ type, difficulty });

    // Pagination
    const total = leaderboard.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = leaderboard.slice(offset, offset + parseInt(limit));

    res.json({
      leaderboard: paginated,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Get agent's rank
router.get('/leaderboard/me', authenticate, (req, res) => {
  try {
    const { agentId } = req;
    const { type, difficulty } = req.query;

    const rankResult = getAgentRank(agentId, { type, difficulty });

    res.json(rankResult);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agent rank'
    });
  }
});

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

export default router;
