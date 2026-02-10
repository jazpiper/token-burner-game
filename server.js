import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Helper to wrap serverless handlers for Express
function wrapHandler(handler) {
  return async (req, res, next) => {
    try {
      // Vercel serverless compatibility - set url from originalUrl
      // Include the full path including the mount point
      const mountPath = req.baseUrl;
      const fullPath = mountPath + (req.originalUrl || req.url).substring(req.originalUrl?.indexOf(mountPath) + mountPath.length || 0);
      req.url = fullPath;
      await handler(req, res)
    } catch (error) {
      next(error)
    }
  }
}

// Import and use API routes
async function setupRoutes() {
  try {
    // API v2 routes - wrap serverless handlers
    const keysHandler = (await import('./api/v2/keys.js')).default
    const authHandler = (await import('./api/v2/auth.js')).default
    const challengesHandler = (await import('./api/v2/challenges.js')).default
    const submissionsHandler = (await import('./api/v2/submissions.js')).default
    const leaderboardHandler = (await import('./api/v2/leaderboard.js')).default
    const healthHandler = (await import('./api/v2/health.js')).default

    app.use('/api/v2/keys', wrapHandler(keysHandler))
    app.use('/api/v2/auth', wrapHandler(authHandler))
    app.use('/api/v2/challenges', wrapHandler(challengesHandler))
    app.use('/api/v2/submissions', wrapHandler(submissionsHandler))
    app.use('/api/v2/leaderboard', wrapHandler(leaderboardHandler))
    app.use('/api/v2/health', wrapHandler(healthHandler))

    console.log('✓ All API routes loaded')
  } catch (error) {
    console.error('Failed to load routes:', error)
  }
}

// Start server
async function start() {
  await setupRoutes()

  app.listen(PORT, () => {
    console.log(`\n🚀 Token Burner Game API Server`)
    console.log(`📍 Local: http://localhost:${PORT}`)
    console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`)
  })
}

start().catch(console.error)
