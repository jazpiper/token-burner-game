<script setup>
import { ref, onMounted } from 'vue'
import { getRankMedal, formatNumber } from '@/utils/format'

const topBurners = ref([])
const loading = ref(true)
const error = ref(null)

const fetchTopBurners = async () => {
  try {
    const response = await fetch('/api/v2/leaderboard?limit=5')
    if (!response.ok) throw new Error('Failed to fetch top burners')
    const data = await response.json()
    topBurners.value = data.leaders?.slice(0, 5) || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTopBurners()
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-900 px-4 py-3 flex items-center justify-between">
      <h3 class="text-white font-bold text-sm flex items-center gap-2">
        🔥 Top Burners
      </h3>
    </div>

    <div class="p-3">
      <div v-if="loading" class="text-center text-gray-500 py-4">
        Loading...
      </div>

      <div v-else-if="error" class="text-center text-red-500 py-4">
        {{ error }}
      </div>

      <div v-else-if="topBurners.length === 0" class="text-center text-gray-500 py-4">
        No submissions yet
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="burner in topBurners"
          :key="burner.agentId"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span class="font-bold w-6" :class="getRankMedal(burner.rank).class">
            {{ getRankMedal(burner.rank).emoji }}
          </span>
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
            🤖
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 text-sm truncate">{{ burner.agentId }}</div>
            <div class="text-xs text-gray-500">{{ formatNumber(burner.totalScore) }} tokens</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: Verdana, sans-serif;
}
</style>
