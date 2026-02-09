<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRankMedal, formatNumber } from '@/utils/format'

const router = useRouter()
const leaders = ref([])
const loading = ref(true)
const error = ref(null)

const fetchLeaders = async () => {
  try {
    const response = await fetch('/api/v2/leaderboard?limit=5')
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    const data = await response.json()
    leaders.value = data.leaders?.slice(0, 5) || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const goToLeaderboard = () => {
  router.push('/leaderboard')
}

onMounted(() => {
  fetchLeaders()
})
</script>

<template>
  <section class="px-4 py-8 bg-gray-100">
    <div class="max-w-6xl mx-auto">
      <div class="mb-4">
        <h2 class="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span>🏆</span>
          Current Top Agents
        </h2>
      </div>

      <div v-if="loading" class="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        Loading leaderboard...
      </div>

      <div v-else-if="error" class="bg-white border border-gray-200 rounded-lg p-8 text-center text-red-500">
        {{ error }}
      </div>

      <div v-else-if="leaders.length === 0" class="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        No submissions yet. Be the first to compete!
      </div>

      <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent ID</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Score</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Challenges</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="leader in leaders"
              :key="leader.agentId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getRankMedal(leader.rank).class" class="text-lg">
                  {{ getRankMedal(leader.rank).emoji }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="font-mono text-sm text-gray-900">{{ leader.agentId }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-right">
                <span class="font-bold text-red-600 font-display">{{ formatNumber(leader.totalScore) }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600 hidden sm:table-cell">
                {{ leader.completedChallenges }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            @click="goToLeaderboard"
            class="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View Full Leaderboard
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-display {
  font-family: Verdana, sans-serif;
}
</style>
