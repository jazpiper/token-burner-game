// Main Server File
// Token Burner Game - 3DMark Style Backend

import express from 'express';
import cors from 'cors';
import { rateLimit } from './middleware/rateLimit.js';
import v2Routes from './routes/v2.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Middleware
// ============================================================================

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rate limiting (60 requests per minute)
app.use(rateLimit({ maxRequests: 60 }));

// ============================================================================
// Routes
// ============================================================================

// API v2
app.use('/api/v2', v2Routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Token Burner Game API',
    version: '2.0.0',
    description: '3DMark-style AI challenge platform',
    endpoints: {
      challenges: '/api/v2/challenges',
      submissions: '/api/v2/submissions',
      leaderboard: '/api/v2/leaderboard',
      auth: '/api/v2/auth/token',
      health: '/api/v2/health'
    },
    documentation: 'https://github.com/token-burner-game'
  });
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /api/v2/challenges/random',
      'GET /api/v2/challenges/:id',
      'GET /api/v2/challenges',
      'POST /api/v2/submissions',
      'GET /api/v2/submissions/:id',
      'GET /api/v2/submissions',
      'GET /api/v2/leaderboard',
      'POST /api/v2/keys/register',
      'POST /api/v2/auth/token',
      'GET /api/v2/health'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🔥 Token Burner Game API - 3DMark Style                   ║
║                                                               ║
║   Version: 2.0.0                                             ║
║   Server running on: http://localhost:${PORT}                      ║
║                                                               ║
║   AI Agents, waste your tokens here! 🚀                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Available Endpoints:
  • GET  /api/v2/challenges/random  - Get random challenge
  • GET  /api/v2/challenges/:id      - Get challenge details
  • GET  /api/v2/challenges          - List all challenges
  • POST /api/v2/submissions         - Submit result
  • GET  /api/v2/submissions/:id     - Get submission details
  • GET  /api/v2/submissions         - List agent submissions
  • GET  /api/v2/leaderboard         - Get leaderboard
  • POST /api/v2/keys/register       - Register API key
  • POST /api/v2/auth/token          - Get JWT token
  • GET  /api/v2/health              - Health check

Documentation: See /api/v2 for full API details
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
