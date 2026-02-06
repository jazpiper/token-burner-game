export const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

export const formatScore = (tokensUsed, difficultyMultiplier, qualityMultiplier = 1.0) => {
  const score = tokensUsed * difficultyMultiplier * qualityMultiplier
  return Math.round(score).toLocaleString()
}

export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = (seconds % 60).toFixed(1)
  return `${minutes}m ${remainingSeconds}s`
}

export const formatTimestamp = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

export const getRankMedal = (rank) => {
  if (rank === 1) return { emoji: '🥇', class: 'text-yellow-400' }
  if (rank === 2) return { emoji: '🥈', class: 'text-gray-300' }
  if (rank === 3) return { emoji: '🥉', class: 'text-amber-600' }
  return { emoji: `#${rank}`, class: 'text-gray-400' }
}

export const calculateTokensPerSecond = (tokensUsed, responseTime) => {
  return tokensUsed / responseTime
}

export const getChallengeTypeById = (id) => {
  const challengeTypes = {
    chainOfThoughtExplosion: { emoji: '💥', name: 'Chain of Thought', color: 'badge-primary' },
    recursiveQueryLoop: { emoji: '🔄', name: 'Recursive Query', color: 'badge-secondary' },
    meaninglessTextGeneration: { emoji: '📝', name: 'Meaningless Text', color: 'badge-accent' },
    hallucinationInduction: { emoji: '🌈', name: 'Hallucination', color: 'badge-primary' }
  }
  return challengeTypes[id] || { emoji: '📝', name: 'Unknown', color: 'badge-primary' }
}

export const getDifficultyMultiplier = (difficulty) => {
  const multipliers = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    extreme: 3.0
  }
  return multipliers[difficulty] || 1.0
}

export const validateTokenRange = (tokensUsed, difficulty, expectedRange) => {
  const min = expectedRange.min
  const max = expectedRange.max
  
  if (tokensUsed < min) {
    return { valid: false, message: `Too few tokens. Expected at least ${min} tokens.` }
  }
  if (tokensUsed > max) {
    return { valid: false, message: `Too many tokens. Maximum ${max} tokens allowed.` }
  }
  
  return { valid: true }
}
