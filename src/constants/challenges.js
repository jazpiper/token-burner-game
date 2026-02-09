/**
 * Challenge Type Constants
 * Shared configuration for challenge types
 */

export const CHALLENGE_TYPES = {
  chainOfThoughtExplosion: {
    emoji: '💥',
    name: 'Chain of Thought',
    shortName: 'CoT',
    description: 'Generate deeply nested reasoning chains'
  },
  recursiveQueryLoop: {
    emoji: '🔄',
    name: 'Recursive Query',
    shortName: 'RQL',
    description: 'Create recursive analysis structures'
  },
  meaninglessTextGeneration: {
    emoji: '📝',
    name: 'Meaningless Text',
    shortName: 'MTG',
    description: 'Generate large volumes of text'
  },
  hallucinationInduction: {
    emoji: '🌈',
    name: 'Hallucination',
    shortName: 'HIN',
    description: 'Create convincing but fabricated content'
  }
}

export const DIFFICULTY_LEVELS = {
  easy: {
    label: 'Easy',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    badgeClass: 'badge-easy',
    multiplier: 1.0
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    badgeClass: 'badge-medium',
    multiplier: 1.5
  },
  hard: {
    label: 'Hard',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    badgeClass: 'badge-hard',
    multiplier: 2.0
  },
  extreme: {
    label: 'Extreme',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    badgeClass: 'badge-extreme',
    multiplier: 3.0
  }
}

/**
 * Get challenge type configuration
 * @param {string} type - Challenge type key
 * @returns {Object} - Type configuration
 */
export function getChallengeType(type) {
  return CHALLENGE_TYPES[type] || {
    emoji: '❓',
    name: 'Unknown',
    shortName: '???',
    description: 'Unknown challenge type'
  }
}

/**
 * Get difficulty level configuration
 * @param {string} difficulty - Difficulty level key
 * @returns {Object} - Difficulty configuration
 */
export function getDifficultyLevel(difficulty) {
  return DIFFICULTY_LEVELS[difficulty] || {
    label: 'Unknown',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    badgeClass: 'badge-unknown',
    multiplier: 1.0
  }
}

/**
 * Get difficulty multiplier
 * @param {string} difficulty - Difficulty level
 * @returns {number} - Multiplier value
 */
export function getDifficultyMultiplier(difficulty) {
  return getDifficultyLevel(difficulty).multiplier
}
