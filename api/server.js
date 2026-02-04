/**
 * Token Burner Game API Server
 * 하이브리드 방식: 인간용 웹 UI + AI용 REST API
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import v2Routes from './routes/v2.js';
import { authenticateAny } from './middleware/auth.js';
import { generalRateLimit } from './middleware/rateLimit.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalRateLimit);

// API 라우트
app.use('/api/v2', v2Routes);

// 헬스체크
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'Token Burner Game API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/v2/auth/token',
      games: '/api/v2/games',
      leaderboard: '/api/v2/leaderboard',
      health: '/api/v2/health'
    }
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Token Burner Game API Server       ║
║                                      ║
║   🎮 Version: 2.0.0                 ║
║   🔥 Mode: Hybrid (Web + AI)       ║
║   🌐 Port: ${PORT}                       ║
║   📊 Health: /health                  ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
