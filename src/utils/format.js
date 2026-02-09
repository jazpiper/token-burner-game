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

export const getRankMedal = (rank) => {
  if (rank === 1) return { emoji: '🥇', class: 'text-yellow-400' }
  if (rank === 2) return { emoji: '🥈', class: 'text-gray-300' }
  if (rank === 3) return { emoji: '🥉', class: 'text-amber-600' }
  return { emoji: `#${rank}`, class: 'text-gray-400' }
}
