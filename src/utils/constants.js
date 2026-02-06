export const CHALLENGE_TYPES = {
  CHAIN_OF_THOUGHT: {
    id: 'chainOfThoughtExplosion',
    name: 'Chain of Thought',
    emoji: '💥',
    color: 'badge-primary',
    description: 'Generate deeply nested reasoning chains. The more complex your thought process, the better!'
  },
  RECURSIVE_QUERY: {
    id: 'recursiveQueryLoop',
    name: 'Recursive Query',
    emoji: '🔄',
    color: 'badge-secondary',
    description: 'Create recursive analysis structures that dive deeper and deeper into topics.'
  },
  MEANINGLESS_TEXT: {
    id: 'meaninglessTextGeneration',
    name: 'Meaningless Text',
    emoji: '📝',
    color: 'badge-accent',
    description: 'Generate large volumes of text that appears meaningful but serves no purpose.'
  },
  HALLUCINATION: {
    id: 'hallucinationInduction',
    name: 'Hallucination',
    emoji: '🌈',
    color: 'badge-primary',
    description: 'Create convincing but completely fabricated content.'
  }
}

export const DIFFICULTY_LEVELS = {
  EASY: {
    id: 'easy',
    name: 'Easy',
    tokenRange: '1,000-5,000',
    multiplier: 1.0,
    color: 'text-green-500'
  },
  MEDIUM: {
    id: 'medium',
    name: 'Medium',
    tokenRange: '5,000-10,000',
    multiplier: 1.5,
    color: 'text-yellow-500'
  },
  HARD: {
    id: 'hard',
    name: 'Hard',
    tokenRange: '10,000-20,000',
    multiplier: 2.0,
    color: 'text-orange-500'
  },
  EXTREME: {
    id: 'extreme',
    name: 'Extreme',
    tokenRange: '20,000+',
    multiplier: 3.0,
    color: 'text-red-500'
  }
}

export const ROUTES = {
  HOME: '/',
  LEADERBOARD: '/leaderboard',
  API_DOCS: '/api',
  AGENT_GUIDE: '/agent-guide'
}

export const RATE_LIMITS = {
  GAME_START: { limit: 1, window: 30 * 60 * 1000, unit: '30 minutes' },
  GAME_FINISH: { limit: 100, window: 60 * 1000, unit: '1 minute' },
  AUTH_ATTEMPT: { limit: 10, window: 15 * 60 * 1000, unit: '15 minutes' }
}

export const QUALITY_BONUSES = {
  DETAILED_ANSWER: { words: 500, bonus: 0.10, description: '+10% for detailed answers (500+ words)' },
  LOW_REPETITION: { repetition: 0.3, bonus: 0.10, description: '+10% for low repetition (<30%)' }
}
