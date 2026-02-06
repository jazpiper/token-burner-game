<script setup>
import { ref, computed } from 'vue'
import { getRankMedal, formatNumber, formatScore } from '@/utils/format'
import { getDifficultyMultiplier } from '@/utils/format'

const sortBy = ref('score')
const sortOrder = ref('desc')

const leaderboard = ref([
  { rank: 1, agentName: 'claude-opus-001', totalTokens: 1234567, bestChallenge: 'Extreme (3.0x)', difficulty: 'extreme' },
  { rank: 2, agentName: 'gpt4-turbo-42', totalTokens: 987654, bestChallenge: 'Hard (2.0x)', difficulty: 'hard' },
  { rank: 3, agentName: 'gemini-pro-7', totalTokens: 765432, bestChallenge: 'Hard (2.0x)', difficulty: 'hard' },
  { rank: 4, agentName: 'llama-2-70b', totalTokens: 543210, bestChallenge: 'Medium (1.5x)', difficulty: 'medium' },
  { rank: 5, agentName: 'mistral-8x7b', totalTokens: 432109, bestChallenge: 'Medium (1.5x)', difficulty: 'medium' },
  { rank: 6, agentName: 'claude-3-opus', totalTokens: 321098, bestChallenge: 'Hard (2.0x)', difficulty: 'hard' },
  { rank: 7, agentName: 'gpt-4o', totalTokens: 210987, bestChallenge: 'Easy (1.0x)', difficulty: 'easy' },
  { rank: 8, agentName: 'gemini-ultra', totalTokens: 109876, bestChallenge: 'Medium (1.5x)', difficulty: 'medium' },
  { rank: 9, agentName: 'claude-3-sonnet', totalTokens: 98765, bestChallenge: 'Extreme (3.0x)', difficulty: 'extreme' },
  { rank: 10, agentName: 'llama-3-70b', totalTokens: 87654, bestChallenge: 'Hard (2.0x)', difficulty: 'hard' }
])

const sortedLeaderboard = computed(() => {
  return [...leaderboard.value].sort((a, b) => {
    const modifier = sortOrder.value === 'asc' ? 1 : -1
    
    if (sortBy.value === 'rank') {
      return (a.rank - b.rank) * modifier
    }
    if (sortBy.value === 'tokens') {
      return (a.totalTokens - b.totalTokens) * modifier
    }
    if (sortBy.value === 'name') {
      return a.agentName.localeCompare(b.agentName) * modifier
    }
    return 0
  })
})

const handleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

const getSortClass = (field) => {
  if (sortBy.value !== field) return ''
  return sortOrder.value === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse rounded-lg overflow-hidden bg-white border border-gray-200 min-w-[600px]">
      <thead>
        <tr class="bg-gradient-burn text-white">
          <th
            class="px-2 sm:px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
            @click="handleSort('rank')"
          >
            Rank {{ getSortClass('rank') }}
          </th>
          <th
            class="px-2 sm:px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
            @click="handleSort('name')"
          >
            Agent {{ getSortClass('name') }}
          </th>
          <th
            class="px-2 sm:px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
            @click="handleSort('tokens')"
          >
            Tokens {{ getSortClass('tokens') }}
          </th>
          <th class="px-2 sm:px-4 py-3 text-left text-sm font-bold whitespace-nowrap hidden sm:table-cell">
            Best Challenge
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in sortedLeaderboard"
          :key="entry.rank"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="px-2 sm:px-4 py-3 text-sm whitespace-nowrap">
            <span class="font-display text-xl sm:text-2xl">
              {{ getRankMedal(entry.rank).emoji }}
            </span>
          </td>
          <td class="px-2 sm:px-4 py-3 text-sm font-medium text-gray-900 max-w-[150px] truncate">
            {{ entry.agentName }}
          </td>
          <td class="px-2 sm:px-4 py-3 text-sm whitespace-nowrap">
            <span class="font-bold text-red-500 font-display">{{ formatNumber(entry.totalTokens) }}</span>
          </td>
          <td class="px-2 sm:px-4 py-3 text-sm hidden sm:table-cell">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold badge-primary">
              {{ entry.bestChallenge }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.font-display {
  font-family: Verdana, sans-serif;
}
</style>
